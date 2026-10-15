import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  ShoppingCart,
  User,
  LogOut,
  Package,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 flex items-center space-x-1.5 ${
      isActive
        ? 'text-emerald-600 font-semibold'
        : 'text-slate-600 hover:text-emerald-600'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to={isAuthenticated ? '/home' : '/'}
            className="flex items-center space-x-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
              Shop<span className="text-emerald-600">Kart</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to={isAuthenticated ? '/home' : '/'} className={navLinkClasses}>
              <span>Home</span>
            </NavLink>
            <NavLink to="/products" className={navLinkClasses}>
              <span>Products</span>
            </NavLink>
            <NavLink to="/wishlist" className={navLinkClasses}>
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-pink-500 rounded-full animate-in zoom-in-50">
                  {wishlistCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/cart" className={navLinkClasses}>
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 py-1.5 px-3 rounded-xl border border-slate-200 hover:border-emerald-500 transition-colors bg-slate-50 hover:bg-white text-slate-800 text-sm font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-sm z-50"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Package className="w-4 h-4 mr-2 text-slate-400" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <Link to="/cart" className="relative p-2 text-slate-700">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to={isAuthenticated ? '/home' : '/'}
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
          >
            Home
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
          >
            Products
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
          >
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-pink-500 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
          >
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center py-2 text-base font-medium text-slate-700 hover:text-emerald-600"
              >
                <Package className="w-5 h-5 mr-2 text-slate-400" />
                My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center py-2 text-base font-medium text-red-600 hover:text-red-700"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out ({user?.fullName})
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-medium text-slate-800 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-medium text-white bg-emerald-600 rounded-xl shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
