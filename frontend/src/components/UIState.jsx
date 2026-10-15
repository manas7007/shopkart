import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, ShoppingBag, Heart, PackageSearch } from 'lucide-react';

// Spinner Component
export const LoadingSpinner = ({ text = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-slate-200 border-t-emerald-600 rounded-full animate-spin`}
      />
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

// Product Card Skeleton Loader
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse flex flex-col">
    <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
    <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
    <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-50">
      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
    </div>
  </div>
);

// Cart Item Skeleton Loader
export const CartItemSkeleton = () => (
  <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-slate-100 animate-pulse">
    <div className="w-20 h-20 bg-slate-200 rounded-lg flex-shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/5"></div>
    </div>
    <div className="w-24 h-8 bg-slate-200 rounded"></div>
  </div>
);

// Empty State Component
export const EmptyState = ({
  icon: Icon = PackageSearch,
  title = 'No items found',
  description = 'Looks like there is nothing here yet.',
  actionText = 'Explore Products',
  actionLink = '/products',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto my-8">
      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 shadow-inner">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6">{description}</p>
      {onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors duration-150"
        >
          {actionText}
        </button>
      ) : actionLink ? (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors duration-150"
        >
          {actionText}
        </Link>
      ) : null}
    </div>
  );
};

// Error Alert Component
export const ErrorAlert = ({ message, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 my-4 flex items-start space-x-3 text-red-800">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">Action Failed</p>
        <p className="text-red-700 mt-0.5">{message || 'Something went wrong. Please try again.'}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default {
  LoadingSpinner,
  ProductCardSkeleton,
  CartItemSkeleton,
  EmptyState,
  ErrorAlert,
};
