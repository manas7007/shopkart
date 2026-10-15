import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, MapPin, Calendar, CreditCard } from 'lucide-react';
import api from '../services/api.js';
import { LoadingSpinner, ErrorAlert } from '../components/UIState.jsx';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${orderId}`);
        if (res.data?.order) {
          setOrder(res.data.order);
        }
      } catch (err) {
        setError(err.message || 'Order details could not be retrieved');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Retrieving verified order receipt..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8 pb-16">
      {/* Success Card Header */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Payment Confirmed!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Thank you for shopping with ShopKart. Your order has been placed successfully and is being prepared for dispatch.
        </p>

        <div className="pt-2 inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-slate-700">
          <span>Order ID:</span>
          <span className="text-emerald-700">{orderId}</span>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      {order && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center">
            <Package className="w-5 h-5 mr-2 text-emerald-600" />
            Purchased Items Snapshot
          </h3>

          {/* Items List */}
          <div className="space-y-4 divide-y divide-slate-50">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4 pt-3 first:pt-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-sm font-bold text-slate-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center mb-1.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Shipping Destination
              </span>
              <p className="font-semibold text-slate-800">{order.shippingAddress?.fullName}</p>
              <p className="text-slate-500">{order.shippingAddress?.addressLine1}</p>
              <p className="text-slate-500">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-slate-500">Phone: {order.shippingAddress?.phone}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center mb-1.5">
                <CreditCard className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Payment Summary
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Status:</span>
                <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Razorpay Order:</span>
                <span className="font-mono text-[11px] text-slate-700">{order.razorpayOrderId}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                <span>Total Amount Paid:</span>
                <span className="text-sm text-emerald-700">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/orders"
          className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl text-center shadow-sm transition"
        >
          View All Orders
        </Link>
        <Link
          to="/products"
          className="flex-1 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl text-center shadow-sm shadow-emerald-600/20 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
