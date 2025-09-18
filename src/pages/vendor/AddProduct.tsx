import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Upload, 
  DollarSign, 
  Tag, 
  FileText, 
  Image as ImageIcon,
  X,
  Plus,
  Camera
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
import { useVendorProducts } from '@/contexts/VendorProductsContext';
import VendorNavigation from '@/components/VendorNavigation';
import { VendorProduct } from '@/types';
import { processImageFiles, revokeImagePreview } from '@/utils/imageUpload';

const AddProduct = () => {
  const { vendor } = useVendorAuth();
  const { addProduct } = useVendorProducts();
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        revokeImagePreview(url);
      });
    };
  }, []);

  // Also cleanup when imagePreviews change
  useEffect(() => {
    return () => {
      // This cleanup runs before the next effect or on unmount
    };
  }, [imagePreviews]);

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

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const { validFiles, previews, errors } = processImageFiles(files);

    // Show any errors
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // Update state with new images
    setSelectedImages(prev => [...prev, ...validFiles]);
    setImagePreviews(prev => [...prev, ...previews]);

    // Update product with image data
    const allPreviews = [...imagePreviews, ...previews];
    setProduct(prev => ({
      ...prev,
      images: allPreviews,
      image: allPreviews[0] || ''
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    handleImageUpload(files);
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to free memory
    if (imagePreviews[index]) {
      revokeImagePreview(imagePreviews[index]);
    }

    // Remove from arrays
    const updatedFiles = selectedImages.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(updatedFiles);
    setImagePreviews(updatedPreviews);

    // Update product
    setProduct(prev => ({
      ...prev,
      images: updatedPreviews,
      image: updatedPreviews[0] || ''
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = false) => {
    e.preventDefault();
    
    if (!product.name || !product.price || !product.category || !product.description || selectedSizes.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    setIsLoading(true);

    try {
      // Create product data
      const productData = {
        ...product,
        vendorId: vendor?.id || '',
        status: asDraft ? 'draft' : 'pending',
        images: imagePreviews,
        image: imagePreviews[0] || '',
        sizes: selectedSizes
      } as Omit<VendorProduct, 'id' | 'createdAt' | 'updatedAt'>;

      // Add product using context
      const newProduct = await addProduct(productData);

      if (newProduct) {
        console.log('Product created:', newProduct);
        console.log('Images uploaded:', selectedImages.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        })));
        
        // Clean up object URLs
        imagePreviews.forEach(url => revokeImagePreview(url));
        
        navigate('/vendor/dashboard'); // Navigate to dashboard to see the pending product
      }
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
                  Upload images from your device (first image will be the main image). Max 5MB per image.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />

                {/* Upload button */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    isDragOver 
                      ? 'border-primary bg-primary/5 border-solid' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Camera className={`h-12 w-12 mx-auto mb-4 ${
                    isDragOver ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className="text-lg font-medium mb-2">
                    {isDragOver ? 'Drop images here' : 'Upload Product Images'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isDragOver 
                      ? 'Release to upload images' 
                      : 'Click to select images or drag and drop'
                    }
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileInput}
                    className="mx-auto"
                    disabled={isDragOver}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                  </Button>
                </div>

                {/* Image previews */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Selected Images ({imagePreviews.length})</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={triggerFileInput}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add More
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                          />
                          
                          {/* Main image badge */}
                          {index === 0 && (
                            <Badge className="absolute top-1 left-1 text-xs">
                              Main
                            </Badge>
                          )}
                          
                          {/* Remove button */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          
                          {/* Image info */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-md">
                            <div className="truncate">
                              {selectedImages[index]?.name.length > 15 
                                ? selectedImages[index]?.name.substring(0, 15) + '...'
                                : selectedImages[index]?.name
                              }
                            </div>
                            <div className="text-white/80">
                              {(selectedImages[index]?.size / 1024 / 1024).toFixed(1)}MB
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      💡 Tip: The first image will be used as the main product image. You can rearrange by removing and re-adding images in your preferred order.
                    </div>
                  </div>
                )}

                {/* Instructions when no images */}
                {imagePreviews.length === 0 && (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>📸 <strong>Image Requirements:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Supported formats: JPG, PNG, WebP, GIF</li>
                      <li>Maximum file size: 5MB per image</li>
                      <li>Recommended size: 800x800 pixels or higher</li>
                      <li>Use high-quality, well-lit photos</li>
                    </ul>
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