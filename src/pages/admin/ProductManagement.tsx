import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Eye,
  Search,
  Filter,
  Package,
  Image,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useData } from '@/contexts/DataContext';
import { AdminDataService } from '@/lib/adminUtils';
import { VendorProduct } from '@/types';
import { toast } from '@/components/ui/sonner';

const ProductManagement = () => {
  const { admin, hasPermission } = useAdminAuth();
  const { products, updateProduct, isLoadingProducts } = useData();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState<VendorProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission('products', 'read')) {
      navigate('/admin/dashboard');
      return;
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterStatus]);

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => product.status === filterStatus);
    }

    setFilteredProducts(filtered);
  };

  const handleApproveProduct = async (productId: number) => {
    if (!hasPermission('products', 'approve')) {
      toast.error('You do not have permission to approve products');
      return;
    }

    setProcessingProductId(productId.toString());
    try {
      const success = await AdminDataService.updateProductStatus(productId, 'approved', admin?.id);
      
      if (success) {
        // Update local state
        updateProduct(productId, { status: 'approved' as const });
        toast.success('Product approved successfully!');
      } else {
        toast.error('Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Failed to approve product');
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleRejectProduct = async (productId: number) => {
    if (!hasPermission('products', 'reject')) {
      toast.error('You do not have permission to reject products');
      return;
    }

    setProcessingProductId(productId.toString());
    try {
      const success = await AdminDataService.updateProductStatus(productId, 'rejected', admin?.id);
      
      if (success) {
        // Update local state
        updateProduct(productId, { status: 'rejected' as const });
        toast.success('Product rejected successfully!');
      } else {
        toast.error('Failed to reject product');
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('Failed to reject product');
    } finally {
      setProcessingProductId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Draft
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoadingProducts) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-gray-600">
            Review and manage vendor product submissions
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredProducts.length} of {products.length} products
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'rejected').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No products have been submitted yet'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(product.status)}
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Submitted {formatDate(product.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    Sizes: {product.sizes.join(', ')}
                  </div>
                </div>
                
                {product.status === 'pending' && (
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleApproveProduct(product.id!)}
                      disabled={processingProductId === product.id?.toString()}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processingProductId === product.id?.toString() ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRejectProduct(product.id!)}
                      disabled={processingProductId === product.id?.toString()}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
                
                {product.status !== 'pending' && (
                  <div className="pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManagement;