import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { ErrorAlert } from '../components/UIState.jsx';

export const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, cartCount, subtotal, clearCartState } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Pre-fill demo address for fast evaluation
  const handleFillDemoAddress = () => {
    setAddress({
      fullName: user?.fullName || 'John Doe',
      phone: user?.phone || '9876543210',
      addressLine1: '404 Silicon Heights, Tech Park Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
    });
  };

  // Helper to dynamically ensure Razorpay script is loaded
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Execute payment flow with Razorpay SDK or fallback simulation
  const handleProceedToPayment = async (isSimulation = false) => {
    // 1. Validation
    const { fullName, phone, addressLine1, city, state, pincode } = address;
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      setErrorMessage('Please fill in all shipping address fields');
      return;
    }

    if (!/^[0-9]{10}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number');
      return;
    }

    if (!/^[0-9]{6}$/.test(pincode.trim())) {
      setErrorMessage('Please enter a valid 6-digit postal pincode');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    try {
      setProcessing(true);
      setErrorMessage(null);

      // 2. Call backend to create pending order and Razorpay order
      const orderRes = await api.post('/orders/create-payment-order', {
        shippingAddress: address,
      });

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderRes.data;

      // 3. Handle Simulation mode (for fast testing when live keys or popup blockers are present)
      if (isSimulation) {
        const verifyRes = await api.post('/orders/verify-payment', {
          shopKartOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_test_simulated_${Date.now()}`,
          razorpay_signature: 'simulated_valid_signature',
        });

        clearCartState();
        navigate(`/order-success/${shopKartOrderId}`);
        return;
      }

      // 4. Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay SDK. Please check your internet connection.');
      }

      // 5. Razorpay Modal Options
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'ShopKart Online Store',
        description: `Order #${shopKartOrderId}`,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop&q=80',
        order_id: razorpayOrderId,
        prefill: {
          name: fullName,
          email: user?.email || '',
          contact: phone,
        },
        theme: {
          color: '#16a34a',
        },
        handler: async function (response) {
          try {
            // 6. Verify HMAC signature on backend
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // 7. On success: clear cart and redirect to order success page
            clearCartState();
            navigate(`/order-success/${shopKartOrderId}`);
          } catch (verifyErr) {
            setErrorMessage(
              verifyErr.message || 'Payment verification failed. Please contact support.'
            );
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            setErrorMessage('Payment was cancelled. Your cart items are preserved.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (response) {
        setProcessing(false);
        setErrorMessage(
          response.error?.description || 'Payment failed. Please try again with another method.'
        );
      });

      razorpay.open();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to initiate checkout order');
    } finally {
      setProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500">
          There are no items to checkout. Please add products to your cart.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link to="/cart" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-emerald-600 transition">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Return to Cart</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
                  Shipping Address
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Where should we deliver your order?
                </p>
              </div>
              <button
                type="button"
                onClick={handleFillDemoAddress}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition self-start"
              >
                ⚡ Autofill Demo Address
              </button>
            </div>

            {errorMessage && <ErrorAlert message={errorMessage} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={address.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  maxLength={10}
                  value={address.phone}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Address Line 1 */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Street Address / House No. *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  required
                  value={address.addressLine1}
                  onChange={handleInputChange}
                  placeholder="Flat 302, Green Meadows, MG Road"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={address.city}
                  onChange={handleInputChange}
                  placeholder="Bengaluru"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={address.state}
                  onChange={handleInputChange}
                  placeholder="Karnataka"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Postal Pincode (6 digits) *
                </label>
                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  value={address.pincode}
                  onChange={handleInputChange}
                  placeholder="560100"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Gateway Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Razorpay Payment Gateway</h3>
                  <p className="text-xs text-slate-400">
                    Supports UPI (GPay, PhonePe), NetBanking, Credit/Debit Cards
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                Test Mode Ready
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon clicking Pay, the official Razorpay test checkout window will launch. Transactions are authenticated using HMAC SHA-256 signatures on the backend.
            </p>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 sticky top-24">
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Items to Purchase ({cartCount})
          </h3>

          {/* Mini Item List */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item._id || product._id} className="flex items-center space-x-3 text-xs">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-lg bg-slate-50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                    <p className="text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600 uppercase text-xs">
                Free Delivery
              </span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Primary Razorpay Pay Button */}
          <button
            type="button"
            onClick={() => handleProceedToPayment(false)}
            disabled={processing}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 active:scale-98 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{subtotal.toLocaleString('en-IN')} via Razorpay</span>
              </>
            )}
          </button>

          {/* Instant Simulation Mode Button */}
          <button
            type="button"
            onClick={() => handleProceedToPayment(true)}
            disabled={processing}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
            title="Simulate successful payment without popup"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>⚡ Instant Test Mode Verification</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
