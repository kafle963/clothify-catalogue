import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "@/pages/FavoritesPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AIProvider } from "./contexts/AIContext";
import AIAssistant from "./components/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AIProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIAssistant />
            </BrowserRouter>
            </TooltipProvider>
          </AIProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
