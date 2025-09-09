'use client';

import { useState, useEffect,} from 'react';
import * as XLSX from 'xlsx';
import { Calendar, Clock, Filter, Download, Search, FileText, Users, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import ExcelJS from 'exceljs';


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
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [consolidateFilters, setConsolidateFilters] = useState({
    month: '',
    year: new Date().getFullYear().toString()
  });
  const [consolidateLoading, setConsolidateLoading] = useState(false);
  const [consolidateError, setConsolidateError] = useState('');

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
      
      const transformedLogs = result.data.map(log => ({
        id: log.serialnumber,
        name: log.username,
        serialNumber: log.serialnumber,
        deviceDept: log.department_name,
        date: log.checkindate,
        timeIn: log.timein,
        timeOut: log.timeout,
        deviceUid: log.device_uid,
        deviceBranch: log.device_branch,
        fingerout: log.fingerout
      }));

      setLogs(transformedLogs);
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

      const devicesResponse = await fetch('https://emsapi.disagglobal.com/api/devices/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!devicesResponse.ok) {
        throw new Error(`HTTP error! status: ${devicesResponse.status}`);
      }

      const devicesData = await devicesResponse.json();
      
      if (!devicesData.devices || !Array.isArray(devicesData.devices)) {
        throw new Error('Invalid devices data format');
      }

      setDevices(devicesData.devices);

      const departmentsResponse = await fetch('https://emsapi.disagglobal.com/api/departments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!departmentsResponse.ok) {
        throw new Error(`HTTP error! status: ${departmentsResponse.status}`);
      }

      const departmentsData = await departmentsResponse.json();

      const departmentNames = departmentsData.data.map(dept => dept.department_name);
      setDepartments(departmentNames);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to fetch data: ${err.message}`);
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
      const params = new URLSearchParams();
      const token = sessionStorage.getItem('access_token');
      
      if (filters.fromDate) params.append('date_from', filters.fromDate);
      if (filters.toDate) params.append('date_to', filters.toDate);
      if (filters.fromTime) params.append('time_from', filters.fromTime);
      if (filters.toTime) params.append('time_to', filters.toTime);
      if (filters.department) params.append('department_name', filters.department);
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
        deviceDept: log.department_name || log.device_dep, 
        date: log.checkindate,
        timeIn: log.timein,
        timeOut: log.timeout,
        deviceUid: log.device_uid,
        deviceBranch: log.device_branch,
        fingerout: log.fingerout
      }));

      setLogs(transformedLogs);
      // setPersonCount(transformedLogs.length);
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

    // Check if filtering for a single person within date range
    const isSinglePersonDateFilter = filters.employeeName && 
                                    filters.fromDate && 
                                    filters.toDate && 
                                    logs.length > 0;

    let exportData;
    
    if (isSinglePersonDateFilter) {
      // Calculate total days in date range
      const fromDate = new Date(filters.fromDate);
      const toDate = new Date(filters.toDate);
      const timeDifference = toDate.getTime() - fromDate.getTime();
      const totalDaysInRange = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
      
      const uniqueDates = [...new Set(logs.map(log => log.date))];
      const totalDaysWorked = uniqueDates.length;

      exportData = logs.map(log => ({
        'Name': log.name,
        'Employee ID': log.serialNumber,
        'Device Department': log.deviceDept,
        'Date': log.date,
        'Time In': log.timeIn,
        'Time Out': log.timeOut,
        'Working Hours': calculateWorkingHours(log.timeIn, log.timeOut)
      }));

      exportData.push({});  
      exportData.push({
        'Name': 'SUMMARY',
        'Employee ID': '',
        'Device Department': '',
        'Date': `${filters.fromDate} to ${filters.toDate}`,
        'Time In': '',
        'Time Out': '',
        'Working Hours': `${totalDaysWorked} out of ${totalDaysInRange} days`
      });
    } else {
      // Regular export without summary
      exportData = logs.map(log => ({
        'Name': log.name,
        'Employee ID': log.serialNumber,
        'Device Department': log.deviceDept,
        'Date': log.date,
        'Time In': log.timeIn,
        'Time Out': log.timeOut,
        'Working Hours': calculateWorkingHours(log.timeIn, log.timeOut)
      }));
    }

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Style the summary row if it exists (for single person filter)
    if (isSinglePersonDateFilter) {
      const summaryRowIndex = exportData.length - 1; 
      const cellAddress = XLSX.utils.encode_cell({r: summaryRowIndex, c: 0}); 
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "FFFF00" } } 
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UserLogs");

    XLSX.writeFile(wb, `user-logs-${new Date().toISOString().split('T')[0]}.xlsx`);
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
  const handleConsolidateExport = async () => {
    if (!consolidateFilters.month || !consolidateFilters.year) {
      setConsolidateError('Please select both month and year');
      return;
    }
  
    setConsolidateLoading(true);
    setConsolidateError('');
  
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(
        `https://emsapi.disagglobal.com/api/attendance-status?type=monthly&month=${consolidateFilters.month}&year=${consolidateFilters.year}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      generateConsolidateReport(result.data);
      setShowConsolidateModal(false);
    } catch (err) {
      setConsolidateError(`Failed to fetch data: ${err.message}`);
    } finally {
      setConsolidateLoading(false);
    }
  };
  
  const generateConsolidateReport = async (data) => {
    if (!data || data.length === 0) {
      alert('No data available for the selected month');
      return;
    }
  
    const employees = [...new Set(data.map(item => item.name))];
    const dates = [...new Set(data.map(item => item.date))].sort();
  
    const attendanceMatrix = {};
    employees.forEach(emp => {
      attendanceMatrix[emp] = {};
      dates.forEach(date => {
        attendanceMatrix[emp][date] = data.find(item => 
          item.name === emp && item.date === date
        ) || { status: 'Absent', department: '' };
      });
    });
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');
  

    worksheet.columns = [
      { width: 22 }, 
      { width: 18 }, 
      { width: 15 }, 
      ...dates.map(() => ({ width: 12 })), 
      { width: 15 }  
    ];
  
    const monthName = new Date(consolidateFilters.year, consolidateFilters.month - 1, 1)
      .toLocaleString('default', { month: 'long' });
  
    const titleRow = worksheet.addRow([`Attendance Report - ${monthName} ${consolidateFilters.year}`]);
    worksheet.mergeCells(1, 1, 1, 3 + dates.length + 1); 
    
    titleRow.height = 35;
    titleRow.getCell(1).font = { 
      bold: true, 
      size: 14,
      color: { argb: 'FF366092' }
    };
    titleRow.getCell(1).alignment = { 
      horizontal: 'center', 
      vertical: 'middle' 
    };
    titleRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F8FF' } 
    };

    worksheet.addRow([]);
  
    const headerRow = worksheet.addRow([
      'Employee Name', 
      'Department',
      'Days Present',
      ...dates.map(date => {
        const dateObj = new Date(date);
        const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const formattedDate = dateObj.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        return `${formattedDate}\n(${day})`;
      }),      
      'Attendance %'
    ]);
  
    headerRow.height = 40; 
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF366092' }
      };
      cell.font = { 
        bold: true, 
        color: { argb: 'FFFFFFFF' },
        size: 10 
      };
      cell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle',
        wrapText: true 
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    employees.forEach(employee => {
      const empData = attendanceMatrix[employee];
  
      let presentDays = 0;
      let totalWorkingDays = 0;
      let totalDays = dates.length;
  
      const statusData = dates.map(date => {
        const attendance = empData[date];
        const dateObj = new Date(date);
        const isSunday = dateObj.getDay() === 0;
        
        if (!isSunday) {
          totalWorkingDays++;
          if (attendance.status === 'Present') {
            presentDays++;
          }
        } else {
          if (attendance.status === 'Present') {
            presentDays++;
          }
        }
        
        return {
          status: attendance.status,
          isSunday,
          displayText: attendance.status === 'Present' ? '✓' : 
                      isSunday ? '-' : '✗'
        };
      });
  
      const attendancePercentage = totalWorkingDays > 0 ? 
        ((presentDays / totalWorkingDays) * 100).toFixed(1) + '%' : '0%';
      
      const daysPresent = `${presentDays}/${totalDays}`;

      const dataRow = worksheet.addRow([
        employee, // Employee Name
        empData[dates[0]]?.department || '', // Department
        daysPresent, // Days Present 
        ...statusData.map(item => item.displayText), // Date columns
        attendancePercentage // Attendance % 
      ]);
  
      dataRow.height = 29;

      dataRow.getCell(1).font = { bold: true };
      dataRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

      dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

      dataRow.getCell(3).font = { bold: true };
      dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      dataRow.getCell(3).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
  
      statusData.forEach((item, index) => {
        const cell = dataRow.getCell(4 + index); 
        
        if (item.status === 'Present') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC6EFCE' }
          };
          cell.font = { color: { argb: 'FF006100' } }; 
        } else if (item.isSunday) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }
          };
          cell.font = { color: { argb: 'FF595959' } }; 
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' } 
          };
          cell.font = { color: { argb: 'FF9C0006' } }; 
        }
        
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      const percentageCell = dataRow.getCell(4 + dates.length); 
      percentageCell.font = { bold: true };
      percentageCell.alignment = { horizontal: 'center', vertical: 'middle' };
      percentageCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance-Report-${monthName}-${consolidateFilters.year}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
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
              <button
                onClick={() => setShowConsolidateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Consolidate Report
              </button>
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
            {/* Consolidate Report Modal */}
            {showConsolidateModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold text-white mb-4">Generate Consolidate Report</h3>
                  
                  {consolidateError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {consolidateError}
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Month</label>
                      <select
                        value={consolidateFilters.month}
                        onChange={(e) => setConsolidateFilters(prev => ({...prev, month: e.target.value}))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                        required
                      >
                        <option value="">Select Month</option>
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i + 1} value={i + 1} className="bg-gray-800 text-white">
                            {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Year</label>
                      <input
                        type="number"
                        value={consolidateFilters.year}
                        onChange={(e) => setConsolidateFilters(prev => ({...prev, year: e.target.value}))}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        min="2020"
                        max="2030"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleConsolidateExport}
                      disabled={consolidateLoading || !consolidateFilters.month || !consolidateFilters.year}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {consolidateLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowConsolidateModal(false);
                        setConsolidateError('');
                      }}
                      className="flex-1 bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                    <div>
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
                    </div>

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
  );
}