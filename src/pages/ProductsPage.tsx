import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { products } from '@/data/products';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, Search, Star, Filter } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { toast } from '@/components/ui/sonner';
import Navigation from '@/components/Navigation';
import StarRating from '@/components/StarRating';
import { useScrollToTopOnRouteChange } from '@/hooks/useScrollToTop';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  // Auto scroll to top on route changes
  useScrollToTopOnRouteChange();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('name');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) setSelectedCategory(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.reviews.some(review => 
          review.comment.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      const matchesRating = product.averageRating >= minRating;
      
      return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating-high':
          return b.averageRating - a.averageRating;
        case 'rating-low':
          return a.averageRating - b.averageRating;
        case 'reviews-most':
          return b.totalReviews - a.totalReviews;
        case 'reviews-least':
          return a.totalReviews - b.totalReviews;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, priceRange, sortBy, minRating]);



  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams);
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const toggleProductWishlist = (product: Product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product: Product) => {
    // For simplicity, we'll add the first available size
    const defaultSize = product.sizes[0];
    addItem(product, defaultSize);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Products</h1>
          
          {/* Search Bar */}
          {searchQuery && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Search results for: <span className="font-semibold text-accent">"{searchQuery}"</span>
              </p>
            </div>
          )}
          
          <div className="mb-4 sm:mb-6">
            <div className="relative max-w-full sm:max-w-md">
              <Search className="absolute left-3 h-4 w-4 top-3 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 bg-muted/50 border-0 focus:bg-background focus:shadow-card transition-all duration-300 hover:bg-muted/70 text-sm sm:text-base"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="space-y-4 sm:space-y-6">
            {/* Filter Toggle for Mobile */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            <Collapsible open={showFilters || window.innerWidth >= 1024} onOpenChange={setShowFilters}>
              <CollapsibleContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="text-sm sm:text-base">
                          {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name" className="text-sm sm:text-base">Name</SelectItem>
                      <SelectItem value="price-low" className="text-sm sm:text-base">Price: Low to High</SelectItem>
                      <SelectItem value="price-high" className="text-sm sm:text-base">Price: High to Low</SelectItem>
                      <SelectItem value="rating-high" className="text-sm sm:text-base">Rating: High to Low</SelectItem>
                      <SelectItem value="rating-low" className="text-sm sm:text-base">Rating: Low to High</SelectItem>
                      <SelectItem value="reviews-most" className="text-sm sm:text-base">Most Reviews</SelectItem>
                      <SelectItem value="reviews-least" className="text-sm sm:text-base">Least Reviews</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Minimum Rating Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">Min Rating:</span>
                    <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                      <SelectTrigger className="text-sm sm:text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="1">1+ Stars</SelectItem>
                        <SelectItem value="2">2+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    min={0}
                    step={10}
                    className="w-full max-w-full sm:max-w-md"
                  />
                </div>
                
                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceRange([0, 500]);
                    setMinRating(0);
                    setSortBy('name');
                    setSearchParams({});
                  }}
                  className="w-full sm:w-auto"
                >
                  Clear All Filters
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Results */}
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group cursor-pointer overflow-hidden border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-gradient-card">
              <div className="relative overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 sm:h-64 lg:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                
                {/* Badges */}
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
                  {product.isNew && (
                    <Badge className="bg-accent text-accent-foreground text-xs">
                      New
                    </Badge>
                  )}
                  {product.isSale && (
                    <Badge variant="destructive" className="text-xs">
                      Sale
                    </Badge>
                  )}
                </div>
                
                {/* Wishlist Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-2 sm:top-3 right-2 sm:right-3 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-smooth ${
                    isInWishlist(product.id) ? 'text-red-500' : 'text-foreground'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProductWishlist(product);
                  }}
                >
                  <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
                
                {/* Quick Add to Cart */}
                <div className="absolute inset-x-2 sm:inset-x-3 bottom-2 sm:bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    className="w-full bg-white text-foreground hover:bg-accent hover:text-accent-foreground transition-smooth text-xs sm:text-sm"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>
              
              <div className="p-3 sm:p-4" onClick={() => navigate(`/product/${product.id}`)}>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{product.category}</p>
                <h3 className="font-semibold mb-2 group-hover:text-accent transition-smooth text-sm sm:text-base line-clamp-2">
                  {product.name}
                </h3>
                
                {/* Rating and Reviews */}
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={product.averageRating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    ({product.totalReviews})
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs sm:text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-muted-foreground text-base sm:text-lg">No products found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-3 sm:mt-4 text-sm sm:text-base"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setPriceRange([0, 500]);
                setMinRating(0);
                setSortBy('name');
                setSearchParams({});
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;