import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, Clock, MapPin, CheckCircle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../services/api.js';
import { LoadingSpinner, EmptyState, ErrorAlert } from '../components/UIState.jsx';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        if (res.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status, paymentStatus) => {
    if (paymentStatus === 'PAID') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          {status} (PAID)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
        <Clock className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Order History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and view previous purchases and verified receipts
          </p>
        </div>

        {orders.length > 0 && (
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <span>Browse More Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner text="Loading your orders..." />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Orders Yet"
          description="You haven't placed any orders yet. Discover our catalog and place your first order today!"
          actionText="Start Shopping"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs hover:shadow-md transition space-y-6"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <span className="text-xs font-mono text-slate-400">Order ID:</span>
                    <span className="text-xs font-mono font-bold text-slate-800 ml-1.5">
                      {order._id}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(order.status, order.paymentStatus)}
                    <span className="text-lg font-black text-slate-900">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl bg-white border border-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> × ₹{item.price?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 pr-1">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500 gap-2">
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
                    <span>
                      Delivering to: <strong className="text-slate-700">{order.shippingAddress?.fullName}</strong>, {order.shippingAddress?.city} ({order.shippingAddress?.pincode})
                    </span>
                  </div>
                  {order.razorpayPaymentId && (
                    <span className="font-mono text-[11px] text-slate-400">
                      Payment ID: {order.razorpayPaymentId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
