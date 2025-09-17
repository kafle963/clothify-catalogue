import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import VendorNavigation from '@/components/VendorNavigation';
import VendorAIAssistant from '@/components/vendor/VendorAIAssistant';

interface VendorPageWrapperProps {
  children: React.ReactNode;
}

const VendorPageWrapper: React.FC<VendorPageWrapperProps> = ({ children }) => {
  const location = useLocation();
  const { vendor } = useVendorAuth();
  
  // Don't show navigation and AI assistant on login/signup pages
  const isAuthPage = location.pathname === '/vendor/login' || location.pathname === '/vendor/signup';
  
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Check if vendor is authenticated for protected routes
  if (!vendor) {
    console.log('🔒 No vendor found, redirecting to login');
    // Scroll to top when redirecting
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return <Navigate to="/vendor/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavigation />
      <main className="flex-1">
        {children}
      </main>
      <VendorAIAssistant />
    </div>
  );
};

export default VendorPageWrapper;