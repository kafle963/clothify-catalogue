import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  Plus, 
  BarChart3, 
  Settings, 
  LogOut,
  User,
  Bell
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
import { useVendorAuth } from '@/contexts/VendorAuthContext';

const VendorNavigation = () => {
  const { vendor, logout } = useVendorAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: '/vendor/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      path: '/vendor/products',
      label: 'Products',
      icon: Package
    },
    {
      path: '/vendor/add-product',
      label: 'Add Product',
      icon: Plus
    },
    {
      path: '/vendor/analytics',
      label: 'Analytics',
      icon: BarChart3
    }
  ];

  if (!vendor) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/vendor/dashboard" 
              className="flex items-center space-x-2 font-bold text-xl text-accent hover:text-accent/80 transition-colors"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-slate-400 rounded-lg flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span>Vendor Portal</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
                  }`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Approval Status Badge */}
            {!vendor.isApproved && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                Pending Approval
              </Badge>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                2
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      {vendor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">{vendor.businessName}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">{vendor.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/vendor/profile');
                }}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate('/vendor/settings');
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/" className="flex items-center w-full">
                    <Store className="mr-2 h-4 w-4" />
                    View Store
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-3 border-t">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-accent hover:bg-accent/10'
                  }`}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VendorNavigation;