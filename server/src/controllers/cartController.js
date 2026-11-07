const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to format and calculate populated cart
const formatCartResponse = (cart) => {
  let totalAmount = 0;
  let totalQuantity = 0;

  const validItems = [];

  for (const item of cart.items) {
    if (item.product && typeof item.product === 'object') {
      const price = item.product.price || 0;
      const subtotal = Math.round(price * item.quantity * 100) / 100;
      totalAmount += subtotal;
      totalQuantity += item.quantity;

      validItems.push({
        _id: item._id,
        id: item._id,
        product: item.product,
        quantity: item.quantity,
        subtotal,
      });
    }
  }

  return {
    id: cart._id,
    userId: cart.user,
    items: validItems,
    totalAmount: Math.round(totalAmount * 100) / 100,
    itemCount: totalQuantity,
    lineItemCount: validItems.length,
  };
};

// @desc    Get current user's persistent cart
// @route   GET /api/v1/cart
// @access  Private (Customer)
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name categoryId' },
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a product to cart or increment quantity
// @route   POST /api/v1/cart/items
// @access  Private (Customer)
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer greater than zero.',
      });
    }

    // Resolve product
    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else if (!isNaN(productId)) {
      product = await Product.findOne({ productId: Number(productId) });
    }

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or is currently unavailable.',
      });
    }

    if (product.stockQty <= 0) {
      return res.status(400).json({
        success: false,
        message: `Sorry, '${product.name}' is temporarily out of stock.`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product is already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product._id.toString()
    );

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qty;
      if (newQty > product.stockQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${qty} more. Only ${product.stockQty} unit(s) of '${product.name}' available in stock (you already have ${cart.items[itemIndex].quantity} in cart).`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      if (qty > product.stockQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${qty} units. Only ${product.stockQty} unit(s) available in stock.`,
        });
      }
      cart.items.push({
        product: product._id,
        quantity: qty,
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name categoryId' },
    });

    res.status(200).json({
      success: true,
      message: `Added '${product.name}' to cart.`,
      cart: formatCartResponse(populatedCart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of an existing item in cart
// @route   PUT /api/v1/cart/items/:productId
// @access  Private (Customer)
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.',
      });
    }

    let product = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    } else if (!isNaN(productId)) {
      product = await Product.findOne({ productId: Number(productId) });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (qty > product.stockQty) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${qty}) exceeds available inventory (${product.stockQty}) for '${product.name}'.`,
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === product._id.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in your cart.',
      });
    }

    cart.items[itemIndex].quantity = qty;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name categoryId' },
    });

    res.status(200).json({
      success: true,
      message: 'Cart quantity updated.',
      cart: formatCartResponse(populatedCart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/v1/cart/items/:productId
// @access  Private (Customer)
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found.',
      });
    }

    let prodIdToMatch = productId;
    if (!mongoose.Types.ObjectId.isValid(productId) && !isNaN(productId)) {
      const p = await Product.findOne({ productId: Number(productId) });
      if (p) prodIdToMatch = p._id.toString();
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== prodIdToMatch.toString()
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name categoryId' },
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from your cart.',
      cart: formatCartResponse(populatedCart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/v1/cart
// @access  Private (Customer)
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Your cart has been cleared.',
      cart: {
        items: [],
        totalAmount: 0,
        itemCount: 0,
        lineItemCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
