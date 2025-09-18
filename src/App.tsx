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
const PendingProducts = lazy(() => import('./pages/vendor/PendingProducts'));
const VendorAnalytics = lazy(() => import('./pages/vendor/VendorAnalytics'));
const VendorProfile = lazy(() => import('./pages/vendor/VendorProfile'));
const VendorSettings = lazy(() => import('./pages/vendor/VendorSettings'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const VendorManagement = lazy(() => import('./pages/admin/VendorManagement'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminSettings = lazy(() => import('./pages/admin/SettingsPage'));
const AdminOrders = lazy(() => import('./pages/admin/OrdersPage'));
const AdminAnalytics = lazy(() => import('./pages/admin/AnalyticsPage'));

// Context providers and components
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { AIProvider } from "./contexts/AIContext";
import { VendorAuthProvider } from "./contexts/VendorAuthContext";
import AdminDebugPage from "./pages/admin/AdminDebugPage";
import { VendorProductsProvider } from "./contexts/VendorProductsContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { DataProvider } from "./contexts/DataContext";
import AIAssistant from "./components/AIAssistant";
import VendorPageWrapper from "./components/vendor/VendorPageWrapper";
import AdminPageWrapper from "./components/AdminPageWrapper";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VendorAuthProvider>
          <AdminAuthProvider>
            <DataProvider>
              <VendorProductsProvider>
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
                          <Route path="/vendor/pending-products" element={<VendorPageWrapper><PendingProducts /></VendorPageWrapper>} />
                          <Route path="/vendor/analytics" element={<VendorPageWrapper><VendorAnalytics /></VendorPageWrapper>} />
                          <Route path="/vendor/profile" element={<VendorPageWrapper><VendorProfile /></VendorPageWrapper>} />
                          <Route path="/vendor/settings" element={<VendorPageWrapper><VendorSettings /></VendorPageWrapper>} />
                          
                          {/* Admin routes */}
                          <Route path="/admin/login" element={<AdminLogin />} />
                          <Route path="/admin/dashboard" element={<AdminPageWrapper><AdminDashboard /></AdminPageWrapper>} />
                          <Route path="/admin/vendors" element={<AdminPageWrapper><VendorManagement /></AdminPageWrapper>} />
                          <Route path="/admin/products" element={<AdminPageWrapper><ProductManagement /></AdminPageWrapper>} />
                          <Route path="/admin/users" element={<AdminPageWrapper><UserManagement /></AdminPageWrapper>} />
                          <Route path="/admin/orders" element={<AdminPageWrapper><AdminOrders /></AdminPageWrapper>} />
                          <Route path="/admin/analytics" element={<AdminPageWrapper><AdminAnalytics /></AdminPageWrapper>} />
                          <Route path="/admin/settings" element={<AdminPageWrapper><AdminSettings /></AdminPageWrapper>} />
                          <Route path="/admin/debug" element={<AdminPageWrapper><AdminDebugPage /></AdminPageWrapper>} />
                          
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
              </VendorProductsProvider>
            </DataProvider>
          </AdminAuthProvider>
        </VendorAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
