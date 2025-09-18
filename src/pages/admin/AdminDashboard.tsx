import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useData } from '@/contexts/DataContext';
import { AdminStats } from '@/types';
import { seedTestData, clearTestData } from '@/utils/testDataSeeder';
import { toast } from '@/components/ui/sonner';

const AdminDashboard = () => {
  const { admin, hasPermission } = useAdminAuth();
  const { getAdminStats, isLoadingUsers, isLoadingVendors, isLoadingProducts, vendors, products, users, refreshAllData } = useData();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    totalVendors: 0,
    pendingVendors: 0,
    approvedVendors: 0,
    rejectedVendors: 0,
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    rejectedProducts: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklySignups: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, [isLoadingUsers, isLoadingVendors, isLoadingProducts]);

  const loadAdminStats = async () => {
    // Wait for all data to load
    if (isLoadingUsers || isLoadingVendors || isLoadingProducts) {
      setIsLoading(true);
      return;
    }
    
    try {
      // Get real stats from DataContext
      const realStats = getAdminStats();
      setStats(realStats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedTestData = async () => {
    seedTestData();
    await refreshAllData();
    toast.success('Test data seeded successfully! Data relationships are now connected.');
  };

  const handleClearData = async () => {
    clearTestData();
    await refreshAllData(); 
    toast.success('All data cleared. System reset to empty state.');
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await refreshAllData();
      toast.success('Data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getVendorApprovalRate = () => {
    const total = stats.totalVendors;
    if (total === 0) return 0;
    return Math.round((stats.approvedVendors / total) * 100);
  };

  const getProductApprovalRate = () => {
    const total = stats.totalProducts;
    if (total === 0) return 0;
    return Math.round((stats.approvedProducts / total) * 100);
  };

  const getUserActivityRate = () => {
    const total = stats.totalUsers;
    if (total === 0) return 0;
    return Math.round((stats.activeUsers / total) * 100);
  };

  const quickActionItems = [
    {
      title: 'Review Pending Vendors',
      description: `${stats.pendingVendors} vendors awaiting approval`,
      icon: Store,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      action: () => navigate('/admin/vendors'),
      count: stats.pendingVendors,
      permission: { resource: 'vendors', action: 'read' }
    },
    {
      title: 'Review Pending Products',
      description: `${stats.pendingProducts} products awaiting approval`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      action: () => navigate('/admin/products'),
      count: stats.pendingProducts,
      permission: { resource: 'products', action: 'read' }
    },
    {
      title: 'User Management',
      description: `${stats.totalUsers} total users registered`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      action: () => navigate('/admin/users'),
      count: stats.totalUsers,
      permission: { resource: 'users', action: 'read' }
    },
    {
      title: 'Recent Orders',
      description: `${stats.totalOrders} orders processed`,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      action: () => navigate('/admin/orders'),
      count: stats.totalOrders,
      permission: { resource: 'orders', action: 'read' }
    }
  ];

  const filteredQuickActions = quickActionItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission.resource, item.permission.action);
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {admin?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your platform today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Data
          </Button>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {admin?.role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Badge>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              {' '}from last month
            </p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats.weeklySignups}
              </span>
              {' '}this week
            </p>
          </CardContent>
        </Card>

        {/* Total Vendors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedVendors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingVendors > 0 && (
                <span className="inline-flex items-center text-amber-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {stats.pendingVendors} pending
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingProducts > 0 && (
                <span className="inline-flex items-center text-amber-600">
                  <Clock className="h-3 w-3 mr-1" />
                  {stats.pendingProducts} pending
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Approval Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendor Approvals</CardTitle>
            <CardDescription>Current vendor approval status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Approval Rate</span>
              <span className="text-sm text-muted-foreground">{getVendorApprovalRate()}%</span>
            </div>
            <Progress value={getVendorApprovalRate()} className="h-2" />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Approved
                </div>
                <span>{stats.approvedVendors}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-600 mr-2" />
                  Pending
                </div>
                <span>{stats.pendingVendors}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  Rejected
                </div>
                <span>{stats.rejectedVendors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Approval Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Product Approvals</CardTitle>
            <CardDescription>Current product approval status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Approval Rate</span>
              <span className="text-sm text-muted-foreground">{getProductApprovalRate()}%</span>
            </div>
            <Progress value={getProductApprovalRate()} className="h-2" />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Approved
                </div>
                <span>{stats.approvedProducts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-600 mr-2" />
                  Pending
                </div>
                <span>{stats.pendingProducts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                  Rejected
                </div>
                <span>{stats.rejectedProducts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Activity</CardTitle>
            <CardDescription>User engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Users</span>
              <span className="text-sm text-muted-foreground">{getUserActivityRate()}%</span>
            </div>
            <Progress value={getUserActivityRate()} className="h-2" />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                  Active
                </div>
                <span>{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-600 mr-2" />
                  Total
                </div>
                <span>{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                  New this week
                </div>
                <span>{stats.weeklySignups}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredQuickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2 hover:border-blue-200 hover:bg-blue-50"
                  onClick={action.action}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <Icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    {action.count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {action.count}
                      </Badge>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Development Tools - Show data seeding options */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Development Tools</CardTitle>
            <CardDescription>Test data management and diagnostics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleSeedTestData}
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Seed Test Data
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearData}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Clear All Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/admin/debug', '_blank')}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Database Debug
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">📊 Current Data Status</h4>
                    <div className="text-xs space-y-1">
                      <p>• Products in database: {products.length}</p>
                      <p>• Vendors in database: {vendors.length}</p>
                      <p>• Users in database: {users.length}</p>
                      <p>• Customer accounts: {users.filter(u => u.account_type === 'customer').length}</p>
                      <p>• Vendor accounts: {users.filter(u => u.account_type === 'vendor').length}</p>
                      <p>• Loading states: {isLoadingProducts ? 'Loading...' : 'Ready'}</p>
                      <p>• Supabase configured: {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}</p>
                    </div>
                  </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">🔧 Troubleshooting</h4>
                  <div className="text-xs space-y-1">
                    <p>• If no products show: Vendor may need to login and add products</p>
                    <p>• Check browser console for errors</p>
                    <p>• Use "Refresh Data" button to reload from database</p>
                    <p>• Use "Database Debug" to inspect Supabase directly</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-muted-foreground border-t pt-3">
                <p><strong>Seed Test Data:</strong> Adds sample users, vendors, and products with interconnected relationships</p>
                <p><strong>Clear Data:</strong> Removes all data to demonstrate empty state behavior</p>
                <p><strong>Database Debug:</strong> Opens diagnostic view to check Supabase tables directly</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest system events and updates</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Real activity items based on actual data */}
            {vendors.filter(v => v.isApproved).slice(0, 1).map(vendor => (
              <div key={vendor.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Vendor "{vendor.businessName}" is approved</p>
                  <p className="text-xs text-muted-foreground">Active vendor</p>
                </div>
              </div>
            ))}
            
            {products.filter(p => p.status === 'pending').slice(0, 1).map(product => (
              <div key={product.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Product "{product.name}" awaiting review</p>
                  <p className="text-xs text-muted-foreground">Pending approval</p>
                </div>
              </div>
            ))}
            
            {vendors.filter(v => !v.isApproved).slice(0, 1).map(vendor => (
              <div key={vendor.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-amber-100 rounded-full">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New vendor application: "{vendor.businessName}"</p>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </div>
              </div>
            ))}
            
            {/* Show empty state if no activity */}
            {vendors.length === 0 && products.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Activity will appear here as vendors and products are added</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;