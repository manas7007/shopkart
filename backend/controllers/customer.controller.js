import Customer from '../models/customer.model.js';
import { generateTokenAndSetCookie, clearAuthCookie } from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// @desc    Register a new customer
// @route   POST /customers/register
// @access  Public
export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (fullName, email, password, phone) are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const customer = new Customer({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone.trim(),
    });

    await customer.save();

    // Generate JWT & set cookie for immediate authenticated experience
    generateTokenAndSetCookie(res, customer._id);

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        wishlist: customer.wishlist,
        cart: customer.cart,
      },
    });
  } catch (error) {
    console.error('Register customer error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate customer & get token
// @route   POST /customers/login
// @access  Public
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    generateTokenAndSetCookie(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        wishlist: customer.wishlist,
        cart: customer.cart,
      },
    });
  } catch (error) {
    console.error('Login customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// @desc    Get current logged in customer profile
// @route   GET /customers/me
// @access  Protected
export const getMyProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id)
      .select('-password')
      .populate('wishlist', 'name price category image stock')
      .populate('cart.product', 'name price category image stock');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    return res.status(200).json({
      success: true,
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      wishlist: customer.wishlist,
      cart: customer.cart,
      createdAt: customer.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
    });
  }
};

// @desc    Logout customer / clear cookie
// @route   POST /customers/logout
// @access  Protected
export const logoutCustomer = async (req, res) => {
  try {
    clearAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
};

// @desc    Change customer password (Bonus Lab 01)
// @route   PATCH /customers/change-password
// @access  Protected
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both old and new passwords are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const customer = await Customer.findById(req.user._id);
    const isMatch = await customer.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid existing password',
      });
    }

    customer.password = newPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error changing password',
    });
  }
};
