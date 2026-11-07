const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get executive dashboard metrics, recent orders, and inventory alerts
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin)
const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      revenueResult,
      totalOrders,
      pendingOrders,
      totalCustomers,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // 1. Net Revenue: Sum totalAmount of non-cancelled orders
      Order.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),

      // 2. Total Orders lifetime
      Order.countDocuments(),

      // 3. Pending Orders (awaiting packing, shipping, or fulfillment)
      Order.countDocuments({ status: { $in: ['PLACED', 'PACKED', 'SHIPPED'] } }),

      // 4. Total Customers registered
      User.countDocuments({ role: 'CUSTOMER' }),

      // 5. Recent 5 orders
      Order.find()
        .sort({ orderDate: -1, createdAt: -1 })
        .limit(5)
        .select('orderNumber customerName customerEmail totalAmount status orderDate'),

      // 6. Low stock products (inventory <= 5 units)
      Product.find({ stockQty: { $lte: 5 }, isActive: true })
        .populate('category', 'name')
        .sort({ stockQty: 1 })
        .limit(10)
        .select('name price stockQty imagePath productId category'),
    ]);

    const netRevenue = revenueResult.length > 0 ? Math.round(revenueResult[0].total * 100) / 100 : 0;

    res.status(200).json({
      success: true,
      metrics: {
        netRevenue,
        totalOrders,
        pendingOrders,
        totalCustomers,
      },
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
};
