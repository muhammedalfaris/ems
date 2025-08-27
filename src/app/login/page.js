'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Users, Shield, ArrowRight, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'super-admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    const userType = sessionStorage.getItem('user_type');
    
    if (token) {
      if (userType === 'Company Admin') {
        router.push('/c-users');
      } else {
        router.push('/users');
      }
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('https://emsapi.disagglobal.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem('access_token', data.access_token);
        sessionStorage.setItem('token_type', data.token_type);

        sessionStorage.setItem('user_info', JSON.stringify(data.user));
        sessionStorage.setItem('user_type', data.user.user_types);
        sessionStorage.setItem('company_name', data.user.name);
      
        if (data.user.user_types === 'Company Admin') {
          router.push('/c-users');
        } else if (data.user.user_types === 'Department Admin') {
          router.push('/d-users');
        } else {
          router.push('/users');
        }
      } else {
        setErrors({
          api: data.message || 'Login failed. Please check your credentials.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        api: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Floating Real Fingerprint Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Realistic Fingerprint Pattern 1 - Loop Pattern */}
        <div className="absolute top-1/4 left-1/4 opacity-8 animate-pulse">
          <svg width="70" height="90" viewBox="0 0 70 90" className="text-white">
            <path d="M35 10 C20 10, 10 20, 10 35 C10 50, 20 60, 35 60 C50 60, 60 50, 60 35 C60 20, 50 10, 35 10" fill="none" stroke="currentColor" strokeWidth="0.8"/>
            <path d="M35 15 C23 15, 15 23, 15 35 C15 47, 23 55, 35 55 C47 55, 55 47, 55 35 C55 23, 47 15, 35 15" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            <path d="M35 20 C26 20, 20 26, 20 35 C20 44, 26 50, 35 50 C44 50, 50 44, 50 35 C50 26, 44 20, 35 20" fill="none" stroke="currentColor" strokeWidth="0.6"/>
            <path d="M35 25 C29 25, 25 29, 25 35 C25 41, 29 45, 35 45 C41 45, 45 41, 45 35 C45 29, 41 25, 35 25" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M35 30 C32 30, 30 32, 30 35 C30 38, 32 40, 35 40 C38 40, 40 38, 40 35 C40 32, 38 30, 35 30" fill="none" stroke="currentColor" strokeWidth="0.4"/>
            <path d="M15 25 C25 23, 35 25, 45 23" fill="none" stroke="currentColor" strokeWidth="0.6"/>
            <path d="M20 40 C30 38, 40 42, 50 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </svg>
        </div>
        
        {/* Realistic Fingerprint Pattern 2 - Whorl Pattern */}
        <div className="absolute top-3/4 right-1/4 opacity-6 animate-pulse delay-700 rotate-45">
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-purple-300">
            <path d="M30 5 C40 5, 50 15, 50 25 C50 35, 40 45, 30 45 C35 40, 40 35, 40 25 C40 20, 35 15, 30 15 C25 15, 20 20, 20 25 C20 35, 25 40, 30 45 C20 45, 10 35, 10 25 C10 15, 20 5, 30 5" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            <path d="M30 10 C35 10, 40 15, 40 20 C40 25, 35 30, 30 30 C32 28, 35 25, 35 20 C35 18, 32 15, 30 15 C28 15, 25 18, 25 20 C25 25, 28 28, 30 30 C25 30, 20 25, 20 20 C20 15, 25 10, 30 10" fill="none" stroke="currentColor" strokeWidth="0.6"/>
            <path d="M30 20 C32 20, 35 22, 35 25 C35 28, 32 30, 30 30 C28 30, 25 28, 25 25 C25 22, 28 20, 30 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <circle cx="30" cy="25" r="2" fill="none" stroke="currentColor" strokeWidth="0.4"/>
          </svg>
        </div>
        
        {/* Realistic Fingerprint Pattern 3 - Arch Pattern */}
        <div className="absolute top-1/2 left-3/4 opacity-10 animate-pulse delay-1000">
          <svg width="80" height="70" viewBox="0 0 80 70" className="text-cyan-300">
            <path d="M10 50 C20 40, 30 35, 40 35 C50 35, 60 40, 70 50" fill="none" stroke="currentColor" strokeWidth="0.8"/>
            <path d="M12 45 C22 35, 32 30, 40 30 C48 30, 58 35, 68 45" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            <path d="M14 40 C24 30, 34 25, 40 25 C46 25, 56 30, 66 40" fill="none" stroke="currentColor" strokeWidth="0.6"/>
            <path d="M16 35 C26 25, 36 20, 40 20 C44 20, 54 25, 64 35" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M18 30 C28 22, 38 18, 40 18 C42 18, 52 22, 62 30" fill="none" stroke="currentColor" strokeWidth="0.4"/>
            <path d="M25 38 C30 36, 35 38, 40 36 C45 38, 50 36, 55 38" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M20 32 C25 30, 30 32, 35 30" fill="none" stroke="currentColor" strokeWidth="0.4"/>
          </svg>
        </div>
        
        {/* Small Realistic Fingerprint Accents */}
        <div className="absolute top-20 right-40 opacity-5 animate-pulse delay-500">
          <svg width="35" height="35" viewBox="0 0 35 35" className="text-white">
            <path d="M17.5 5 C25 5, 30 10, 30 17.5 C30 25, 25 30, 17.5 30 C10 30, 5 25, 5 17.5 C5 10, 10 5, 17.5 5" fill="none" stroke="currentColor" strokeWidth="0.6"/>
            <path d="M17.5 10 C22 10, 25 13, 25 17.5 C25 22, 22 25, 17.5 25 C13 25, 10 22, 10 17.5 C10 13, 13 10, 17.5 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M15 12 C20 10, 25 15, 20 20" fill="none" stroke="currentColor" strokeWidth="0.4"/>
          </svg>
        </div>
        
        <div className="absolute bottom-32 left-20 opacity-7 animate-pulse delay-1200 -rotate-12">
          <svg width="45" height="55" viewBox="0 0 45 55" className="text-purple-200">
            <path d="M22.5 5 C30 5, 35 12, 35 20 C35 35, 25 45, 22.5 45 C20 45, 10 35, 10 20 C10 12, 15 5, 22.5 5" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            <path d="M22.5 10 C27 10, 30 15, 30 20 C30 30, 25 35, 22.5 35 C20 35, 15 30, 15 20 C15 15, 18 10, 22.5 10" fill="none" stroke="currentColor" strokeWidth="0.6"/>
            <path d="M22.5 15 C25 15, 27 17, 27 20 C27 25, 25 28, 22.5 28 C20 28, 18 25, 18 20 C18 17, 20 15, 22.5 15" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            <path d="M18 25 C20 23, 25 25, 27 23" fill="none" stroke="currentColor" strokeWidth="0.4"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-4 shadow-2xl relative overflow-hidden">
              <Users className="w-8 h-8 text-white relative z-10" />
              {/* Subtle realistic fingerprint overlay on logo */}
              <div className="absolute inset-0 opacity-15">
                <svg width="64" height="64" viewBox="0 0 64 64" className="text-white">
                  <path d="M32 12 C42 12, 50 20, 50 30 C50 40, 42 48, 32 48 C22 48, 14 40, 14 30 C14 20, 22 12, 32 12" fill="none" stroke="currentColor" strokeWidth="0.8"/>
                  <path d="M32 16 C40 16, 46 22, 46 30 C46 38, 40 44, 32 44 C24 44, 18 38, 18 30 C18 22, 24 16, 32 16" fill="none" stroke="currentColor" strokeWidth="0.6"/>
                  <path d="M32 20 C37 20, 42 25, 42 30 C42 35, 37 40, 32 40 C27 40, 22 35, 22 30 C22 25, 27 20, 32 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  <path d="M32 24 C35 24, 38 27, 38 30 C38 33, 35 36, 32 36 C29 36, 26 33, 26 30 C26 27, 29 24, 32 24" fill="none" stroke="currentColor" strokeWidth="0.4"/>
                  <path d="M22 25 C27 23, 32 25, 37 23" fill="none" stroke="currentColor" strokeWidth="0.4"/>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-2xl font-bold text-white mb-2">EMS Portal</h1>
            <p className="text-gray-300 sm:text-sm">Employee Management System</p>
          </div>

          {/* Login Form */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-8 sm:p-6 shadow-2xl border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-5">
              {/* Role Selector - UI Only */}
              {/* <div className="grid grid-cols-3 bg-white/5 rounded-2xl p-1 backdrop-blur-sm gap-1">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'super-admin' }))}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 ${
                    formData.role === 'super-admin'
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Crown className="w-4 h-4 mb-1" />
                  <span className="text-xs sm:text-[10px] font-medium leading-tight">Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'company-admin' }))}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 ${
                    formData.role === 'company-admin'
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4 mb-1" />
                  <span className="text-xs sm:text-[10px] font-medium leading-tight">Company Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'branch-admin' }))}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 ${
                    formData.role === 'branch-admin'
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 mb-1" />
                  <span className="text-xs sm:text-[10px] font-medium leading-tight">Branch Admin</span>
                </button>
              </div> */}

              {/* API Error Display */}
              {errors.api && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-red-400 text-sm sm:text-xs">{errors.api}</p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm sm:text-xs font-medium text-gray-200 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 sm:pl-10 pr-4 py-4 sm:py-3 bg-white/5 border ${
                      errors.email ? 'border-red-400' : 'border-white/20'
                    } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-base sm:text-sm`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm sm:text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm sm:text-xs font-medium text-gray-200 block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 sm:pl-10 pr-12 py-4 sm:py-3 bg-white/5 border ${
                      errors.password ? 'border-red-400' : 'border-white/20'
                    } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 text-base sm:text-sm`}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 sm:h-4 sm:w-4" /> : <Eye className="h-5 w-5 sm:h-4 sm:w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm sm:text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm sm:text-xs text-purple-300 hover:text-purple-200 transition-colors duration-200"
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-4 sm:py-3 px-6 rounded-2xl font-semibold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-base sm:text-sm"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Sign In
                    <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4 ml-2" />
                  </div>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 sm:mt-6 text-center">
              <p className="text-gray-400 text-sm sm:text-xs">
                Secure access to your employee portal
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs sm:text-[10px]">
              © 2025 Employee Management System. All rights reserved.
            </p>
            <p className='mt-2 text-white'>Powered by DISAG</p>
          </div>
        </div>
      </div>
    </div>
  );
}