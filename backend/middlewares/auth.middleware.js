import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.cookies?.jwt;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Please log in to access this resource',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'shopkart_jwt_secret_dev_key'
    );

    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Customer no longer exists',
      });
    }

    req.user = customer;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
    });
  }
};

export default protect;
