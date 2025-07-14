'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Plus, Trash2, X, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';

const API_BASE_URL = 'https://emsapi.disagglobal.com/api/devices';

export default function DevicePage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    department: '',
    mode: '0' // Default to enrollment mode
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  // Fetch devices from API
  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to match component structure
      const transformedDevices = data.map((device, index) => ({
        id: device.id || index + 1, // Use API id if available, otherwise use index
        name: device['Device Name'] || device.device_name || 'Unknown Device',
        department: device['Device Department'] || device.device_dep || 'Unknown Department',
        uid: device['Device UID'] || device.device_uid || 'N/A',
        date: device['Device Date'] || device.device_date || new Date().toISOString().split('T')[0],
        mode: device['Device Mode'] === 1 || device.device_mode === 1 ? 'attendance' : 'enrollment'
      }));
      
      setDevices(transformedDevices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError('Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add device via API
  const addDevice = async (deviceData) => {
    try {
      setSubmitting(true);
      setError('');
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/store`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_name: deviceData.name,
          device_dep: deviceData.department,
          device_mode: deviceData.mode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the devices list after successful addition
      await fetchDevices();
      return true;
    } catch (error) {
      console.error('Error adding device:', error);
      setError('Failed to add device. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Delete device via API
  const deleteDevice = async (deviceName) => {
    try {
      setDeleting(deviceName);
      setError('');
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/destroy`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_name: deviceName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove device from local state
      setDevices(devices.filter(device => device.name !== deviceName));
    } catch (error) {
      console.error('Error deleting device:', error);
      setError('Failed to delete device. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Calculate stats
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  // const addedToday = devices.filter(device => device.date === todayStr).length;
  // const enrollmentDevices = devices.filter(device => device.mode === 'enrollment').length;
  // const attendanceDevices = devices.filter(device => device.mode === 'attendance').length;

  const handleAddDevice = () => {
    setShowAddModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewDevice({ name: '', department: '', mode: '0' });
    setError('');
  };

  const handleSubmitDevice = async () => {
    if (!newDevice.name.trim() || !newDevice.department.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const success = await addDevice(newDevice);
    if (success) {
      handleCloseModal();
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    if (window.confirm('Are you sure you want to delete this device?')) {
      await deleteDevice(device.name);
    }
  };

  const handleModeChange = async (deviceId, newMode) => {
    // Update local state immediately for better UX
    setDevices(devices.map(device => 
      device.id === deviceId ? { ...device, mode: newMode } : device
    ));

    // Here you would typically make an API call to update the device mode
    // Since the API endpoint for updating mode isn't provided, we'll just update locally
    try {
      // TODO: Implement API call to update device mode
      console.log(`Updating device ${deviceId} mode to ${newMode}`);
    } catch (error) {
      console.error('Error updating device mode:', error);
      // Revert the change if API call fails
      setDevices(devices.map(device => 
        device.id === deviceId ? { ...device, mode: device.mode } : device
      ));
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        {/* Floating Device Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 opacity-8 animate-pulse">
            <svg width="80" height="80" viewBox="0 0 80 80" className="text-white">
              <rect x="15" y="10" width="50" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="0.8"/>
              <rect x="25" y="20" width="30" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="0.6"/>
              <circle cx="40" cy="55" r="8" fill="none" stroke="currentColor" strokeWidth="0.7"/>
              <circle cx="40" cy="55" r="4" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </svg>
          </div>
          
          <div className="absolute top-3/4 right-1/4 opacity-6 animate-pulse delay-700 rotate-12">
            <svg width="70" height="70" viewBox="0 0 70 70" className="text-purple-300">
              <rect x="10" y="15" width="50" height="40" rx="6" fill="none" stroke="currentColor" strokeWidth="0.7"/>
              <rect x="20" y="25" width="30" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              <rect x="20" y="35" width="30" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10">
          {/* Navbar */}
          <Navbar activeTab="devices" />

          {/* Main Content */}
          <div className="px-4 mt-18 md:px-8 py-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
                {error}
                <button 
                  onClick={() => setError('')}
                  className="ml-2 text-red-300 hover:text-red-100"
                >
                  ×
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Device Management</h1>
                <p className="text-gray-300">Manage and monitor your biometric devices</p>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                {/* <button
                  onClick={fetchDevices}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Refresh
                </button> */}
                <button
                  onClick={handleAddDevice}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Device
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-300 text-sm">Total Devices</p>
                    <p className="text-2xl font-bold text-white">{devices.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-300 text-sm">Added Today</p>
                    <p className="text-2xl font-bold text-white">{addedToday}</p>
                  </div>
                </div>
              </div>
              
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-300 text-sm">Enrollment</p>
                    <p className="text-2xl font-bold text-white">{enrollmentDevices}</p>
                  </div>
                </div>
              </div>
              
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-300 text-sm">Attendance</p>
                    <p className="text-2xl font-bold text-white">{attendanceDevices}</p>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Devices Table */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
              {devices.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No devices found</p>
                  <p className="text-gray-400 text-sm">Add your first device to get started</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Device Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Department</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">UID</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date Added</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Mode</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {devices.map((device) => (
                          <tr key={device.id} className="hover:bg-white/5 transition-colors duration-200">
                            <td className="px-6 py-4 text-white font-medium">{device.name}</td>
                            <td className="px-6 py-4 text-gray-300">{device.department}</td>
                            <td className="px-6 py-4 text-purple-300 font-mono">{device.uid}</td>
                            <td className="px-6 py-4 text-gray-300">{device.date}</td>
                            <td className="px-6 py-4">
                              <select
                                value={device.mode}
                                onChange={(e) => handleModeChange(device.id, e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="enrollment" className="bg-gray-800">Enrollment</option>
                                <option value="attendance" className="bg-gray-800">Attendance</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteDevice(device.id)}
                                disabled={deleting === device.id}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deleting === device.id ? (
                                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden">
                    {devices.map((device) => (
                      <div key={device.id} className="p-4 border-b border-white/10 last:border-b-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-semibold text-base">{device.name}</h3>
                            <p className="text-gray-300 text-sm">{device.department}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteDevice(device.id)}
                            disabled={deleting === device.id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleting === device.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400">UID</p>
                            <p className="text-purple-300 font-mono">{device.uid}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Date Added</p>
                            <p className="text-white">{device.date}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-400 mb-1">Mode</p>
                            <select
                              value={device.mode}
                              onChange={(e) => handleModeChange(device.id, e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="enrollment" className="bg-gray-800">Enrollment</option>
                              <option value="attendance" className="bg-gray-800">Attendance</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Add Device Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 p-6 w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Device</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Device Name
                  </label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter device name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newDevice.department}
                    onChange={(e) => setNewDevice({...newDevice, department: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Device Mode
                  </label>
                  <select
                    value={newDevice.mode}
                    onChange={(e) => setNewDevice({...newDevice, mode: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="0" className="bg-gray-800">Enrollment</option>
                    <option value="1" className="bg-gray-800">Attendance</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitDevice}
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Add Device
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}