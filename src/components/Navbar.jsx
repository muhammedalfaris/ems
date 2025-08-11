import { useState } from 'react';
import { Users, UserCog, FileText, Smartphone, User, Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar({ activeTab = 'users' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

    const userType = typeof window !== 'undefined' ? sessionStorage.getItem('user_type') : null;
    console.log('User Type:', userType);

    const navItems = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'manage', label: 'Manage Users', icon: UserCog },
    { id: 'userlog', label: 'User Log', icon: FileText },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'profile', label: 'Profile', icon: User }
  ].filter(item => !(userType === 'Department Admin' && item.id === 'devices'));

  const handleNavClick = (tabId) => {
    let routes = {
      users: '/users',
      manage: '/manage-users',
      userlog: '/userlog',
      devices: '/device',
      profile: '/profile',
    };
    
    // For Company Admin, redirect users tab to c-users
    if (userType === 'Company Admin' && tabId === 'users') {
      routes.users = '/c-users';
    }
    
    if (routes[tabId]) {
      router.push(routes[tabId]);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Clear all session storage
    sessionStorage.clear();
    router.push('/login');
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 hidden md:flex items-center justify-between px-8 py-4 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-lg border-b border-white/10 ">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">EMS Portal</h1>
            <p className="text-xs text-gray-300">Employee Management</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Profile/Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </nav>

      {/* Mobile Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 md:hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg shadow-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">EMS Portal</h1>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="px-4 py-3 border-t border-white/10">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}