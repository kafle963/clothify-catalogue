import React, { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Plus,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useVendorProducts } from '@/contexts/VendorProductsContext';
import { formatCurrency, getRevenueInsights } from '@/utils/salesCalculations';

const VendorDashboard = () => {
  const { vendor } = useVendorAuth();
  const { products, getProductsByStatus, getRecentProducts, isLoading, calculateStats, deleteProduct } = useVendorProducts();
  const navigate = useNavigate();
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  // Get real stats from context
  const stats = calculateStats();

  const recentProducts = getRecentProducts(3);
  const pendingProducts = getProductsByStatus('pending');

  const handleDeleteProduct = async (productId: number, productName: string) => {
    setDeletingProductId(productId);
    try {
      const success = await deleteProduct(productId);
      if (success) {
        // Product deleted successfully, the context will update automatically
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeletingProductId(null);
    }
  };

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

        {/* Revenue Information for New Vendors */}
        {stats.totalProducts > 0 && stats.monthlyRevenue === 0 && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Revenue Tracking</p>
                  <p className="text-sm text-blue-700">
                    Your revenue and order statistics will appear here once customers start purchasing your products. 
                    {stats.activeProducts === 0 
                      ? 'Get your products approved to start selling!' 
                      : 'Share your products to start getting sales!'}
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
                {stats.activeProducts} active • {stats.pendingProducts} pending • {stats.draftProducts} draft
                {stats.rejectedProducts > 0 && ` • ${stats.rejectedProducts} rejected`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.monthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {getRevenueInsights(stats.totalProducts, stats.activeProducts, stats.monthlyRevenue)}
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
                {stats.totalProducts === 0 
                  ? 'No products added yet'
                  : stats.activeProducts === 0 
                  ? 'Waiting for product approval'
                  : stats.totalOrders === 0
                  ? 'Ready to receive orders'
                  : 'Orders this month'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Pending Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              <CardTitle className="flex items-center justify-between">
                <span>Pending Products</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{stats.pendingProducts}</Badge>
                  {pendingProducts.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/vendor/pending-products')}
                    >
                      View All
                    </Button>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Products awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getProductsByStatus('pending').length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No pending products. All your products are processed!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors">
                      <img 
                        src={product.image || 'https://via.placeholder.com/48x48?text=No+Image'} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=No+Image';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-amber-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-amber-700">
                              {formatCurrency(product.price)} • {product.category}
                            </p>
                            <p className="text-xs text-amber-600">
                              Added {new Date(product.createdAt).toLocaleDateString()}
                            </p>
                            {product.sizes && product.sizes.length > 0 && (
                              <p className="text-xs text-amber-600">
                                Sizes: {product.sizes.slice(0, 3).join(', ')}
                                {product.sizes.length > 3 && ` +${product.sizes.length - 3} more`}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/vendor/products`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/vendor/edit-product/${product.id}`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Product
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteProduct(product.id!, product.name)}
                                        className="bg-red-600 hover:bg-red-700"
                                        disabled={deletingProductId === product.id}
                                      >
                                        {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingProducts.length > 3 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/vendor/pending-products')}
                      className="w-full mt-3"
                    >
                      View All {stats.pendingProducts} Pending Products
                    </Button>
                  )}
                </div>
              )}
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading products...</div>
              </div>
            ) : recentProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first product to your store
                </p>
                <Button 
                  onClick={() => navigate('/vendor/add-product')}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <img 
                      src={product.image || 'https://via.placeholder.com/64x64?text=No+Image'} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=No+Image';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium truncate">{product.name}</h4>
                        {getStatusBadge(product.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)} • {product.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                      {product.sizes && product.sizes.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Sizes: {product.sizes.slice(0, 4).join(', ')}
                          {product.sizes.length > 4 && ` +${product.sizes.length - 4} more`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => navigate('/vendor/products')} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/vendor/edit-product/${product.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id!, product.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deletingProductId === product.id}
                                >
                                  {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default VendorDashboard;