import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // All order endpoints are protected

router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

export default router;
