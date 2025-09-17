import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, User, Menu, LogOut, Shirt, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState, useEffect } from "react";
import AuthModal from "@/components/auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate, useLocation } from "react-router-dom";

const Navigation = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sync search query with URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search') || '';
    setSearchQuery(searchParam);
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Live search - navigate to products page with search query as user types
    if (value.trim()) {
      // Only navigate if we're not already on products page or if search query is different
      const currentParams = new URLSearchParams(location.search);
      const currentSearch = currentParams.get('search') || '';
      
      if (location.pathname !== '/products' || currentSearch !== value.trim()) {
        navigate(`/products?search=${encodeURIComponent(value.trim())}`);
      }
    } else if (location.pathname === '/products') {
      // Clear search if empty and we're on products page
      const params = new URLSearchParams(location.search);
      params.delete('search');
      navigate(`/products?${params.toString()}`);
    }
  };

  return (
    <>
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="bg-accent p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <Shirt className="h-6 w-6 text-accent-foreground" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold transition-all duration-300 group-hover:text-accent">
                Clothify
              </h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <button 
              onClick={() => navigate('/products?category=Women')}
              className="text-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium relative group text-sm xl:text-base"
            >
              Women
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => navigate('/products?category=Men')}
              className="text-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium relative group text-sm xl:text-base"
            >
              Men
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => navigate('/products?category=Kids')}
              className="text-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium relative group text-sm xl:text-base"
            >
              Kids
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => navigate('/products?category=Accessories')}
              className="text-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium relative group text-sm xl:text-base"
            >
              Accessories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="hidden lg:flex items-center relative max-w-xs xl:max-w-sm flex-1 mx-4 xl:mx-8 group">
            <form onSubmit={handleSearch} className="w-full relative flex">
              <div className="relative flex-1">
                <Search className="absolute left-3 h-4 w-4 top-3 text-muted-foreground transition-all duration-300 group-hover:text-accent group-active:text-accent group-focus-within:text-accent" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-3 bg-muted/50 border-0 focus:bg-background focus:shadow-card transition-all duration-300 hover:bg-muted/80 group-hover:shadow-md active:bg-muted/90 active:scale-[0.99] focus:scale-[1.01] rounded-r-none text-sm"
                />
              </div>
              <Button 
                type="submit" 
                size="sm"
                className="bg-accent hover:bg-accent/80 text-accent-foreground px-3 xl:px-4 py-2 rounded-l-none h-10 transition-all duration-300 hover:scale-105 hover:shadow-lg group-hover:shadow-lg group-hover:bg-accent/85 active:scale-95 active:bg-accent/70 focus:scale-105 focus:shadow-xl"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {user ? (
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="hover:bg-accent/30 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                        <User className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <TooltipContent>
                    <p>Account</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.name}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    Favorites
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    Order History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-accent/30 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Login / Sign Up</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-accent/30 relative transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                  onClick={() => navigate('/favorites')}
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Favorites {wishlistCount > 0 && `(${wishlistCount})`}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-accent/30 relative transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shopping Cart {itemCount > 0 && `(${itemCount})`}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-accent/30 transition-all duration-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Menu</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 h-4 w-4 top-3 text-muted-foreground transition-all duration-300 group-hover:text-accent" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 bg-muted/50 border-0 focus:bg-background focus:shadow-card transition-all duration-300 hover:bg-muted/80"
                />
              </div>
              <Button type="submit" size="sm" className="bg-accent hover:bg-accent/80 text-accent-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="ghost" 
                className="justify-start h-12 text-left"
                onClick={() => {
                  navigate('/products?category=Women');
                  setIsMobileMenuOpen(false);
                }}
              >
                Women
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start h-12 text-left"
                onClick={() => {
                  navigate('/products?category=Men');
                  setIsMobileMenuOpen(false);
                }}
              >
                Men
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start h-12 text-left"
                onClick={() => {
                  navigate('/products?category=Kids');
                  setIsMobileMenuOpen(false);
                }}
              >
                Kids
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start h-12 text-left"
                onClick={() => {
                  navigate('/products?category=Accessories');
                  setIsMobileMenuOpen(false);
                }}
              >
                Accessories
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
    
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navigation;