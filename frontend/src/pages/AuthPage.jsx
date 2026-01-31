import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  UserCircle,
  Store,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { resetPassword } from '../lib/supabase';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('customer');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  // Clear error when form changes
  const handleChange = (e) => {
    setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your email address.');
      return;
    }
    
    setForgotLoading(true);
    setError('');
    
    try {
      await resetPassword(forgotEmail);
      toast.success('Password reset link sent! Check your email.');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation before loading
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!isLogin && !formData.fullName) {
      setError('Please enter your full name.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Pass selectedRole to login for role verification
        await login(formData.email, formData.password, selectedRole);
        toast.success('Welcome back!');
        
        // Navigate based on selected role
        // Pharmacy users go to home page first, customers go to dashboard
        if (selectedRole === 'retailer') {
          navigate('/');
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        await register(
          formData.email,
          formData.password,
          formData.fullName,
          selectedRole,
          formData.phone
        );
        toast.success('Account created successfully!');
        
        // Navigate based on selected role
        // Pharmacy users go to home page first, customers go to dashboard
        if (selectedRole === 'retailer') {
          navigate('/');
        } else {
          navigate('/customer/dashboard');
        }
      }
    } catch (err) {
      // Show error immediately inline with specific message
      const errorMessage = err.message || '';
      if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('Invalid email or password')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Please verify your email address before logging in.');
      } else if (errorMessage.includes('registered as a')) {
        setError(errorMessage);
      } else {
        setError(errorMessage || 'Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  const inputClasses = "glass-input pl-12";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4"
            >
              <span className="text-3xl text-white font-bold">+</span>
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-white/60">
              {isLogin
                ? 'Sign in to continue to MediFind'
                : 'Join MediFind to get started'}
            </p>
          </div>

          {/* Role Selection (Always show for both Login and Sign Up) */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <label className="block text-sm font-medium mb-3">
              {isLogin ? 'Sign in as:' : 'I am a:'}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('customer')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'customer'
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <UserCircle
                  size={32}
                  className={`mx-auto mb-2 ${
                    selectedRole === 'customer'
                      ? 'text-primary-400'
                      : 'text-white/50'
                  }`}
                />
                <span
                  className={`block text-sm font-medium ${
                    selectedRole === 'customer' ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Customer
                </span>
                <span className="block text-xs text-white/50 mt-1">
                  Find medicines
                </span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('retailer')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedRole === 'retailer'
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Store
                  size={32}
                  className={`mx-auto mb-2 ${
                    selectedRole === 'retailer'
                      ? 'text-purple-400'
                      : 'text-white/50'
                  }`}
                />
                <span
                  className={`block text-sm font-medium ${
                    selectedRole === 'retailer' ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Pharmacy
                </span>
                <span className="block text-xs text-white/50 mt-1">
                  List your store
                </span>
              </motion.button>
            </div>
          </motion.div>

          {/* Error Message - Inline Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-400">✕</span>
                  </div>
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up Only) */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                    />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required={!isLogin}
                      className={inputClasses}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            {/* Phone (Sign Up Only) */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <Phone
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number (Optional)"
                      value={formData.phone}
                      onChange={handleChange}
                      className={inputClasses}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className={`${inputClasses} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forgot Password Link (Login Only) */}
            {isLogin && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotEmail(formData.email);
                    setError('');
                  }}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-button w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-white/60">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', fullName: '', phone: '' });
                }}
                className="ml-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-center text-white/40 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForgotPassword(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-8 w-full max-w-md"
            >
              <button
                onClick={() => setShowForgotPassword(false)}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft size={20} />
                <span>Back to Login</span>
              </button>

              <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
              <p className="text-white/60 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={forgotLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-button w-full flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Mail size={20} />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
