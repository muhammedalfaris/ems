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

  useEffect(() => {
    fetchEmployees();
    fetchActiveCount();
  }, []);

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
          device: employee.device,
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

  const handleFingerprintAction = (employee) => {
    console.log('Fingerprint action for employee:', employee);
  };

  // Calculate unique devices count
  const uniqueDevices = [...new Set(employees.map(emp => emp.device))].length;

  // Show loading state
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

  // Show error state
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
              <p className="text-gray-300">Manage your employee database</p>
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
            
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-300 text-sm">Devices</p>
                  <p className="text-2xl font-bold text-white">{uniqueDevices}</p>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Device</th>
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
                      <td className="px-6 py-4 text-cyan-300">{employee.device}</td>
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
                      <p className="text-gray-400">Device</p>
                      <p className="text-cyan-300">{employee.device}</p>
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
    </div>
    </>
  );
}