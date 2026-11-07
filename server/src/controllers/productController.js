const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { validateProductInput } = require('../validators/inputValidators');

// @desc    Get public catalog products with search, category filtering, sorting, pagination
// @route   GET /api/v1/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, q, sort, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    // Category filter (supports ObjectId, categoryId number, or category name)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else if (!isNaN(category)) {
        const cat = await Category.findOne({ categoryId: Number(category) });
        if (cat) query.category = cat._id;
      } else {
        const cat = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (cat) query.category = cat._id;
      }
    }

    // Keyword search filter (matches name or description)
    if (q && q.trim()) {
      const keyword = q.trim();
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default featured / newest
    if (sort === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'name_asc') {
      sortOptions = { name: 1 };
    } else if (sort === 'name_desc') {
      sortOptions = { name: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 12);
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name categoryId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      products,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details
// @route   GET /api/v1/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).populate('category', 'name categoryId description');
    } else if (!isNaN(id)) {
      product = await Product.findOne({ productId: Number(id) }).populate('category', 'name categoryId description');
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all products (including inactive) with filtering and pagination
// @route   GET /api/v1/admin/products
// @access  Private (Admin)
const getAdminProducts = async (req, res, next) => {
  try {
    const { category, q, page = 1, limit = 15 } = req.query;

    const query = {};

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else if (!isNaN(category)) {
        const cat = await Category.findOne({ categoryId: Number(category) });
        if (cat) query.category = cat._id;
      }
    }

    if (q && q.trim()) {
      const keyword = q.trim();
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate('category', 'name categoryId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      products,
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

// @desc    Admin: Create new product with optional image upload
// @route   POST /api/v1/admin/products
// @access  Private (Admin)
const createProduct = async (req, res, next) => {
  try {
    const { name, category, description, price, stockQty, isActive } = req.body;

    const validation = validateProductInput({ name, category, price, stockQty });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    // Verify category exists
    let catObj = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      catObj = await Category.findById(category);
    } else if (!isNaN(category)) {
      catObj = await Category.findOne({ categoryId: Number(category) });
    }
    if (!catObj) {
      return res.status(400).json({
        success: false,
        message: 'The selected category is invalid or does not exist.',
      });
    }

    // Handle image upload
    let imagePath = 'assets/images/placeholder.jpg';
    if (req.file) {
      imagePath = `uploads/${req.file.filename}`;
    } else if (req.body.imagePath) {
      imagePath = req.body.imagePath.trim();
    }

    // Auto-generate sequential productId
    const lastProduct = await Product.findOne({}, {}, { sort: { productId: -1 } });
    const productId = lastProduct && lastProduct.productId ? lastProduct.productId + 1 : 1;

    const product = await Product.create({
      name: name.trim(),
      category: catObj._id,
      description: description ? description.trim() : '',
      price: Number(price),
      stockQty: Number(stockQty),
      imagePath,
      isActive: isActive === undefined ? true : String(isActive) === 'true' || isActive === 1 || isActive === true,
      productId,
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name categoryId');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update product details
// @route   PUT /api/v1/admin/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res, next) => {
  try {
    const { name, category, description, price, stockQty, isActive, existingImagePath } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (name) product.name = name.trim();
    if (category) {
      let catObj = null;
      if (mongoose.Types.ObjectId.isValid(category)) {
        catObj = await Category.findById(category);
      } else if (!isNaN(category)) {
        catObj = await Category.findOne({ categoryId: Number(category) });
      }
      if (catObj) product.category = catObj._id;
    }
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stockQty !== undefined) product.stockQty = Number(stockQty);
    if (isActive !== undefined) {
      product.isActive = String(isActive) === 'true' || isActive === 1 || isActive === true;
    }

    // Handle image update
    if (req.file) {
      product.imagePath = `uploads/${req.file.filename}`;
    } else if (existingImagePath) {
      product.imagePath = existingImagePath.trim();
    }

    await product.save();

    const populated = await Product.findById(product._id).populate('category', 'name categoryId');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Toggle active status (soft deactivation/reactivation)
// @route   PATCH /api/v1/admin/products/:id/toggle-active
// @access  Private (Admin)
const toggleActive = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' has been ${product.isActive ? 'activated' : 'deactivated'}.`,
      isActive: product.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete product
// @route   DELETE /api/v1/admin/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' was deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getAdminProducts,
  createProduct,
  updateProduct,
  toggleActive,
  deleteProduct,
};
