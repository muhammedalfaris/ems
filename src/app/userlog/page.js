'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { Calendar, Clock, Filter, Download, Search, FileText, Users, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';

export const PersonCountContext = createContext();

export default function UserLogPage() {
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    fromTime: '',
    toTime: '',
    employeeName: '',
    department: '',
    device: ''
  });

  const [logs, setLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [personCount, setPersonCount] = useState(0);

  // Fetch today's logs and devices on component mount
  useEffect(() => {
    fetchTodaysLogs();
    fetchDevices();
  }, []);

  const fetchTodaysLogs = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('access_token');
      
      const response = await fetch('https://emsapi.disagglobal.com/api/logs/today', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform API data to match our component structure
      const transformedLogs = result.data.map(log => ({
        id: log.serialnumber,
        name: log.username,
        serialNumber: log.serialnumber,
        deviceDept: log.device_dep,
        date: log.checkindate,
        timeIn: log.timein,
        timeOut: log.timeout,
        deviceUid: log.device_uid,
        deviceBranch: log.device_branch,
        fingerout: log.fingerout
      }));

      setLogs(transformedLogs);
      setPersonCount(transformedLogs.length);
      setIsFiltered(false);
    } catch (err) {
      setError(`Failed to fetch today's logs: ${err.message}`);
      console.error('Error fetching today\'s logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDevices = async () => {
    setDevicesLoading(true);
    try {
      const token = sessionStorage.getItem('access_token');
      
      const response = await fetch('https://emsapi.disagglobal.com/api/devices/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const deviceData = await response.json();
      setDevices(deviceData);
      
      // Extract unique departments from devices
      const uniqueDepartments = [...new Set(deviceData.map(device => device["Device Department"]))];
      setDepartments(uniqueDepartments);
      
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError(`Failed to fetch devices: ${err.message}`);
    } finally {
      setDevicesLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilter = async () => {
    setLoading(true);
    setError('');

    try {
      // Build query parameters
      const params = new URLSearchParams();
      const token = sessionStorage.getItem('access_token');
      
      if (filters.fromDate) params.append('date_from', filters.fromDate);
      if (filters.toDate) params.append('date_to', filters.toDate);
      if (filters.fromTime) params.append('time_from', filters.fromTime);
      if (filters.toTime) params.append('time_to', filters.toTime);
      if (filters.department) params.append('device_dep', filters.department);
      if (filters.employeeName) params.append('username', filters.employeeName);

      const apiUrl = `https://emsapi.disagglobal.com/api/logs?${params.toString()}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform API data to match our component structure
      const transformedLogs = result.data.map(log => ({
        id: log.id,
        name: log.username,
        serialNumber: log.serialnumber,
        deviceDept: log.device_dep,
        date: log.checkindate,
        timeIn: log.timein,
        timeOut: log.timeout,
        deviceUid: log.device_uid,
        deviceBranch: log.device_branch,
        fingerout: log.fingerout
      }));

      setLogs(transformedLogs);
      setPersonCount(transformedLogs.length);
      setIsFiltered(true);
    } catch (err) {
      setError(`Failed to fetch logs: ${err.message}`);
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      fromTime: '',
      toTime: '',
      employeeName: '',
      department: '',
      device: ''
    });
    fetchTodaysLogs();
    setError('');
  };

  const handleExportExcel = () => {
    if (logs.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare data for Excel export
    const exportData = logs.map(log => ({
      'ID': log.id,
      'Name': log.name,
      'Serial Number': log.serialNumber,
      'Device Department': log.deviceDept,
      'Date': log.date,
      'Time In': log.timeIn,
      'Time Out': log.timeOut,
      'Working Hours': calculateWorkingHours(log.timeIn, log.timeOut)
    }));

    // Convert to CSV format
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateWorkingHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 'N/A';
    
    const [inHour, inMin, inSec] = timeIn.split(':').map(Number);
    const [outHour, outMin, outSec] = timeOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin + (inSec / 60);
    const outMinutes = outHour * 60 + outMin + (outSec / 60);
    const diffMinutes = outMinutes - inMinutes;
    
    if (diffMinutes < 0) return 'N/A';
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.floor(diffMinutes % 60);
    
    return `${hours}h ${minutes}m`;
  };

  const getUniqueEmployees = () => {
    const uniqueNames = new Set(logs.map(log => log.name));
    return uniqueNames.size;
  };

  const getAverageWorkingHours = () => {
    if (logs.length === 0) return '0h';
    
    let totalMinutes = 0;
    let validLogs = 0;
    
    logs.forEach(log => {
      if (log.timeIn && log.timeOut) {
        const [inHour, inMin, inSec] = log.timeIn.split(':').map(Number);
        const [outHour, outMin, outSec] = log.timeOut.split(':').map(Number);
        
        const inMinutes = inHour * 60 + inMin + (inSec / 60);
        const outMinutes = outHour * 60 + outMin + (outSec / 60);
        const diffMinutes = outMinutes - inMinutes;
        
        if (diffMinutes > 0) {
          totalMinutes += diffMinutes;
          validLogs++;
        }
      }
    });
    
    if (validLogs === 0) return '0h';
    
    const avgMinutes = totalMinutes / validLogs;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.floor(avgMinutes % 60);
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <PersonCountContext.Provider value={personCount}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        {/* Floating Clock Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 opacity-8 animate-pulse">
            <svg width="60" height="60" viewBox="0 0 60 60" className="text-white">
              <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="0.8"/>
              <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="0.6"/>
              <line x1="30" y1="30" x2="30" y2="15" stroke="currentColor" strokeWidth="1"/>
              <line x1="30" y1="30" x2="40" y2="30" stroke="currentColor" strokeWidth="0.8"/>
            </svg>
          </div>
          
          <div className="absolute top-3/4 right-1/4 opacity-6 animate-pulse delay-700 rotate-45">
            <svg width="50" height="50" viewBox="0 0 50 50" className="text-purple-300">
              <rect x="10" y="10" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="0.7" rx="3"/>
              <line x1="15" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="0.5"/>
              <line x1="15" y1="25" x2="35" y2="25" stroke="currentColor" strokeWidth="0.5"/>
              <line x1="15" y1="30" x2="35" y2="30" stroke="currentColor" strokeWidth="0.5"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10">
          {/* Main Content */}
          <Navbar activeTab="userlog" />
          <div className="px-4 mt-18 md:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">User Activity Logs</h1>
                <p className="text-gray-300">Filter and export employee attendance logs</p>
              </div>
              {logs.length > 0 && (
                <button
                  onClick={handleExportExcel}
                  className="mt-4 md:mt-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 flex items-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export to Excel
                </button>
              )}
            </div>

            {/* Filter Section */}
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6 mb-8">
              <div 
                className="flex items-center justify-between cursor-pointer mb-2"
                onClick={() => setFilterExpanded(!filterExpanded)}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl mr-4">
                    <Filter className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Filter Logs</h2>
                </div>
                {filterExpanded ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {filterExpanded && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Date Range */}
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">From Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={filters.fromDate}
                          onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">To Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={filters.toDate}
                          onChange={(e) => handleFilterChange('toDate', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Time Range */}
                    {/* <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">From Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          value={filters.fromTime}
                          onChange={(e) => handleFilterChange('fromTime', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">To Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          value={filters.toTime}
                          onChange={(e) => handleFilterChange('toTime', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div> */}

                    {/* Additional Filters */}
                    {/* <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Employee Name</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search employee..."
                          value={filters.employeeName}
                          onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div> */}

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Department</label>
                      <div className="relative">
                        <select
                          value={filters.department}
                          onChange={(e) => handleFilterChange('department', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                          disabled={devicesLoading}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept, index) => (
                            <option key={index} value={dept} className="bg-gray-800 text-white">
                              {dept}
                            </option>
                          ))}
                        </select>
                        {devicesLoading && (
                          <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Device</label>
                      <div className="relative">
                        <select
                          value={filters.device}
                          onChange={(e) => handleFilterChange('device', e.target.value)}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                          disabled={devicesLoading}
                        >
                          <option value="">Select Device</option>
                          {devices.map((device, index) => (
                            <option key={index} value={device["Device Name"]} className="bg-gray-800 text-white">
                              {device["Device Name"]} - {device["Device Department"]}
                            </option>
                          ))}
                        </select>
                        {devicesLoading && (
                          <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                      {error}
                    </div>
                  )}

                  {/* Filter Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleFilter}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-101 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Apply Filters
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="flex-1 sm:flex-none bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Results Section */}
            {logs.length === 0 && loading ? (
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading...</h3>
                <p className="text-gray-300">Fetching today&apos;s logs</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-12 text-center">
                <div className="p-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Logs Found</h3>
                <p className="text-gray-300">Try adjusting your filters to find matching records</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-gray-300 text-sm">Total Records</p>
                        <p className="text-2xl font-bold text-white">{logs.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-gray-300 text-sm">Unique Employees</p>
                        <p className="text-2xl font-bold text-white">{getUniqueEmployees()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-gray-300 text-sm">Avg. Working Hours</p>
                        <p className="text-2xl font-bold text-white">{getAverageWorkingHours()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logs Table */}
                <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Employee ID</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Device Dept</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Time In</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Time Out</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Working Hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-white/5 transition-colors duration-200">
                            <td className="px-6 py-4 text-white font-medium">{log.name}</td>
                            <td className="px-6 py-4 text-purple-300">{log.serialNumber}</td>
                            <td className="px-6 py-4 text-gray-300">{log.deviceDept}</td>
                            <td className="px-6 py-4 text-gray-300">{log.date}</td>
                            <td className="px-6 py-4 text-green-400">{log.timeIn}</td>
                            <td className="px-6 py-4 text-red-400">{log.timeOut}</td>
                            <td className="px-6 py-4 text-yellow-400 font-semibold">
                              {calculateWorkingHours(log.timeIn, log.timeOut)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile/Tablet Cards */}
                  <div className="lg:hidden">
                    {logs.map((log) => (
                      <div key={log.id} className="p-4 border-b border-white/10 last:border-b-0">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-semibold text-lg">{log.name}</h3>
                            <p className="text-gray-300 text-sm">EMP ID: {log.serialNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-semibold text-sm">
                              {calculateWorkingHours(log.timeIn, log.timeOut)}
                            </p>
                            <p className="text-gray-400 text-xs">Working Hours</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400">Department</p>
                            <p className="text-white">{log.deviceDept}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Date</p>
                            <p className="text-white">{log.date}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Time In/Out</p>
                            <p className="text-green-400">{log.timeIn}</p>
                            <p className="text-red-400">{log.timeOut}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PersonCountContext.Provider>
  );
}