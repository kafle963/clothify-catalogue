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
  Tag,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useData } from '@/contexts/DataContext';
import { AdminDataService } from '@/lib/adminUtils';
import { VendorProduct } from '@/types';
import { toast } from '@/components/ui/sonner';

const ProductManagement = () => {
  const { admin, hasPermission } = useAdminAuth();
  const { products, updateProduct, isLoadingProducts, refreshAllData } = useData();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState<VendorProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingProductId, setProcessingProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<VendorProduct | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalMessage, setApprovalMessage] = useState('');
  const [bulkSelection, setBulkSelection] = useState<number[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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

  const handleApproveProduct = async (productId: number, message?: string) => {
    if (!hasPermission('products', 'approve')) {
      toast.error('You do not have permission to approve products');
      return;
    }

    setProcessingProductId(productId.toString());
    try {
      // Simulate realistic API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const product = products.find(p => p.id === productId);
      
      // Update product status using AdminDataService
      const success = await AdminDataService.updateProductStatus(productId, 'approved', admin?.id);
      
      if (success) {
        // Update local state
        updateProduct(productId, { 
          status: 'approved' as const
        } as Partial<VendorProduct>);
        
        toast.success(`Product "${product?.name}" approved successfully!`);
        
        // Simulate notification to vendor
        setTimeout(() => {
          toast.info(`Approval notification sent to vendor`);
        }, 1000);
        
        setApprovalMessage('');
      } else {
        toast.error('Failed to approve product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Failed to approve product. Please try again.');
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleRejectProduct = async (productId: number, reason?: string) => {
    if (!hasPermission('products', 'reject')) {
      toast.error('You do not have permission to reject products');
      return;
    }

    if (!reason?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setProcessingProductId(productId.toString());
    try {
      // Simulate realistic API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const product = products.find(p => p.id === productId);
      
      const success = await AdminDataService.updateProductStatus(productId, 'rejected', admin?.id);
      
      if (success) {
        // Update local state with rejection info
        updateProduct(productId, { 
          status: 'rejected' as const
        } as Partial<VendorProduct>);
        
        toast.success(`Product "${product?.name}" rejected and vendor notified`);
        
        // Simulate notification to vendor
        setTimeout(() => {
          toast.info(`Rejection notification sent to vendor`);
        }, 1000);
        
        setRejectionReason('');
      } else {
        toast.error('Failed to reject product');
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('Failed to reject product. Please try again.');
    } finally {
      setProcessingProductId(null);
    }
  };

  const handleBulkApproval = async () => {
    if (bulkSelection.length === 0) {
      toast.error('Please select products to approve');
      return;
    }

    setIsBulkProcessing(true);
    try {
      for (const productId of bulkSelection) {
        await handleApproveProduct(productId, 'Bulk approved - Your product is now live!');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`Successfully approved ${bulkSelection.length} products`);
      setBulkSelection([]);
    } catch (error) {
      toast.error('Some approvals failed. Please check and retry.');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const toggleBulkSelection = (productId: number) => {
    setBulkSelection(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllPending = () => {
    const pendingProducts = filteredProducts.filter(p => p.status === 'pending').map(p => p.id!);
    setBulkSelection(pendingProducts);
  };

  const handleRefreshData = async () => {
    try {
      await refreshAllData();
      toast.success('Product data refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh data');
    }
  };

  const getProductQualityScore = (product: VendorProduct) => {
    let score = 0;
    const maxScore = 10;
    
    // Check various quality factors
    if (product.name?.length > 10) score += 2;
    if (product.description?.length > 50) score += 2;
    if (product.image && product.image !== '') score += 2;
    if (product.sizes?.length > 0) score += 1;
    if (product.price > 0) score += 1;
    if (product.category && product.category !== '') score += 1;
    if (product.originalPrice && product.originalPrice > product.price) score += 1;
    
    return Math.round((score / maxScore) * 100);
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-gray-600">
            Review and manage vendor product submissions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {bulkSelection.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleBulkApproval}
                disabled={isBulkProcessing}
                className="bg-green-600 hover:bg-green-700 text-sm"
              >
                {isBulkProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve Selected ({bulkSelection.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => setBulkSelection([])}
                className="text-sm"
              >
                Clear Selection
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefreshData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Badge variant="outline" className="text-sm">
              {filteredProducts.length} of {products.length} products
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
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
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Live</p>
                <p className="text-2xl font-bold">{products.filter(p => p.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
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

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Quality</p>
                <p className="text-2xl font-bold">{Math.round(products.reduce((acc, p) => acc + getProductQualityScore(p), 0) / products.length || 0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Live</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {filteredProducts.filter(p => p.status === 'pending').length > 0 && (
                <Button
                  variant="outline"
                  onClick={selectAllPending}
                  className="text-sm whitespace-nowrap"
                >
                  Select All Pending
                </Button>
              )}
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
                
                {product.status === 'pending' && (
                  <div className="absolute top-2 left-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={bulkSelection.includes(product.id!)}
                      onChange={() => toggleBulkSelection(product.id!)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 flex-1">{product.name}</h3>
                    <Badge variant="secondary" className="text-xs ml-2 whitespace-nowrap">
                      {getProductQualityScore(product)}% Quality
                    </Badge>
                  </div>
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
                
                <Progress value={getProductQualityScore(product)} className="h-1.5 mb-4" />
                
                {product.status === 'pending' && (
                  <div className="flex space-x-2 pt-2 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
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
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Product: {product.name}</DialogTitle>
                          <DialogDescription>
                            Approve this product to make it live on the platform.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="approval-message">Approval Message (Optional)</Label>
                          <Textarea
                            id="approval-message"
                            placeholder="Congratulations! Your product has been approved and is now live..."
                            value={approvalMessage}
                            onChange={(e) => setApprovalMessage(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setApprovalMessage('')}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              handleApproveProduct(product.id!, approvalMessage);
                              setApprovalMessage('');
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve Product
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={processingProductId === product.id?.toString()}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Product: {product.name}</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this product? The vendor will be notified with your reason.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                          <Label htmlFor="rejection-reason">Reason for rejection *</Label>
                          <Textarea
                            id="rejection-reason"
                            placeholder="Please provide a clear reason for rejection (required)..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="mt-2"
                            required
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setRejectionReason('')}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRejectProduct(product.id!, rejectionReason)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={!rejectionReason.trim()}
                          >
                            Reject Product
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                
                {product.status !== 'pending' && (
                  <div className="pt-2 border-t flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 mr-2"
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          View Vendor
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="mr-2 h-4 w-4" />
                          View Reviews
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Product Details: {selectedProduct?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(selectedProduct.status)}
                      <Badge variant="secondary">{selectedProduct.category}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Price</Label>
                      <p className="font-semibold">{formatCurrency(selectedProduct.price)}</p>
                    </div>
                    {selectedProduct.originalPrice && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Original Price</Label>
                        <p className="text-muted-foreground line-through">{formatCurrency(selectedProduct.originalPrice)}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Sizes</Label>
                      <p>{selectedProduct.sizes.join(', ')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Submitted</Label>
                      <p>{formatDate(selectedProduct.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">{selectedProduct.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;