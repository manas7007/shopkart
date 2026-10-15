import mongoose from 'mongoose';
import Product from '../models/product.model.js';

// @desc    Create a new product
// @route   POST /products
// @access  Public
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, description, price, category, image, stock) are required',
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock);

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid number greater than 0',
      });
    }

    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a valid non-negative number',
      });
    }

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category: category.trim(),
      image: image.trim(),
      stock: numStock,
    });

    const savedProduct = await product.save();
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: savedProduct,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating product',
    });
  }
};

// @desc    Get all products with search, category filtering and sorting
// @route   GET /products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    // Search filter: case-insensitive regex against product name
    if (search && search.trim() !== '') {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Category filter: exact case match or case-insensitive match
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    let productQuery = Product.find(query);

    // Sorting
    if (sort === 'price_asc') {
      productQuery = productQuery.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      productQuery = productQuery.sort({ price: -1 });
    } else {
      productQuery = productQuery.sort({ createdAt: -1 });
    }

    const products = await productQuery.exec();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving products',
    });
  }
};

// @desc    Get distinct categories
// @route   GET /products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving categories',
    });
  }
};

// @desc    Get single product by ID
// @route   GET /products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving product',
    });
  }
};
