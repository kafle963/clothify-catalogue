import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
// Lazy load pages for better performance
const Index = lazy(() => import('./pages/Index'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Vendor pages
const VendorLogin = lazy(() => import('./pages/vendor/VendorLogin'));
const VendorSignup = lazy(() => import('./pages/vendor/VendorSignup'));
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
const VendorProducts = lazy(() => import('./pages/vendor/VendorProducts'));
const AddProduct = lazy(() => import('./pages/vendor/AddProduct'));
const VendorAnalytics = lazy(() => import('./pages/vendor/VendorAnalytics'));
const VendorProfile = lazy(() => import('./pages/vendor/VendorProfile'));
const VendorSettings = lazy(() => import('./pages/vendor/VendorSettings'));

// Context providers and components
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AIProvider } from "./contexts/AIContext";
import { VendorAuthProvider } from "./contexts/VendorAuthContext";
import AIAssistant from "./components/AIAssistant";
import VendorPageWrapper from "./components/vendor/VendorPageWrapper";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VendorAuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AIProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Suspense fallback={<LoadingSpinner fullScreen message="Loading page..." />}>
                      <Routes>
                        {/* Customer routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/product/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                        <Route path="/orders" element={<OrderHistoryPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/favorites" element={<FavoritesPage />} />
                        
                        {/* Vendor routes */}
                        <Route path="/vendor/login" element={<VendorLogin />} />
                        <Route path="/vendor/signup" element={<VendorSignup />} />
                        <Route path="/vendor/dashboard" element={<VendorPageWrapper><VendorDashboard /></VendorPageWrapper>} />
                        <Route path="/vendor/products" element={<VendorPageWrapper><VendorProducts /></VendorPageWrapper>} />
                        <Route path="/vendor/add-product" element={<VendorPageWrapper><AddProduct /></VendorPageWrapper>} />
                        <Route path="/vendor/analytics" element={<VendorPageWrapper><VendorAnalytics /></VendorPageWrapper>} />
                        <Route path="/vendor/profile" element={<VendorPageWrapper><VendorProfile /></VendorPageWrapper>} />
                        <Route path="/vendor/settings" element={<VendorPageWrapper><VendorSettings /></VendorPageWrapper>} />
                        
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    <AIAssistant />
                  </BrowserRouter>
                </TooltipProvider>
              </AIProvider>
            </WishlistProvider>
          </CartProvider>
        </VendorAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
