import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  Search,
  User,
  LogOut,
  Store,
  Package,
  LayoutDashboard,
  Heart,
  Bell,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const isActive = (path) => location.pathname === path;

  const customerLinks = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/search', label: 'Find Medicine', icon: Search },
  ];

  const retailerLinks = [
    { path: '/retailer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/retailer/stores', label: 'My Stores', icon: Store },
    { path: '/retailer/inventory', label: 'Inventory', icon: Package },
  ];

  const navLinks = profile?.role === 'retailer' ? retailerLinks : customerLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">+</span>
            </motion.div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              HealHeart
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`nav-link flex items-center gap-2 ${isActive('/') ? 'active' : ''}`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>

            {!user && (
              <Link
                to="/search"
                className={`nav-link flex items-center gap-2 ${isActive('/search') ? 'active' : ''}`}
              >
                <Search size={18} />
                <span>Find Medicine</span>
              </Link>
            )}

            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link flex items-center gap-2 ${isActive(link.path) ? 'active' : ''}`}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-red-400"
                >
                  <LogOut size={20} />
                </motion.button>
              </div>
            ) : (
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-button"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive('/') ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>

              {!user && (
                <Link
                  to="/search"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive('/search') ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <Search size={20} />
                  <span>Find Medicine</span>
                </Link>
              )}

              {user && navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive(link.path) ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <link.icon size={20} />
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className="border-t border-white/10 pt-4 mt-4">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5"
                    >
                      <User size={20} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 w-full text-red-400"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="block"
                  >
                    <button className="glass-button w-full">Sign In</button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
