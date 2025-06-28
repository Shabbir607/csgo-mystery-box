import React, { useState } from 'react';
import { X, User, Lock, Mail, Eye, EyeOff, Star } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string , confirmPassword: string) => Promise<void>;
}

export default function LoginModal({ isOpen, onClose, onLogin, onRegister }: LoginModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: string[] = [];

    if ( !isLoginMode && !formData.username.trim()) {
      newErrors.push('Username is required');
    } else if (!isLoginMode && formData.username.length < 3) {
      newErrors.push('Username must be at least 3 characters');
    }

    if (!formData.email.trim()) {
      newErrors.push('Email is required');
    } else if (!isLoginMode && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Email is invalid');
    }

    if (!formData.password) {
      newErrors.push('Password is required');
    } else if (!isLoginMode && formData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters');
    }

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors([]);
    
    try {
      if (isLoginMode) {
        await onLogin(formData.email, formData.password);
      } else {
        await onRegister(formData.username, formData.email, formData.password, formData.confirmPassword);
      }
      resetForm();
    } catch (error) {
      setErrors(['Authentication failed. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setErrors([]);
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal content */}
        <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-6 sm:p-8 pb-4 sm:pb-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl overflow-hidden p-2 sm:p-3">
                <img 
                  src="/download.webp" 
                  alt="CleanCase Logo" 
                  className="w-full h-full object-contain filter brightness-0 invert"
                  loading="lazy"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
                {isLoginMode ? 'Welcome Back' : 'Join CleanCase'}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                {isLoginMode ? 'Sign in to your account' : 'Create your premium account'}
              </p>
            </div>
          </div>

          {/* Scrollable form content */}
          <div className="max-h-[60vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="px-6 sm:px-8 pb-6 sm:pb-8">
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-red-500/20 border border-red-400/30">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-400 text-xs sm:text-sm">{error}</p>
                  ))}
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {/* Username */}
                {!isLoginMode && (
                <div>
                  <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>
             )}
                {/* Email (Registration only) */}
                
                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 sm:pl-12 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Registration only) */}
                {!isLoginMode && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/50"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full mt-6 sm:mt-8 py-3 sm:py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isLoading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center overflow-hidden p-0.5 sm:p-1">
                  <img 
                    src="/download.webp" 
                    alt="CleanCase Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert"
                    loading="lazy"
                  />
                </div>
                <span className="text-sm sm:text-base">
                  {isLoading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
                </span>
              </button>

              {/* Switch Mode */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-gray-400 text-xs sm:text-sm">
                  {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="ml-1 sm:ml-2 text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-300"
                  >
                    {isLoginMode ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>

              {/* Admin Demo Info */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-2xl bg-blue-500/20 border border-blue-400/30">
                <div className="text-center">
                  <p className="text-blue-400 text-xs sm:text-sm font-semibold mb-1">Demo Credentials</p>
                  <p className="text-blue-300 text-xxs sm:text-xs">Admin: admin / admin123</p>
                  <p className="text-blue-300 text-xxs sm:text-xs">User: Any username / Any password</p>
                </div>
              </div>

              {/* CleanCase Branding */}
              <div className="mt-4 sm:mt-6 text-center">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                  <span className="text-xs sm:text-sm text-orange-400 font-bold">CleanCase Premium</span>
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}