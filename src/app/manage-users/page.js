'use client';

import { useState, useEffect } from 'react';
import { Users, Fingerprint, UserPlus, Building, Hash, User, Save, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ManageUsersPage() {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    department: '',
    fingerprintId: '',
    username: '',
    serialNumber: '',
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [fingerprintLoading, setFingerprintLoading] = useState(false);
 
  useEffect(() => {
    const mockDepartments = [
      { id: 1, name: 'Engineering' },
      { id: 2, name: 'Human Resources' },
      { id: 3, name: 'Marketing' },
      { id: 4, name: 'Sales' },
      { id: 5, name: 'Finance' },
      { id: 6, name: 'Operations' }
    ];
    setDepartments(mockDepartments);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.fingerprintId) {
      newErrors.fingerprintId = 'Fingerprint ID is required';
    } else {
      const id = parseInt(formData.fingerprintId);
      if (isNaN(id) || id < 1 || id > 127) {
        newErrors.fingerprintId = 'Fingerprint ID must be between 1 and 127';
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddFingerprint = async () => {
    if (!formData.fingerprintId) {
      setErrors(prev => ({
        ...prev,
        fingerprintId: 'Please enter a fingerprint ID first'
      }));
      return;
    }

    const id = parseInt(formData.fingerprintId);
    if (isNaN(id) || id < 1 || id > 127) {
      setErrors(prev => ({
        ...prev,
        fingerprintId: 'Fingerprint ID must be between 1 and 127'
      }));
      return;
    }

    setFingerprintLoading(true);
    
    try {
      // Simulate API call for fingerprint registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage(`Fingerprint ID ${id} registered successfully! Please place finger on scanner.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        fingerprintId: 'Failed to register fingerprint. Please try again.'
      }));
    } finally {
      setFingerprintLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setFormData({
        department: '',
        fingerprintId: '',
        username: '',
        serialNumber: '',
        gender: ''
      });
      
      setSuccessMessage('User added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to add user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Floating Fingerprint Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 opacity-5 animate-pulse">
          <svg width="70" height="90" viewBox="0 0 70 90" className="text-white">
            <path d="M35 10 C20 10, 10 20, 10 35 C10 50, 20 60, 35 60 C50 60, 60 50, 60 35 C60 20, 50 10, 35 10" fill="none" stroke="currentColor" strokeWidth="0.8"/>
            <path d="M35 15 C23 15, 15 23, 15 35 C15 47, 23 55, 35 55 C47 55, 55 47, 55 35 C55 23, 47 15, 35 15" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            <path d="M35 20 C26 20, 20 26, 20 35 C20 44, 26 50, 35 50 C44 50, 50 44, 50 35 C50 26, 44 20, 35 20" fill="none" stroke="currentColor" strokeWidth="0.6"/>
          </svg>
        </div>
        
        <div className="absolute top-3/4 right-1/4 opacity-4 animate-pulse delay-700 rotate-45">
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-purple-300">
            <path d="M30 5 C40 5, 50 15, 50 25 C50 35, 40 45, 30 45 C35 40, 40 35, 40 25 C40 20, 35 15, 30 15 C25 15, 20 20, 20 25 C20 35, 25 40, 30 45 C20 45, 10 35, 10 25 C10 15, 20 5, 30 5" fill="none" stroke="currentColor" strokeWidth="0.7"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <Navbar activeTab="manage" />

        {/* Main Content */}
        <div className="px-4 mt-18 md:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Manage Users</h1>
            <p className="text-gray-300 text-sm md:text-base">Add new employees to the system</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl backdrop-blur-lg">
              <p className="text-green-300 text-sm md:text-base">{successMessage}</p>
            </div>
          )}

          {/* Main Form Container */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Selection */}
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl mr-3">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-white">Device</h2>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Select Device
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="">Choose a device...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name} className="bg-slate-800">
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-400 text-xs md:text-sm mt-1">{errors.department}</p>
                  )}
                </div>
              </div>

              {/* Fingerprint Section */}
              {/* <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-3">
                    <Fingerprint className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-white">Fingerprint Registration</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fingerprint ID (1-127)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          name="fingerprintId"
                          value={formData.fingerprintId}
                          onChange={handleInputChange}
                          min="1"
                          max="127"
                          placeholder="Enter ID between 1-127"
                          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFingerprint}
                        disabled={fingerprintLoading}
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                      >
                        {fingerprintLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            <span className="hidden sm:inline">Registering...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Add Fingerprint</span>
                            <span className="sm:hidden">Add</span>
                          </>
                        )}
                      </button>
                    </div>
                    {errors.fingerprintId && (
                      <p className="text-red-400 text-xs md:text-sm mt-1">{errors.fingerprintId}</p>
                    )}
                  </div>
                </div>
              </div> */}

              {/* User Information */}
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold text-white">User Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                    />
                    {errors.username && (
                      <p className="text-red-400 text-xs md:text-sm mt-1">{errors.username}</p>
                    )}
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Serial Number
                    </label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      placeholder="Enter serial number"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                    />
                    {errors.serialNumber && (
                      <p className="text-red-400 text-xs md:text-sm mt-1">{errors.serialNumber}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {['Male', 'Female',].map(gender => (
                        <label key={gender} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={gender}
                            checked={formData.gender === gender}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 focus:ring-purple-500 focus:ring-2"
                          />
                          <span className="ml-2 text-gray-300 text-sm md:text-base">{gender}</span>
                        </label>
                      ))}
                    </div>
                    {errors.gender && (
                      <p className="text-red-400 text-xs md:text-sm mt-1">{errors.gender}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Adding User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Add User
                    </>
                  )}
                </button>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-lg">
                  <p className="text-red-300 text-center text-sm md:text-base">{errors.submit}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}