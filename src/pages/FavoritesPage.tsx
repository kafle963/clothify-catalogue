import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/sonner';
import Navigation from '@/components/Navigation';
import { Product } from '@/types';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
  const { addItem } = useCart();

  // Scroll to top when component mounts
  useScrollToTop([]);

  const handleAddToCart = (product: Product) => {
    const defaultSize = product.sizes[0];
    addItem(product, defaultSize);
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
  };

  const handleClearWishlist = () => {
    if (wishlistCount > 0) {
      clearWishlist();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-accent/20 transition-all duration-300 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Favorites</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {wishlistCount === 0 
                  ? "You haven't added any favorites yet" 
                  : `${wishlistCount} item${wishlistCount !== 1 ? 's' : ''} in your favorites`
                }
              </p>
            </div>
            
            {wishlistCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistCount === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="mb-4 sm:mb-6">
              <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-md mx-auto px-4">
                Start browsing and add items to your favorites by clicking the heart icon
              </p>
            </div>
            <Button 
              onClick={() => navigate('/products')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 sm:px-8 py-2 sm:py-3 rounded-md font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {wishlistItems.map((product) => (
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
                  
                  {/* Remove from Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 sm:top-3 right-2 sm:right-3 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-smooth text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(product.id);
                    }}
                  >
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
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
        )}

        {/* Continue Shopping */}
        {wishlistCount > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <Button 
              onClick={() => navigate('/products')}
              variant="outline"
              className="px-6 sm:px-8 py-2 sm:py-3 hover:bg-accent hover:text-accent-foreground transition-all duration-300 text-sm sm:text-base"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;