import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, ShieldCheck, Truck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import CartItem from '../components/CartItem.jsx';
import { EmptyState, CartItemSkeleton } from '../components/UIState.jsx';

export const Cart = () => {
  const { cartItems, cartCount, subtotal, loading } = useCart();
  const navigate = useNavigate();

  const isCartEmpty = !cartItems || cartItems.length === 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Order Preparation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isCartEmpty
              ? 'Your cart is currently empty'
              : `You have ${cartCount} unit${cartCount > 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {!isCartEmpty && (
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <span>Add More Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <CartItemSkeleton key={n} />
          ))}
        </div>
      ) : isCartEmpty ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Explore our top products and start shopping!"
          actionText="Explore Products"
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item._id || item.product._id} item={item} />
            ))}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              Order Summary
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Total Items ({cartCount} units)</span>
                <span className="font-semibold text-slate-800">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-600 uppercase text-xs">
                  Free
                </span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Taxes & GST</span>
                <span className="text-xs text-slate-400">Included</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">Grand Total</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-slate-400">INR inclusive of all taxes</span>
                </div>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 active:scale-98 transition flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Guarantee */}
            <div className="pt-2 text-center text-xs text-slate-400 space-y-2 border-t border-slate-50">
              <div className="flex items-center justify-center space-x-2 text-slate-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted Razorpay Checkout</span>
              </div>
              <p>Safe and verified payments with instant confirmation</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
