import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useVendorAuth } from '@/contexts/VendorAuthContext';

const VendorProducts = () => {
  const { vendor } = useVendorAuth();
  const navigate = useNavigate();

  // Mock products data - replace with actual API calls
  const products = [
    {
      id: 1,
      name: "Summer Floral Dress",
      price: 89.99,
      originalPrice: 129.99,
      category: "Women",
      status: "approved",
      sales: 15,
      views: 340,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=100&h=100&fit=crop",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Classic Denim Jacket",
      price: 129.99,
      category: "Unisex",
      status: "pending",
      sales: 0,
      views: 45,
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=100&h=100&fit=crop",
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      name: "Leather Handbag",
      price: 199.99,
      category: "Accessories",
      status: "approved",
      sales: 8,
      views: 180,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop",
      createdAt: "2024-01-10"
    },
    {
      id: 4,
      name: "Cotton T-Shirt",
      price: 29.99,
      category: "Men",
      status: "draft",
      sales: 0,
      views: 12,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
      createdAt: "2024-01-22"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!vendor) {
    navigate('/vendor/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Products</h1>
            <p className="text-muted-foreground">
              Manage your product catalog and track performance
            </p>
          </div>
          <Button 
            onClick={() => navigate('/vendor/add-product')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="pt-16 pb-16 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-4">No products yet</h2>
              <p className="text-muted-foreground mb-8">
                Start by adding your first product to your store
              </p>
              <Button 
                onClick={() => navigate('/vendor/add-product')}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
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
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sales</p>
                      <p className="font-medium">{product.sales}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Views</p>
                      <p className="font-medium">{product.views}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination would go here */}
        {products.length > 0 && (
          <div className="mt-8 flex justify-center">
            <p className="text-muted-foreground text-sm">
              Showing {products.length} of {products.length} products
            </p>
          </div>
        )}
      </div>
  );
};

export default VendorProducts;