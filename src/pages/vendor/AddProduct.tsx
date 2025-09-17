import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Upload, 
  DollarSign, 
  Tag, 
  FileText, 
  Image as ImageIcon,
  X,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import VendorNavigation from '@/components/VendorNavigation';
import { VendorProduct } from '@/types';

const AddProduct = () => {
  const { vendor } = useVendorAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [product, setProduct] = useState<Partial<VendorProduct>>({
    name: '',
    price: 0,
    originalPrice: undefined,
    category: '',
    description: '',
    sizes: [],
    isNew: false,
    isSale: false,
    inStock: true,
    images: [],
    vendorId: vendor?.id || '',
    status: 'draft'
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  const categories = [
    'Women',
    'Men', 
    'Kids',
    'Accessories',
    'Unisex'
  ];

  const availableSizes = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL',
    '6', '7', '8', '9', '10', '11', '12',
    'One Size'
  ];

  const handleInputChange = (field: keyof VendorProduct, value: any) => {
    setProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => {
      const updated = prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size];
      
      setProduct(prevProduct => ({ ...prevProduct, sizes: updated }));
      return updated;
    });
  };

  const handleImageUrlChange = (index: number, url: string) => {
    const updated = [...imageUrls];
    updated[index] = url;
    setImageUrls(updated);
    
    // Update product images, filtering out empty URLs
    const validUrls = updated.filter(url => url.trim() !== '');
    setProduct(prev => ({ 
      ...prev, 
      images: validUrls,
      image: validUrls[0] || '' // First image as main image
    }));
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated);
    
    const validUrls = updated.filter(url => url.trim() !== '');
    setProduct(prev => ({ 
      ...prev, 
      images: validUrls,
      image: validUrls[0] || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    
    if (!product.name || !product.price || !product.category || !product.description || selectedSizes.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newProduct: VendorProduct = {
        ...product,
        id: Date.now(),
        vendorId: vendor?.id || '',
        status: asDraft ? 'draft' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviews: [],
        averageRating: 0,
        totalReviews: 0
      } as VendorProduct;

      console.log('Product created:', newProduct);
      
      if (asDraft) {
        alert('Product saved as draft!');
      } else {
        alert('Product submitted for review!');
      }
      
      navigate('/vendor/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vendor) {
    navigate('/vendor/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <VendorNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Add New Product</h1>
            <p className="text-muted-foreground">
              Create a new product listing for your store
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Enter the basic details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Summer Floral Dress"
                      value={product.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={product.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product in detail..."
                    value={product.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Pricing</span>
                </CardTitle>
                <CardDescription>
                  Set the pricing for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Current Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={product.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00 (optional)"
                      value={product.originalPrice || ''}
                      onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || undefined)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Only fill this if the product is on sale
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSale"
                      checked={product.isSale}
                      onCheckedChange={(checked) => handleInputChange('isSale', checked)}
                    />
                    <Label htmlFor="isSale" className="text-sm">Mark as Sale Item</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNew"
                      checked={product.isNew}
                      onCheckedChange={(checked) => handleInputChange('isNew', checked)}
                    />
                    <Label htmlFor="isNew" className="text-sm">Mark as New Arrival</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sizes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5" />
                  <span>Available Sizes</span>
                </CardTitle>
                <CardDescription>
                  Select all available sizes for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {availableSizes.map((size) => (
                    <div
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`cursor-pointer p-3 text-center rounded-md border transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-accent text-accent-foreground border-accent'
                          : 'bg-background hover:bg-muted border-border'
                      }`}
                    >
                      {size}
                    </div>
                  ))}
                </div>
                {selectedSizes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Selected sizes:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSizes.map((size) => (
                        <Badge key={size} variant="secondary">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Product Images</span>
                </CardTitle>
                <CardDescription>
                  Add image URLs for your product (first image will be the main image)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                      />
                    </div>
                    {imageUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeImageUrl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImageUrl}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Image
                </Button>

                {product.images && product.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {product.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=Image+Error';
                          }}
                        />
                        {index === 0 && (
                          <Badge className="absolute top-1 left-1 text-xs">
                            Main
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Status */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Status</CardTitle>
                <CardDescription>
                  Set the availability status of your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={product.inStock}
                    onCheckedChange={(checked) => handleInputChange('inStock', checked)}
                  />
                  <Label htmlFor="inStock">Product is in stock and available for purchase</Label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vendor/products')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;