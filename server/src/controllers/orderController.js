const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

// State machine allowed transitions
const ALLOWED_TRANSITIONS = {
  PLACED: ['PACKED', 'CANCELLED'],
  PACKED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

// @desc    Get current customer's order history
// @route   GET /api/v1/orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ orderDate: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details (with ownership enforcement)
// @route   GET /api/v1/orders/:id
// @access  Private (Customer/Admin)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    } else if (!isNaN(id)) {
      order = await Order.findOne({ orderNumber: Number(id) });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Authorization check: must be order owner or admin
    const isOwner = order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to view this order record.',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: List all orders with filters, search, pagination
// @route   GET /api/v1/admin/orders
// @access  Private (Admin)
const getAdminOrders = async (req, res, next) => {
  try {
    const { status, q, page = 1, limit = 15 } = req.query;

    const query = {};

    if (status && status.trim()) {
      query.status = status.trim().toUpperCase();
    }

    if (q && q.trim()) {
      const keyword = q.trim();
      const numKeyword = Number(keyword);
      const orClauses = [
        { customerName: { $regex: keyword, $options: 'i' } },
        { customerEmail: { $regex: keyword, $options: 'i' } },
        { shippingAddress: { $regex: keyword, $options: 'i' } },
      ];
      if (!isNaN(numKeyword)) {
        orClauses.push({ orderNumber: numKeyword });
      }
      query.$or = orClauses;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(query).sort({ orderDate: -1, createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Advance order status according to finite state machine
// @route   PATCH /api/v1/admin/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Target order status is required.',
      });
    }

    const targetStatus = status.trim().toUpperCase();
    const validStatuses = ['PLACED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${targetStatus}'. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    } else if (!isNaN(id)) {
      order = await Order.findOne({ orderNumber: Number(id) });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const currentStatus = order.status;

    // Check if current status is terminal
    if (currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: `Order #${order.orderNumber || order._id} is in terminal state '${currentStatus}' and cannot be modified further.`,
      });
    }

    // Validate state machine transition
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Illegal transition: Cannot change order status from '${currentStatus}' to '${targetStatus}'. Allowed transitions: ${allowed.join(', ') || 'None'}.`,
      });
    }

    // If order is cancelled, restore inventory
    if (targetStatus === 'CANCELLED') {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQty: item.quantity },
          });
        }
      }
    }

    order.status = targetStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order #${order.orderNumber || order._id} status transitioned from ${currentStatus} to ${targetStatus}.${targetStatus === 'CANCELLED' ? ' Inventory has been restored.' : ''}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,
};
