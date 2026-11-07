const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { validateCheckoutInput } = require('../validators/inputValidators');

// @desc    Process atomic checkout from persistent cart
// @route   POST /api/v1/checkout
// @access  Private (Customer)
const processCheckout = async (req, res, next) => {
  const stockAdjustments = []; // To roll back in case of race condition or failure

  try {
    const { shippingAddress, paymentMethod } = req.body;

    const validation = validateCheckoutInput({ shippingAddress, paymentMethod });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    // 1. Fetch user's cart with product details
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name' },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping cart is currently empty. Please add items before checking out.',
      });
    }

    // 2. Pre-validate all items
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'An item in your cart is no longer available in our catalog. Please update your cart.',
        });
      }

      if (!item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product '${item.product.name}' has been discontinued or deactivated. Please remove it from your cart.`,
        });
      }

      if (item.product.stockQty < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for '${item.product.name}'. Requested ${item.quantity}, but only ${item.product.stockQty} unit(s) remain in stock.`,
        });
      }
    }

    // 3. Concurrency-safe atomic inventory decrement
    // Lock inventory row-by-row with conditional update
    for (const item of cart.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product._id,
          stockQty: { $gte: item.quantity },
          isActive: true,
        },
        {
          $inc: { stockQty: -item.quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        // Rollback any stock decrements previously performed in this transaction
        for (const adj of stockAdjustments) {
          await Product.findByIdAndUpdate(adj.productId, {
            $inc: { stockQty: adj.quantity },
          });
        }

        return res.status(409).json({
          success: false,
          message: `Stock conflict: '${item.product.name}' was just reserved by another customer. Please adjust your quantity.`,
        });
      }

      stockAdjustments.push({
        productId: item.product._id,
        quantity: item.quantity,
      });
    }

    // 4. Calculate prices and build immutable order item snapshots
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const p = item.product;
      const unitPrice = p.price;
      const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
      calculatedTotal += subtotal;

      orderItems.push({
        product: p._id,
        productId: p.productId || undefined,
        productName: p.name,
        productImage: p.imagePath || 'assets/images/placeholder.jpg',
        categoryName: p.category ? p.category.name : 'General',
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    calculatedTotal = Math.round(calculatedTotal * 100) / 100;

    // 5. Create immutable Order
    const order = await Order.create({
      user: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || '',
      shippingAddress: shippingAddress.trim(),
      paymentMethod,
      status: 'PLACED',
      totalAmount: calculatedTotal,
      items: orderItems,
      orderDate: new Date(),
    });

    // 6. Clear user's cart now that order is safely saved
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Your order has been placed successfully!',
      order,
    });
  } catch (error) {
    // Safety rollback if any unexpected failure occurred during order creation
    for (const adj of stockAdjustments) {
      try {
        await Product.findByIdAndUpdate(adj.productId, {
          $inc: { stockQty: adj.quantity },
        });
      } catch (rbErr) {
        console.error(`Failed to rollback stock for product ${adj.productId}:`, rbErr);
      }
    }
    next(error);
  }
};

module.exports = {
  processCheckout,
};
