import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Store, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVendorAuth } from '@/contexts/VendorAuthContext';

const VendorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useVendorAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    console.log('🚀 VendorLogin form submitted for:', email);
    
    setIsLoading(true);
    
    try {
      console.log('💤 Starting login process...');
      const success = await login(email, password);
      console.log('📊 Login result:', success);
      
      if (success) {
        console.log('✅ Login successful, navigating to dashboard...');
        // Scroll to top when navigating
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate('/vendor/dashboard');
      } else {
        console.log('❌ Login failed');
        // Error messages are handled in the login function
      }
    } catch (error) {
      console.error('💥 Login error in component:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Store Link */}
        <div className="text-center mb-6">
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-accent transition-colors text-sm"
          >
            ← Back to Store
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-accent to-slate-400 rounded-2xl flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Vendor Login</CardTitle>
            <CardDescription>
              Sign in to your vendor dashboard to manage your products
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Don't have a vendor account?{' '}
                <Link 
                  to="/vendor/signup" 
                  className="text-accent hover:underline font-medium"
                >
                  Sign up here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link 
                to="/vendor/forgot-password" 
                className="text-muted-foreground hover:text-accent transition-colors text-sm"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorLogin;