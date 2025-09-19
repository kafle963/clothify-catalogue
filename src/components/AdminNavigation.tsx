import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  ShoppingCart,
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useData } from '@/contexts/DataContext';
import { useState } from 'react';

const AdminNavigation = () => {
  const { admin, logout, hasPermission } = useAdminAuth();
  const { vendors, products } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Calculate pending counts from real data
  const pendingVendors = vendors.filter(v => !v.isApproved).length;
  const pendingProducts = products.filter(p => p.status === 'pending').length;

  const navItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: null // Always accessible
    },
    {
      path: '/admin/vendors',
      label: 'Vendors',
      icon: Store,
      permission: { resource: 'vendors', action: 'read' },
      badge: pendingVendors > 0 ? pendingVendors : null
    },
    {
      path: '/admin/products',
      label: 'Products',
      icon: Package,
      permission: { resource: 'products', action: 'read' },
      badge: pendingProducts > 0 ? pendingProducts : null
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: Users,
      permission: { resource: 'users', action: 'read' }
    },
    {
      path: '/admin/orders',
      label: 'Orders',
      icon: ShoppingCart,
      permission: { resource: 'orders', action: 'read' }
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
      permission: { resource: 'analytics', action: 'read' }
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      permission: { resource: 'settings', action: 'read' }
    }
  ];

  const filteredNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission.resource, item.permission.action);
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'admin':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'moderator':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (!admin) {
    return null;
  }

  return (
    <>
      {/* Sidebar - Hidden by default on mobile, visible on desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-lg lg:translate-x-0 lg:z-auto lg:shadow-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden md:block">Admin Panel</span>
            </Link>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto mt-4 px-4 pb-4">
          <div className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setIsSidebarOpen(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom section - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 mt-auto">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                  {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{admin.name}</p>
                <p className="text-xs text-gray-500 truncate">{formatRole(admin.role)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                navigate('/');
                setIsSidebarOpen(false);
              }}
            >
              <Store className="mr-1 h-3 w-3" />
              View Store
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header with Hamburger */}
      <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Admin</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">{admin.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{admin.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              navigate('/');
            }}>
              <Store className="mr-2 h-4 w-4" />
              View Store
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default AdminNavigation;