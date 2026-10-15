import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isWishlisted, wishlistActionLoading, addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedTemporarily, setAddedTemporarily] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  const wishlisted = isWishlisted(product._id);
  const isWishlistBusy = !!wishlistActionLoading[product._id];
  const isOutOfStock = product.stock <= 0;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setErrorMsg(null);
      await toggleWishlist(product._id);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOutOfStock) return;

    try {
      setAddingToCart(true);
      setErrorMsg(null);
      await addToCart(product._id, 1);
      setAddedTemporarily(true);
      setTimeout(() => setAddedTemporarily(false), 1800);
    } catch (err) {
      setErrorMsg(err.message || 'Could not add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
          {product.category}
        </span>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={isWishlistBusy}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-150 shadow-sm ${
            wishlisted
              ? 'bg-pink-50 text-pink-600 hover:bg-pink-100'
              : 'bg-white/90 text-slate-500 hover:text-pink-600 hover:bg-white'
          }`}
        >
          {isWishlistBusy ? (
            <Loader2 className="w-4 h-4 animate-spin text-pink-600" />
          ) : (
            <Heart
              className={`w-4 h-4 transition-transform active:scale-125 ${
                wishlisted ? 'fill-pink-600 text-pink-600' : ''
              }`}
            />
          )}
        </button>

        {/* Out of Stock overlay if stock === 0 */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/products/${product._id}`} className="group-hover:text-emerald-600 transition-colors">
            <h3 className="font-semibold text-slate-800 line-clamp-1 text-base" title={product.name}>
              {product.name}
            </h3>
          </Link>
          <p className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {isOutOfStock ? (
                <span className="text-red-500 font-semibold">Unavailable</span>
              ) : product.stock < 10 ? (
                <span className="text-amber-600 font-semibold">Only {product.stock} left</span>
              ) : (
                <span className="text-emerald-600 font-semibold">In Stock ({product.stock})</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <Link
              to={`/products/${product._id}`}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
            >
              Details
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className={`p-2 rounded-lg text-white font-medium text-xs flex items-center justify-center transition-all ${
                addedTemporarily
                  ? 'bg-emerald-700'
                  : isOutOfStock
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-xs'
              }`}
              title={isOutOfStock ? 'Product out of stock' : 'Add to cart'}
            >
              {addingToCart ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : addedTemporarily ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {errorMsg && (
          <p className="text-red-500 text-[11px] mt-2 font-medium bg-red-50 p-1.5 rounded text-center">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
