import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const product = item.product;
  if (!product) return null;

  const currentQty = item.quantity;
  const isMaxStock = currentQty >= product.stock;
  const isMinQty = currentQty <= 1;

  const handleQtyChange = async (newQty) => {
    if (newQty < 1 || newQty > product.stock) return;
    try {
      setUpdating(true);
      setErrorMsg(null);
      await updateQuantity(product._id, newQty);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);
      setErrorMsg(null);
      await removeFromCart(product._id);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove product');
    } finally {
      setRemoving(false);
    }
  };

  const itemSubtotal = (product.price || 0) * currentQty;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shadow-xs gap-4">
      {/* Product Image and Details */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <Link to={`/products/${product._id}`} className="flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-slate-50 border border-slate-100 hover:opacity-90 transition"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
            {product.category}
          </span>
          <Link to={`/products/${product._id}`}>
            <h4 className="text-sm sm:text-base font-semibold text-slate-800 hover:text-emerald-600 transition truncate">
              {product.name}
            </h4>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Unit Price: <span className="font-semibold text-slate-700">₹{product.price?.toLocaleString('en-IN')}</span>
          </p>
          {product.stock <= 5 && (
            <p className="text-[11px] text-amber-600 font-medium flex items-center mt-1">
              <AlertCircle className="w-3 h-3 mr-1" />
              Only {product.stock} units in stock
            </p>
          )}
          {errorMsg && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Stepper & Total */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
          <button
            onClick={() => handleQtyChange(currentQty - 1)}
            disabled={isMinQty || updating}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-9 text-center text-sm font-semibold text-slate-800">
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-emerald-600" /> : currentQty}
          </span>

          <button
            onClick={() => handleQtyChange(currentQty + 1)}
            disabled={isMaxStock || updating}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total Price */}
        <div className="text-right min-w-[90px]">
          <div className="text-base font-bold text-slate-900">
            ₹{itemSubtotal.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Total</span>
        </div>

        {/* Delete Item Button */}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Remove from cart"
          aria-label="Remove item"
        >
          {removing ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default CartItem;
