import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { User, Store, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'selection' | 'customer'>('selection');
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentView('selection');
      setLoginForm({ email: '', password: '' });
      setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
    }
  }, [isOpen]);

  const handleVendorLogin = () => {
    onClose();
    // Scroll to top when navigating to vendor login
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/vendor/login');
  };

  const handleAdminLogin = () => {
    onClose();
    // Scroll to top when navigating to admin login
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/admin/login');
  };

  const handleBackToSelection = () => {
    setCurrentView('selection');
    // Reset forms when going back
    setLoginForm({ email: '', password: '' });
    setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(loginForm.email, loginForm.password);
      if (success) {
        toast.success('Welcome back!');
        onClose();
        setLoginForm({ email: '', password: '' });
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Always sign up as a customer from this modal
      const success = await signup(signupForm.email, signupForm.password, signupForm.name, 'customer');
      if (success) {
        toast.success('Account created successfully! Welcome to Clothify!');
        onClose();
        setSignupForm({ name: '', email: '', password: '', confirmPassword: '' });
      } else {
        toast.error('Signup failed. Please check your details and try again.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. If this persists, please check the console for more details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {currentView === 'selection' ? (
          // User Type Selection View
          <>
            <DialogHeader>
              <DialogTitle className="text-center">Welcome to Clothify</DialogTitle>
              <p className="text-center text-muted-foreground text-sm">
                Choose how you'd like to access our platform
              </p>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-accent group"
                onClick={() => setCurrentView('customer')}
              >
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-colors">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Customer</CardTitle>
                  <CardDescription>
                    Shop our collection of premium clothing and accessories
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-accent group"
                onClick={handleVendorLogin}
              >
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-200 transition-colors">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Vendor</CardTitle>
                  <CardDescription>
                    Sell your products and manage your business on our platform
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-accent group"
                onClick={handleAdminLogin}
              >
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-200 transition-colors">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Admin</CardTitle>
                  <CardDescription>
                    Manage vendors, products, and oversee platform operations
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </>
        ) : (
          // Customer Login/Signup View
          <>
            <DialogHeader>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBackToSelection}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle>Customer Login</DialogTitle>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;