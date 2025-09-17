import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ShoppingBag, ArrowLeft, Plus, Minus, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/components/ui/sonner';
import Navigation from '@/components/Navigation';
import StarRating from '@/components/StarRating';
import ReviewCard from '@/components/ReviewCard';
import ReviewSummary from '@/components/ReviewSummary';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const product = products.find(p => p.id === parseInt(id || ''));
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewSortBy, setReviewSortBy] = useState('newest');
  
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Scroll to top when component mounts or product changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [id]); // Re-run when product ID changes

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Button onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    addItem(product, selectedSize, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Sort reviews based on selection
  const sortedReviews = product?.reviews ? [...product.reviews].sort((a, b) => {
    switch (reviewSortBy) {
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      case 'newest':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-1 sm:gap-2">
                {product.isNew && (
                  <Badge className="bg-accent text-accent-foreground text-xs sm:text-sm">
                    New
                  </Badge>
                )}
                {product.isSale && (
                  <Badge variant="destructive" className="text-xs sm:text-sm">
                    Sale
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <p className="text-sm sm:text-base text-muted-foreground">{product.category}</p>
                <div className="flex items-center gap-2">
                  <StarRating rating={product.averageRating} size="sm" />
                  <span className="text-sm text-muted-foreground">({product.totalReviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg sm:text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.isSale && (
                  <Badge variant="destructive" className="text-xs sm:text-sm">
                    Save ${product.originalPrice! - product.price}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Description</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3 text-base sm:text-lg">Size</h3>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full text-sm sm:text-base">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizes.map(size => (
                    <SelectItem key={size} value={size} className="text-sm sm:text-base">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3 text-base sm:text-lg">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <span className="text-base sm:text-lg font-medium w-8 sm:w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 text-sm sm:text-base"
                size="lg"
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => product && toggleWishlist(product)}
                className={`text-sm sm:text-base sm:w-auto w-full ${isWishlisted ? 'text-red-500 border-red-500' : ''}`}
              >
                <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                <span className="ml-2 sm:hidden">Add to Wishlist</span>
              </Button>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs sm:text-sm">
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details and Reviews Tabs */}
        <div className="mt-8 sm:mt-12">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" className="text-sm sm:text-base">Product Details</TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm sm:text-base">
                Reviews ({product.totalReviews})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6 sm:mt-8">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">Product Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base mb-2">Category</h4>
                      <p className="text-sm sm:text-base text-muted-foreground">{product.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm sm:text-base mb-2">Available Sizes</h4>
                      <p className="text-sm sm:text-base text-muted-foreground">{product.sizes.join(', ')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm sm:text-base mb-2">Price</h4>
                      <p className="text-sm sm:text-base text-muted-foreground">${product.price}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm sm:text-base mb-2">Stock Status</h4>
                      <p className={`text-sm sm:text-base ${
                        product.inStock ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3">Description</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6 sm:mt-8">
              <div className="space-y-6 sm:space-y-8">
                {/* Review Summary */}
                <ReviewSummary 
                  reviews={product.reviews}
                  averageRating={product.averageRating}
                  totalReviews={product.totalReviews}
                />
                
                {/* Review Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg sm:text-xl font-semibold">
                    Customer Reviews ({product.totalReviews})
                  </h3>
                  <Select value={reviewSortBy} onValueChange={setReviewSortBy}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="rating-high">Highest Rating</SelectItem>
                      <SelectItem value="rating-low">Lowest Rating</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Reviews List */}
                <div className="space-y-4 sm:space-y-6">
                  {sortedReviews.length > 0 ? (
                    sortedReviews.map((review) => (
                      <ReviewCard 
                        key={review.id} 
                        review={review}
                        onHelpfulClick={(reviewId) => {
                          // In a real app, this would update the helpful count
                          toast.success('Thank you for your feedback!');
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <Star className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">No reviews yet</h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Be the first to review this product!
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Write a Review Button */}
                <div className="text-center pt-6 border-t border-border">
                  <Button size="lg" className="text-sm sm:text-base">
                    Write a Review
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <div className="relative overflow-hidden rounded-lg mb-2 sm:mb-3">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name}
                      className="w-full h-32 sm:h-48 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-medium mb-1 group-hover:text-accent transition-smooth text-sm sm:text-base line-clamp-2">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-1 sm:mb-2">{relatedProduct.category}</p>
                  
                  {/* Rating for related products */}
                  <div className="flex items-center gap-1 mb-1">
                    <StarRating rating={relatedProduct.averageRating} size="sm" />
                    <span className="text-xs text-muted-foreground">({relatedProduct.totalReviews})</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="font-bold text-sm sm:text-base">${relatedProduct.price}</span>
                    {relatedProduct.originalPrice && (
                      <span className="text-xs sm:text-sm text-muted-foreground line-through">
                        ${relatedProduct.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;