import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, PackageOpen } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { EmptyState, ProductCardSkeleton, ErrorAlert } from '../components/UIState.jsx';

export const Wishlist = () => {
  const {
    wishlist,
    wishlistCount,
    removeFromWishlist,
    addToCart,
    wishlistActionLoading,
    loading,
  } = useCart();

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
    } catch (err) {
      alert(err.message || 'Could not add to cart');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-pink-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-pink-600" />
            <span>Saved Products</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Wishlist
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {wishlistCount === 0
              ? 'You have no saved items yet'
              : `You have ${wishlistCount} saved item${wishlistCount > 1 ? 's' : ''}`}
          </p>
        </div>

        {wishlistCount > 0 && (
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Grid or Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your Wishlist is Empty"
          description="Save products you love while browsing, and find them easily whenever you are ready to shop."
          actionText="Browse Products"
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const product = item;
            if (!product || !product._id) return null;
            const isBusy = !!wishlistActionLoading[product._id];
            const isOutOfStock = product.stock <= 0;

            return (
              <div
                key={product._id}
                className="group relative bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
                    {product.category}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    disabled={isBusy}
                    title="Remove from wishlist"
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-slate-400 hover:text-red-600 hover:bg-white transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-semibold text-slate-800 line-clamp-1 text-base hover:text-emerald-600 transition">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">
                        ₹{product.price?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {isOutOfStock ? (
                          <span className="text-red-500 font-semibold">Out of Stock</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">{product.stock} in stock</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                    >
                      View Details
                    </Link>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock}
                      className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed rounded-xl transition shadow-xs"
                      title="Move to Cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
