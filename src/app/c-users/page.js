'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Users, Smartphone, User, Plus, Edit, Trash2, Fingerprint, X} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const [activeToday, setActiveToday] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fingerprintId, setFingerprintId] = useState('');
  const [availableFingerprintIds, setAvailableFingerprintIds] = useState([]);
  const [isFingerprintLoading, setIsFingerprintLoading] = useState(false); 
  const [isPolling, setIsPolling] = useState(false); 
  const [pollingMessage, setPollingMessage] = useState('');
  const [fingerprintSuccess, setFingerprintSuccess] = useState(false);
  const [companyName, setCompanyName] = useState(''); 
  const [showDepartmentsModal, setShowDepartmentsModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    department_name: '',
    branch_id: '',
    name: '',
    email: '',
    password: ''
  });
  const [departmentErrors, setDepartmentErrors] = useState({});

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('access_token');
    const userType = sessionStorage.getItem('user_type');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (userType !== 'Company Admin') {
      router.push('/users');
      return;
    }
    
    const storedCompanyName = sessionStorage.getItem('company_name');
    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
    }
    
    fetchEmployees();
    fetchActiveCount();
    fetchDepartments(); 
  }, [router]);

  const fetchEmployees = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('access_token');
        const response = await fetch('https://emsapi.disagglobal.com/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Transform API data to match the expected format
        const transformedEmployees = result.data.map(employee => ({
          id: employee.id,
          name: employee.name,
          employeeId: employee.serialnumber,
          gender: employee.gender,
          hourlyPay: '₹25.00', // Default value since not provided in API
          fingerId: employee.fingerprint_id,
          date: employee.date,
          device: employee.device_name,
          deviceDept: employee.department_name,
          device_uid : employee.device_uid,
          fingerprintStatus: employee.fingerprint_status
        }));
        
        setEmployees(transformedEmployees);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchActiveCount = async() => {
    try{
      setLoading(true);
      const token = sessionStorage.getItem('access_token')
      const response = await fetch('https://emsapi.disagglobal.com/api/logs/today/active-count', {
        headers :{
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const countResult = await response.json();
      
      if (countResult?.active_user_count !== undefined) {
        setActiveToday(countResult.active_user_count);
      }
        
    }
    catch(err){
      setError(err.message);
      console.error('Error fetching employees:', err);
    }
    finally {
      setLoading(false);
    }
  }

  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      const token = sessionStorage.getItem('access_token');
      const response = await fetch('https://emsapi.disagglobal.com/api/branch', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setBranches(result || []);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    const errors = {};
    if (!newDepartment.department_name) errors.department_name = 'Department name is required';
    if (!newDepartment.branch_id) errors.branch_id = 'Branch is required';
    // if (!newDepartment.name) errors.name = 'Name is required';
    if (!newDepartment.email) errors.email = 'Email is required';
    if (!newDepartment.password || newDepartment.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
      setDepartmentErrors(errors);
      return;
    }

    try {
      setDepartmentsLoading(true);
      const token = sessionStorage.getItem('access_token');
      const userInfo = JSON.parse(sessionStorage.getItem('user_info'));
      const company_id = userInfo?.company_id;

      const payload = {
        ...newDepartment,
        company_id: company_id.toString()
      };

      const response = await fetch('https://emsapi.disagglobal.com/api/departments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh departments list
      await fetchDepartments();
      setShowAddDepartmentModal(false);
      setNewDepartment({
        department_name: '',
        branch_id: '',
        // name: '',
        email: '',
        password: ''
      });
      setDepartmentErrors({});
    } catch (err) {
      console.error('Error adding department:', err);
      setDepartmentErrors({ submit: err.message || 'Failed to add department' });
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const token = sessionStorage.getItem('access_token');
      const response = await fetch('https://emsapi.disagglobal.com/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setDepartments(result.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const handleAddEmployee = () => {
    router.push('/manage-users')
  };

  // const handleViewEmployee = (employee) => {
  //   console.log('View employee:', employee);
  // };

  const handleEditEmployee = (employee) => {
    // Store employee data in sessionStorage for editing
    sessionStorage.setItem('editUserData', JSON.stringify(employee));
    router.push(`/manage-users?id=${employee.id}`);
  };

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      setIsDeleting(true);
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`https://emsapi.disagglobal.com/api/manageusers/${employeeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove the deleted employee from the state
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
      
      console.log('Employee deleted successfully:', employeeToDelete);
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setEmployeeToDelete(null);
  };

  const handleFingerprintAction = async (employee) => {
    setSelectedEmployee(employee);
    setShowFingerprintModal(true);
    setIsFingerprintLoading(true);
    setFingerprintId('');
    setAvailableFingerprintIds([]);
    setFingerprintSuccess(false);
    setPollingMessage('');
    try {
      const token = sessionStorage.getItem('access_token');
      // Get available fingerprint IDs
      const idsRes = await fetch(`https://emsapi.disagglobal.com/api/manageusers/fingerprint-ids?device_uid=${employee.device_uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });
      if (!idsRes.ok) throw new Error('Failed to fetch available fingerprint IDs');
      const idsData = await idsRes.json();
      if (idsData.available_fingerprint_ids && idsData.available_fingerprint_ids.length > 0) {
        setAvailableFingerprintIds(idsData.available_fingerprint_ids);
        setFingerprintId(idsData.available_fingerprint_ids[0].toString());
      } else {
        setAvailableFingerprintIds([]);
        setFingerprintId('');
      }
    } catch (err) {
      setAvailableFingerprintIds([]);
      setFingerprintId('');
      setPollingMessage('Failed to fetch fingerprint data.');
      console.error(err);
    } finally {
      setIsFingerprintLoading(false);
    }
  };

  const handleScanFinger = async () => {
    if (!selectedEmployee || !fingerprintId) return;
    setIsFingerprintLoading(true);
    setPollingMessage('Assigning fingerprint...');
    setFingerprintSuccess(false);
    try {
      const token = sessionStorage.getItem('access_token');
      await fetch('https://emsapi.disagglobal.com/api/manageusers/assign-fingerprint', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serialnumber: selectedEmployee.employeeId,
          device_uid: selectedEmployee.device_uid,
          fingerprint_id: parseInt(fingerprintId)
        }),
      });
      // Start polling for scan status
      setIsPolling(true);
      setPollingMessage('Waiting for fingerprint scan...');
      pollScanStatus(selectedEmployee.employeeId, fingerprintId);
    } catch (err) {
      setPollingMessage('Failed to assign fingerprint.');
      setIsFingerprintLoading(false);
      setIsPolling(false);
      console.error(err);
    }
  };

  const deselectFingerprint = async (device_uid) => {
    try {
      const token = sessionStorage.getItem('access_token');
      await fetch('https://emsapi.disagglobal.com/api/manageusers/deselect-fingerprint', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_uid }),
      });
    } catch (err) {
      // Optionally log or ignore
      console.error('Failed to deselect fingerprint:', err);
    }
  };

  const pollScanStatus = async (serialnumber, fingerprintId) => {
    let attempts = 0;
    const maxAttempts = 30; // ~1 min
    const poll = async () => {
      try {
        const token = sessionStorage.getItem('access_token');
        const res = await fetch(`https://emsapi.disagglobal.com/api/manageusers/check-scan-status?serialnumber=${serialnumber}&device_uid=${selectedEmployee.device_uid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed') {
            setPollingMessage('Fingerprint scan completed and saved!');
            setFingerprintSuccess(true);
            setIsPolling(false);
            // Deselect the fingerprint after success
            await deselectFingerprint(selectedEmployee.device_uid);
            setTimeout(() => {
              setShowFingerprintModal(false);
              setSelectedEmployee(null);
              setFingerprintId('');
              setAvailableFingerprintIds([]);
              setFingerprintSuccess(false);
              setPollingMessage('');
              // Refresh the employees list to update fingerprint status
              fetchEmployees();
            }, 1500);
            return;
          } else if (data.status === 'failed') {
            setPollingMessage('Fingerprint scan failed. Please try again.');
            setIsPolling(false);
            setIsFingerprintLoading(false);
            await deselectFingerprint(selectedEmployee.device_uid);
            return;
          }
        }
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setPollingMessage('Scan timed out. Please try again.');
          setIsPolling(false);
          setIsFingerprintLoading(false);
          await deselectFingerprint(selectedEmployee.device_uid);
        }
      } catch (err) {
        setPollingMessage('Error during scan status check.');
        setIsPolling(false);
        setIsFingerprintLoading(false);
        await deselectFingerprint(selectedEmployee.device_uid);
        console.error(err);
      }
    };
    poll();
  };

  const closeFingerprintModal = async () => {
    if (selectedEmployee && (isPolling || isFingerprintLoading)) {
      await deselectFingerprint(selectedEmployee.device_uid);
    }
    setShowFingerprintModal(false);
    setSelectedEmployee(null);
    setFingerprintId('');
    setAvailableFingerprintIds([]);
    setFingerprintSuccess(false);
    setPollingMessage('');
    setIsFingerprintLoading(false);
    setIsPolling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error loading employees</div>
          <p className="text-white">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Retry
          </button>
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

      {/* Floating Fingerprint Patterns */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 opacity-8 animate-pulse">
          <svg width="70" height="90" viewBox="0 0 70 90" className="text-white">
            <path d="M35 10 C20 10, 10 20, 10 35 C10 50, 20 60, 35 60 C50 60, 60 50, 60 35 C60 20, 50 10, 35 10" fill="none" stroke="currentColor" strokeWidth="0.8"/>
            <path d="M35 15 C23 15, 15 23, 15 35 C15 47, 23 55, 35 55 C47 55, 55 47, 55 35 C55 23, 47 15, 35 15" fill="none" stroke="currentColor" strokeWidth="0.7"/>
            <path d="M35 20 C26 20, 20 26, 20 35 C20 44, 26 50, 35 50 C44 50, 50 44, 50 35 C50 26, 44 20, 35 20" fill="none" stroke="currentColor" strokeWidth="0.6"/>
          </svg>
        </div>
        
        <div className="absolute top-3/4 right-1/4 opacity-6 animate-pulse delay-700 rotate-45">
          <svg width="60" height="60" viewBox="0 0 60 60" className="text-purple-300">
            <path d="M30 5 C40 5, 50 15, 50 25 C50 35, 40 45, 30 45 C35 40, 40 35, 40 25 C40 20, 35 15, 30 15 C25 15, 20 20, 20 25 C20 35, 25 40, 30 45 C20 45, 10 35, 10 25 C10 15, 20 5, 30 5" fill="none" stroke="currentColor" strokeWidth="0.7"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <Navbar activeTab="users" />

        {/* Main Content */}
        <div className="px-4 mt-18 md:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Enrolled Employees</h1>
              <p className="text-gray-300">{companyName || 'Company Name'}</p>
            </div>
            <button
              onClick={handleAddEmployee}
              className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Employee
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-300 text-sm">Total Employees</p>
                  <p className="text-2xl font-bold text-white">{employees.length}</p>
                </div>
              </div>
            </div>
            
            <Link href="/userlog" passHref>
              <div className="cursor-pointer backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 transition hover:scale-[1.01] hover:border-white/40">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-300 text-sm">Active Today</p>
                    <p className="text-2xl font-bold text-white">{activeToday}</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <div 
              className="cursor-pointer backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 transition hover:scale-[1.01] hover:border-white/40"
              onClick={() => {
                setShowDepartmentsModal(true);
                fetchDepartments(); 
              }}
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-300 text-sm">Departments</p>
                  <p className="text-2xl font-bold text-white">{departments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Employee ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Gender</th>
                    {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Hourly Pay</th> */}
                    {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Finger ID</th> */}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 text-white font-medium">{employee.name}</td>
                      <td className="px-6 py-4 text-gray-300">{employee.employeeId}</td>
                      <td className="px-6 py-4 text-gray-300">{employee.gender}</td>
                      {/* <td className="px-6 py-4 text-green-400 font-semibold">{employee.hourlyPay}</td> */}
                      {/* <td className="px-6 py-4 text-purple-300">{employee.fingerId}</td> */}
                      <td className="px-6 py-4 text-gray-300">{employee.date}</td>
                      <td className="px-6 py-4 text-cyan-300">{employee.deviceDept}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {/* <button
                            onClick={() => handleViewEmployee(employee)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button> */}
                          {employee.fingerprintStatus !== 'Added' && (
                            <button
                              onClick={() => handleFingerprintAction(employee)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                              title="Fingerprint Added"
                            >
                              <Fingerprint className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {employees.map((employee) => (
                <div key={employee.id} className="p-4 border-b border-white/10 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{employee.name}</h3>
                      <p className="text-gray-300 text-sm">{employee.employeeId}</p>
                    </div>
                    <div className="flex space-x-1">
                      {/* <button
                        onClick={() => handleViewEmployee(employee)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </button> */}
                      {employee.fingerprintStatus !== 'Added' && (
                        <button
                          onClick={() => handleFingerprintAction(employee)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                          title="Fingerprint Added"
                        >
                          <Fingerprint className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Gender</p>
                      <p className="text-white">{employee.gender}</p>
                    </div>
                    {/* <div>
                      <p className="text-gray-400">Hourly Pay</p>
                      <p className="text-green-400 font-semibold">{employee.hourlyPay}</p>
                    </div> */}
                    {/* <div>
                      <p className="text-gray-400">Finger ID</p>
                      <p className="text-purple-300">{employee.fingerId}</p>
                    </div> */}
                    <div>
                      <p className="text-gray-400">Date</p>
                      <p className="text-white">{employee.date}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Department</p>
                      <p className="text-cyan-300">{employee.deviceDept}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
              <button
                onClick={cancelDelete}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                disabled={isDeleting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-300 text-sm">You&apos;re about to delete</p>
                  <p className="text-white font-semibold">{employeeToDelete?.name}</p>
                  <p className="text-gray-400 text-sm">Employee ID: {employeeToDelete?.employeeId}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                This action cannot be undone. This will permanently delete the employee record and all associated data.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEmployee}
                disabled={isDeleting}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Employee'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fingerprint Registration Modal */}
      {showFingerprintModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add Fingerprint</h3>
              <button
                onClick={closeFingerprintModal}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                disabled={isFingerprintLoading || isPolling}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <Fingerprint className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-300 text-sm">Adding fingerprint for</p>
                  <p className="text-white font-semibold">{selectedEmployee.name}</p>
                  <p className="text-gray-400 text-sm">Employee ID: {selectedEmployee.employeeId}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2" htmlFor="device">
                    Device
                  </label>
                  <input
                    type="text"
                    id="device"
                    value={selectedEmployee.device || ''}
                    readOnly
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2" htmlFor="fingerprintId">
                    Fingerprint ID
                  </label>
                  {isFingerprintLoading ? (
                    <input
                      type="text"
                      id="fingerprintId"
                      value="Fetching available IDs..."
                      readOnly
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : availableFingerprintIds.length > 0 ? (
                    <select
                      id="fingerprintId"
                      value={fingerprintId}
                      onChange={(e) => setFingerprintId(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {availableFingerprintIds.map(id => (
                        <option key={id} value={id} className="bg-slate-800">
                          {id}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="fingerprintId"
                      value="No available IDs"
                      readOnly
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                  {availableFingerprintIds.length === 0 && !isFingerprintLoading && (
                    <p className="text-red-400 text-xs mt-1">No available fingerprint IDs.</p>
                  )}
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="flex flex-col space-y-3">
              {isPolling || isFingerprintLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="text-white text-sm">{pollingMessage || 'Processing...'}</span>
                </div>
              ) : fingerprintSuccess ? (
                <div className="text-green-400 text-center font-semibold">Fingerprint scan completed and saved!</div>
              ) : (
                <>
                  <button
                    onClick={closeFingerprintModal}
                    className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
                    disabled={isFingerprintLoading || isPolling}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScanFinger}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
                    disabled={!fingerprintId || isFingerprintLoading || isPolling}
                  >
                    Scan Finger
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Departments Modal */}
      {showDepartmentsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Departments</h3>
              <button
                onClick={() => setShowDepartmentsModal(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6 max-h-96 overflow-y-auto">
              {departmentsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : departments.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No departments found</p>
              ) : (
                <ul className="space-y-2">
                  {departments.map(dept => (
                    <li key={dept.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white font-medium">{dept.department_name}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowAddDepartmentModal(true);
                  fetchBranches();
                }}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Department Modal */}
      {showAddDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-lg bg-white/10 rounded-2xl border border-white/20 p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New Department</h3>
              <button
                onClick={() => {
                  setShowAddDepartmentModal(false);
                  setNewDepartment({
                    department_name: '',
                    branch_id: '',
                    // name: '',
                    email: '',
                    password: ''
                  });
                  setDepartmentErrors({});
                }}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                disabled={departmentsLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Department Name</label>
                <input
                  type="text"
                  value={newDepartment.department_name}
                  onChange={(e) => setNewDepartment({...newDepartment, department_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter department name"
                />
                {departmentErrors.department_name && (
                  <p className="text-red-400 text-xs mt-1">{departmentErrors.department_name}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Branch</label>
                {branchesLoading ? (
                  <div className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-gray-400">
                    Loading branches...
                  </div>
                ) : (
                  <select
                    value={newDepartment.branch_id}
                    onChange={(e) => setNewDepartment({...newDepartment, branch_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select a branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id} className="bg-slate-800">
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                )}
                {departmentErrors.branch_id && (
                  <p className="text-red-400 text-xs mt-1">{departmentErrors.branch_id}</p>
                )}
              </div>

              {/* <div>
                <label className="block text-gray-300 text-sm mb-2">Admin Name</label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter admin name"
                />
                {departmentErrors.name && (
                  <p className="text-red-400 text-xs mt-1">{departmentErrors.name}</p>
                )}
              </div> */}

              <div>
                <label className="block text-gray-300 text-sm mb-2">Admin Email</label>
                <input
                  type="email"
                  value={newDepartment.email}
                  onChange={(e) => setNewDepartment({...newDepartment, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter admin email"
                />
                {departmentErrors.email && (
                  <p className="text-red-400 text-xs mt-1">{departmentErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Admin Password</label>
                <input
                  type="password"
                  value={newDepartment.password}
                  onChange={(e) => setNewDepartment({...newDepartment, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter password (min 6 characters)"
                />
                {departmentErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{departmentErrors.password}</p>
                )}
              </div>

              {departmentErrors.submit && (
                <div className="text-red-400 text-sm mt-2">{departmentErrors.submit}</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddDepartmentModal(false);
                  setNewDepartment({
                    department_name: '',
                    branch_id: '',
                    // name: '',
                    email: '',
                    password: ''
                  });
                  setDepartmentErrors({});
                }}
                className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
                disabled={departmentsLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDepartment}
                disabled={departmentsLoading}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {departmentsLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding...
                  </div>
                ) : (
                  'Add Department'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}