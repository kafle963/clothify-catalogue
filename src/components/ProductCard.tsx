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

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  
  const isWishlisted = isInWishlist(product.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
  
    // Add with first available size
    const defaultSize = product.sizes[0];
    addItem(product, defaultSize);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-3 hover:scale-105 bg-gradient-card"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-80 object-contain transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-accent text-accent-foreground px-2 py-1 text-xs font-medium rounded transition-all duration-300 group-hover:scale-110">
              New
            </span>
          )}
          {product.isSale && (
            <span className="bg-destructive text-destructive-foreground px-2 py-1 text-xs font-medium rounded transition-all duration-300 group-hover:scale-110">
              Sale
            </span>
          )}
        </div>
        
        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-110 ${
            isWishlisted ? 'text-red-500' : 'text-foreground'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
        >
          <Heart className={`h-4 w-4 transition-all duration-300 ${isWishlisted ? 'fill-current scale-110' : ''}`} />
        </Button>
        
        {/* Quick Add to Cart - appears on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button 
            className="w-full bg-white text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 shadow-lg"
            size="sm"
            onClick={handleAddToCart}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
      
      <div className="p-4" onClick={() => navigate(`/product/${product.id}`)}>
        <p className="text-sm text-muted-foreground mb-1 group-hover:text-accent/70 transition-colors duration-300">{product.category}</p>
        <h3 className="font-semibold mb-2 group-hover:text-accent transition-all duration-300">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold group-hover:text-accent transition-colors duration-300">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;