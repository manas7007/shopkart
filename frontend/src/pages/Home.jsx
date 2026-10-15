import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { ProductCardSkeleton, ErrorAlert } from '../components/UIState.jsx';

export const Home = () => {
  const { user } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products');
        if (res.data?.products) {
          // Take first 4 or 8 items as featured
          setFeaturedProducts(res.data.products.slice(0, 4));
        }
      } catch (err) {
        setError(err.message || 'Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Electronics', icon: '💻', count: 'Latest Tech & Gadgets' },
    { name: 'Fashion', icon: '👕', count: 'Apparel & Footwear' },
    { name: 'Books', icon: '📚', count: 'Best-sellers & Guides' },
    { name: 'Home', icon: '☕', count: 'Kitchen & Living' },
    { name: 'Gaming', icon: '🎮', count: 'Gear & Consoles' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Logged-in Customer Welcome Banner */}
      {user && (
        <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-emerald-700/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-1">
                <UserCheck className="w-4 h-4" />
                <span>Verified Customer Profile</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black">
                Welcome back, {user.fullName}! 👋
              </h2>
              <p className="text-emerald-100 text-sm mt-1">
                Account: <span className="font-semibold text-white">{user.email}</span> • Mobile: <span className="font-semibold text-white">{user.phone}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/products"
                className="px-5 py-2.5 bg-white text-emerald-800 font-bold text-sm rounded-xl hover:bg-emerald-50 transition shadow-sm"
              >
                Start Shopping
              </Link>
              <Link
                to="/orders"
                className="px-5 py-2.5 bg-emerald-800/60 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl transition border border-emerald-400/30"
              >
                Track Orders
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Online Shopping Experience</span>
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Discover Tech, Fashion & Daily Essentials.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Engineered with lightning-fast checkout, verified Razorpay payment security, real-time stock availability, and tailored recommendations.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/wishlist"
              className="inline-flex items-center px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl border border-slate-700 transition"
            >
              <span>Saved Items</span>
            </Link>
          </div>
        </div>

        {/* Decorative background gradients */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-20 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Truck,
            title: 'Express Delivery',
            desc: 'Guaranteed 24-48h dispatch across India',
          },
          {
            icon: ShieldCheck,
            title: 'Razorpay Verified',
            desc: 'HMAC SHA-256 secure encrypted transactions',
          },
          {
            icon: RotateCcw,
            title: '7-Day Easy Returns',
            desc: 'Hassle-free replacement policy',
          },
          {
            icon: TrendingUp,
            title: 'Verified Inventory',
            desc: 'Accurate real-time stock allocation',
          },
        ].map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-4"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{feature.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{feature.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Category Pills */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Browse by Category
          </h3>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all text-center flex flex-col items-center justify-center"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                {cat.name}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Trending Products
            </h3>
            <p className="text-xs text-slate-500">Popular items customers are shopping right now</p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            <span>View Catalog</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {error && <ErrorAlert message={error} />}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <ProductCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
