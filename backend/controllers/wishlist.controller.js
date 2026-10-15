import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

// @desc    Add product to wishlist
// @route   POST /wishlist/:productId
// @access  Protected
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);

    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: 'Product is already in your wishlist',
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    await customer.populate({
      path: 'wishlist',
      select: 'name price category image stock',
    });

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error adding to wishlist',
    });
  }
};

// @desc    Get logged in user's wishlist
// @route   GET /wishlist
// @access  Protected
export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock',
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving wishlist',
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /wishlist/:productId
// @access  Protected
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const customer = await Customer.findById(req.user._id);

    const initialLength = customer.wishlist.length;
    customer.wishlist = customer.wishlist.filter(
      (id) => id.toString() !== productId
    );

    if (customer.wishlist.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    await customer.save();

    await customer.populate({
      path: 'wishlist',
      select: 'name price category image stock',
    });

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing from wishlist',
    });
  }
};

// @desc    Toggle wishlist status (Bonus Lab 04)
// @route   PATCH /wishlist/:productId/toggle
// @access  Protected
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);
    const existingIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    let saved = false;
    let message = '';

    if (existingIndex > -1) {
      customer.wishlist.splice(existingIndex, 1);
      saved = false;
      message = 'Product removed from wishlist';
    } else {
      customer.wishlist.push(productId);
      saved = true;
      message = 'Product added to wishlist';
    }

    await customer.save();

    await customer.populate({
      path: 'wishlist',
      select: 'name price category image stock',
    });

    return res.status(200).json({
      success: true,
      saved,
      message,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error toggling wishlist',
    });
  }
};
