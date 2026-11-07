const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ categoryId: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a category
// @route   POST /api/v1/admin/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be at least 2 characters long.',
      });
    }

    const trimmedName = name.trim();
    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Category '${trimmedName}' already exists.`,
      });
    }

    // Auto-generate categoryId if needed
    const lastCat = await Category.findOne({}, {}, { sort: { categoryId: -1 } });
    const categoryId = lastCat && lastCat.categoryId ? lastCat.categoryId + 1 : 1;

    const category = await Category.create({
      name: trimmedName,
      description: description ? description.trim() : '',
      categoryId,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/v1/admin/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    if (name) {
      const trimmedName = name.trim();
      const existing = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Another category with name '${trimmedName}' already exists.`,
        });
      }
      category.name = trimmedName;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/v1/admin/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    // Referential integrity check: prevent deletion if products are attached
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category '${category.name}' because ${productCount} product(s) are attached to it. Please reassign or delete those products first.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Category '${category.name}' was deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
