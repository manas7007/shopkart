import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { LoadingSpinner, ErrorAlert } from '../components/UIState.jsx';

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleWishlist, isWishlisted, wishlistActionLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/products/${id}`);
        if (res.data?.product) {
          setProduct(res.data.product);
        }
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading product details..." size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorAlert message={error || 'Product not found'} />
        <div className="text-center mt-6">
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product._id);
  const isWishlistBusy = !!wishlistActionLoading[product._id];
  const isOutOfStock = product.stock <= 0;

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setActionError(null);
      await toggleWishlist(product._id);
    } catch (err) {
      setActionError(err.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isOutOfStock) return;

    try {
      setAddingToCart(true);
      setActionError(null);
      await addToCart(product._id, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err) {
      setActionError(err.message || 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        <Link to="/products" className="hover:text-emerald-600 transition flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Back to Products</span>
        </Link>
        <span>/</span>
        <span className="text-slate-400">{product.category}</span>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {actionError && <ErrorAlert message={actionError} />}

      {/* Product Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm">
        {/* Large Product Image */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {product.category}
          </span>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-4 py-2 bg-red-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-md">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-extrabold text-slate-900">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isOutOfStock
                    ? 'bg-red-100 text-red-700'
                    : product.stock < 10
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : product.stock < 10
                  ? `Only ${product.stock} units left`
                  : `In Stock (${product.stock} units)`}
              </span>
            </div>

            {/* Description */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Product Description
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-700 hover:text-slate-900 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                    disabled={quantity >= product.stock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-700 hover:text-slate-900 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  (Max: {product.stock})
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md ${
                  addedSuccess
                    ? 'bg-emerald-800 text-white'
                    : isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
                }`}
              >
                {addingToCart ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistBusy}
                className={`py-3.5 px-6 rounded-xl font-semibold text-sm border flex items-center justify-center space-x-2 transition ${
                  wishlisted
                    ? 'border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isWishlistBusy ? (
                  <Loader2 className="w-5 h-5 animate-spin text-pink-600" />
                ) : (
                  <>
                    <Heart
                      className={`w-5 h-5 ${wishlisted ? 'fill-pink-600 text-pink-600' : ''}`}
                    />
                    <span>{wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-700">Fast Shipping</p>
              <p className="text-[10px] text-slate-400">All India delivery</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-700">100% Genuine</p>
              <p className="text-[10px] text-slate-400">Verified products</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <RotateCcw className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-700">Easy Returns</p>
              <p className="text-[10px] text-slate-400">7-day policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
