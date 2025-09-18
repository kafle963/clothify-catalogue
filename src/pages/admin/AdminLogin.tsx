import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Lock, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
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
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (admin && !isLoading) {
      navigate('/admin/dashboard');
    }
  }, [admin, isLoading, navigate]);

  const validateForm = () => {
    const newErrors = { email: '', password: '', general: '' };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLockout = () => {
    setIsLocked(true);
    setLockoutTimer(30); // 30 seconds lockout
    
    const countdown = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsLocked(false);
          setLoginAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast.error(`Account temporarily locked. Try again in ${lockoutTimer} seconds.`);
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    console.log('🚀 Admin login form submitted:', { email: formData.email });
    setIsSubmitting(true);
    setErrors({ email: '', password: '', general: '' });
    
    try {
      console.log('📝 Attempting admin login...');
      const success = await login(formData.email, formData.password);
      console.log('📊 Login result:', success);
      
      if (success) {
        console.log('✅ Login successful, navigating to dashboard...');
        setLoginAttempts(0);
        // Scroll to top when navigating (user preference)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/admin/dashboard');
        toast.success('Login successful! Welcome to the admin panel.');
      } else {
        console.log('❌ Login failed');
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          handleLockout();
          setErrors({ ...errors, general: 'Too many failed attempts. Account locked for 30 seconds.' });
          toast.error('Account temporarily locked due to multiple failed login attempts.');
        } else {
          setErrors({ ...errors, general: `Invalid credentials. ${3 - newAttempts} attempts remaining.` });
          toast.error(`Invalid credentials. ${3 - newAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setErrors({ ...errors, general: 'An unexpected error occurred. Please try again.' });
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
    
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Portal</h2>
          <p className="mt-3 text-base text-gray-600">
            Secure access to the Clothify administration panel
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center font-semibold">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Sign in to your admin account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errors.general}
                  </AlertDescription>
                </Alert>
              )}

              {/* Lockout Warning */}
              {isLocked && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Lock className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Account locked for security. Try again in {lockoutTimer} seconds.
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your admin email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 transition-colors duration-200 ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting || isLocked}
                  />
                  {!errors.email && formData.email && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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
                    className={`pl-10 pr-16 transition-colors duration-200 ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    disabled={isSubmitting || isLocked}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting || isLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                  {!errors.password && formData.password && formData.password.length >= 6 && (
                    <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg h-12 text-base font-medium"
                disabled={isSubmitting || isLocked}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Authenticating...
                  </div>
                ) : isLocked ? (
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Locked ({lockoutTimer}s)
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Sign In Securely
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials Alert */}
        <Alert className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-2">
              <div>
                <strong className="text-blue-900">Demo Credentials:</strong>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3" />
                  <span>admin@clothify.com</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFormData(prev => ({ ...prev, email: 'admin@clothify.com' }))}
                    className="h-6 px-2 text-xs text-blue-700 hover:bg-blue-100"
                  >
                    Fill
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="h-3 w-3" />
                  <span>admin123</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFormData(prev => ({ ...prev, password: 'admin123' }))}
                    className="h-6 px-2 text-xs text-blue-700 hover:bg-blue-100"
                  >
                    Fill
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFormData({ email: 'admin@clothify.com', password: 'admin123' })}
                  className="text-xs h-7 text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Fill Both
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-xs h-7"
                >
                  Clear Cache
                </Button>
              </div>
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