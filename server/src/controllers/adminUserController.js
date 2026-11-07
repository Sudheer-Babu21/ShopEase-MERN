const User = require('../models/User');

// @desc    List registered user accounts directory (omits password hashes)
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('name email phone role createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
};
