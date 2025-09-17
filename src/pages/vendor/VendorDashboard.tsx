import React from 'react';
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Plus,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';

const VendorDashboard = () => {
  const { vendor } = useVendorAuth();
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const stats = {
    totalProducts: 12,
    activeProducts: 8,
    pendingProducts: 3,
    totalSales: 1250.50,
    monthlyRevenue: 3420.75,
    totalOrders: 42
  };

  const recentProducts = [
    {
      id: 1,
      name: "Summer Floral Dress",
      price: 89.99,
      status: "approved",
      sales: 15,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Classic Denim Jacket",
      price: 129.99,
      status: "pending",
      sales: 0,
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop"
    },
    {
      id: 3,
      name: "Leather Handbag",
      price: 199.99,
      status: "approved",
      sales: 8,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (!vendor) {
    navigate('/vendor/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {vendor.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with {vendor.businessName} today.
          </p>
        </div>

        {/* Approval Status Alert */}
        {!vendor.isApproved && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Account Pending Approval</p>
                  <p className="text-sm text-amber-700">
                    Your vendor account is currently under review. You can add products, but they won't be visible to customers until your account is approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} active • {stats.pendingProducts} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => navigate('/vendor/add-product')}
                className="w-full justify-start bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/vendor/products')}
                className="w-full justify-start"
              >
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/vendor/analytics')}
                className="w-full justify-start"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates on your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Summer Floral Dress approved</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Classic Denim Jacket under review</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>
                Your latest product uploads and their status
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/vendor/products')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 rounded-lg border bg-card">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{product.name}</h4>
                      {getStatusBadge(product.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${product.price} • {product.sales} sales
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default VendorDashboard;