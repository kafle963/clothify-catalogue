import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  MoreVertical,
  Package,
  Tag,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useVendorProducts } from '@/contexts/VendorProductsContext';
import { formatCurrency } from '@/utils/salesCalculations';

const PendingProducts = () => {
  const { vendor } = useVendorAuth();
  const { getProductsByStatus, deleteProduct, isLoading } = useVendorProducts();
  const navigate = useNavigate();
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const pendingProducts = getProductsByStatus('pending');

  const handleDeleteProduct = async (productId: number, productName: string) => {
    setDeletingProductId(productId);
    try {
      const success = await deleteProduct(productId);
      if (success) {
        // Product deleted successfully, context will update automatically
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeletingProductId(null);
    }
  };

  if (!vendor) {
    navigate('/vendor/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/vendor/dashboard')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pending Products</h1>
          <p className="text-muted-foreground">
            Review and manage products awaiting approval ({pendingProducts.length} total)
          </p>
        </div>
      </div>

      {/* Pending Products Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="text-muted-foreground">Loading pending products...</div>
        </div>
      ) : pendingProducts.length === 0 ? (
        <Card>
          <CardContent className="pt-16 pb-16 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Pending Products</h2>
            <p className="text-muted-foreground mb-8">
              All your products have been processed. Add new products to see them here while they await approval.
            </p>
            <Button 
              onClick={() => navigate('/vendor/add-product')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Package className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img
                  src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.images?.length || 0} image{product.images?.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    <span>{product.category}</span>
                  </div>
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

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Added {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1">Available Sizes:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.sizes.slice(0, 6).map((size) => (
                          <Badge key={size} variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                        {product.sizes.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.sizes.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {product.description && (
                    <div>
                      <p className="text-muted-foreground text-xs line-clamp-3">
                        {product.description}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    ID: {product.id}
                  </p>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigate('/vendor/products')}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/vendor/edit-product/${product.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/vendor/products')}>
                          <Eye className="mr-2 h-4 w-4" />
                          View in List
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
                              <AlertDialogTitle>Delete Pending Product</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{product.name}"? This action cannot be undone and will remove the product from the approval queue.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProduct(product.id!, product.name)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingProductId === product.id}
                              >
                                {deletingProductId === product.id ? 'Deleting...' : 'Delete Product'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {pendingProducts.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pending Products Summary</CardTitle>
            <CardDescription>Overview of products awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{pendingProducts.length}</div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(pendingProducts.reduce((sum, p) => sum + p.price, 0))}
                </div>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(pendingProducts.map(p => p.category)).size}
                </div>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PendingProducts;