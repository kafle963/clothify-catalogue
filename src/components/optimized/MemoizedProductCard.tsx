import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface ProductCardProps {
  product: Product;
}

const MemoizedProductCard = React.memo<ProductCardProps>(({ product }) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const isWishlisted = isInWishlist(product.id);
  
  const handleAddToCart = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes[0];
    addItem(product, defaultSize);
    toast.success(`${product.name} added to cart!`);
  }, [product, addItem]);

  const handleWishlistToggle = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  }, [product, toggleWishlist]);

  const handleCardClick = React.useCallback(() => {
    navigate(`/product/${product.id}`);
  }, [product.id, navigate]);

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-3 hover:scale-105 bg-gradient-card"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 sm:h-56 object-contain transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full backdrop-blur-sm transition-colors ${
              isWishlisted 
                ? 'bg-red-500/90 text-white hover:bg-red-600/90' 
                : 'bg-white/90 text-gray-700 hover:bg-white hover:text-red-500'
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            size="sm"
            className="h-8 px-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-lg"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-accent mb-2">
          ${product.price.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {product.sizes.slice(0, 4).map((size) => (
            <span 
              key={size} 
              className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
            >
              {size}
            </span>
          ))}
          {product.sizes.length > 4 && (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              +{product.sizes.length - 4} more
            </span>
          )}
        </div>
      </div>
    </Card>
  );
});

MemoizedProductCard.displayName = 'MemoizedProductCard';

export default MemoizedProductCard;