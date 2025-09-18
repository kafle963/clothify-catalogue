import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from '@/components/ui/sonner';

const AdminLogin = () => {
  const { admin, login, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (admin && !isLoading) {
      navigate('/admin/dashboard');
    }
  }, [admin, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    console.log('🚀 Admin login form submitted:', { email: formData.email });
    setIsSubmitting(true);
    
    try {
      console.log('📝 Attempting admin login...');
      const success = await login(formData.email, formData.password);
      console.log('📊 Login result:', success);
      
      if (success) {
        console.log('✅ Login successful, navigating to dashboard...');
        // Scroll to top when navigating (user preference)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/admin/dashboard');
      } else {
        console.log('❌ Login failed');
        // Error messages are handled in the login function
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the Clothify administration panel
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="admin@clothify.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Demo Credentials:</strong><br />
            Email: admin@clothify.com<br />
            Password: admin123
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-xs"
              >
                Clear Cache & Reload
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Need help? Contact your system administrator or{' '}
            <Button variant="link" className="p-0 h-auto text-blue-600" onClick={() => navigate('/')}>
              return to the store
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;