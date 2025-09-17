import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import Navigation from '@/components/Navigation';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
            <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go to Home
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>
            
            <Button 
              variant="ghost"
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              Browse Products
            </Button>
          </div>
          
          <div className="mt-12">
            <p className="text-sm text-muted-foreground">
              Need help? <a href="#" className="text-accent hover:underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;