import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, User, Settings } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface DebugResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const SupabaseDebug: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [envCheck, setEnvCheck] = useState<any>(null);

  useEffect(() => {
    checkEnvironment();
  }, []);

  const checkEnvironment = () => {
    const envStatus = {
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      url: import.meta.env.VITE_SUPABASE_URL,
      urlLength: import.meta.env.VITE_SUPABASE_URL?.length || 0,
      keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
      isDemo: import.meta.env.VITE_SUPABASE_URL === 'your_supabase_project_url' || 
              import.meta.env.VITE_SUPABASE_ANON_KEY === 'your_supabase_anon_key'
    };
    setEnvCheck(envStatus);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const diagnosticResults: DebugResult[] = [];

    // Test 1: Environment Variables
    try {
      if (!envCheck?.hasUrl || !envCheck?.hasKey || envCheck?.isDemo) {
        diagnosticResults.push({
          test: 'Environment Variables',
          status: 'error',
          message: 'Supabase environment variables not properly configured',
          details: envCheck
        });
      } else {
        diagnosticResults.push({
          test: 'Environment Variables',
          status: 'success',
          message: 'Environment variables are configured',
          details: {
            urlLength: envCheck.urlLength,
            keyLength: envCheck.keyLength
          }
        });
      }
    } catch (error) {
      diagnosticResults.push({
        test: 'Environment Variables',
        status: 'error',
        message: 'Failed to check environment variables',
        details: error
      });
    }

    // Test 2: Supabase Connection
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        diagnosticResults.push({
          test: 'Supabase Connection',
          status: 'error',
          message: `Connection failed: ${error.message}`,
          details: error
        });
      } else {
        diagnosticResults.push({
          test: 'Supabase Connection',
          status: 'success',
          message: 'Successfully connected to Supabase',
          details: { hasSession: !!data.session }
        });
      }
    } catch (error: any) {
      diagnosticResults.push({
        test: 'Supabase Connection',
        status: 'error',
        message: `Connection error: ${error.message}`,
        details: error
      });
    }

    // Test 3: Database Schema - Check if profiles table exists
    try {
      console.log('🔍 Testing profiles table existence...');
      
      // First try a simple query to see if table exists
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .limit(0);
      
      if (error) {
        console.error('❌ Profiles table test failed:', error);
        
        if (error.code === '42P01') {
          diagnosticResults.push({
            test: 'Database Schema',
            status: 'error',
            message: 'Profiles table does not exist in the database',
            details: { 
              code: error.code,
              solution: 'The profiles table needs to be created. This can happen if migrations haven\'t been run.',
              steps: [
                '1. Check if Supabase project has the profiles table',
                '2. Run database migrations if using Supabase CLI',
                '3. Manually create the table using the SQL from supabase/migrations/',
                '4. Ensure RLS policies are set up correctly'
              ]
            }
          });
        } else if (error.code === '42501') {
          diagnosticResults.push({
            test: 'Database Schema',
            status: 'error',
            message: 'Permission denied accessing profiles table',
            details: { 
              code: error.code,
              solution: 'RLS policies may be blocking access',
              steps: [
                '1. Check RLS policies on profiles table',
                '2. Ensure authenticated users can read/write their own profiles',
                '3. Verify user authentication status'
              ]
            }
          });
        } else {
          diagnosticResults.push({
            test: 'Database Schema',
            status: 'warning',
            message: `Schema check failed: ${error.message}`,
            details: {
              error,
              solution: 'Unexpected database error. Check Supabase logs for more details.'
            }
          });
        }
      } else {
        diagnosticResults.push({
          test: 'Database Schema',
          status: 'success',
          message: 'Profiles table exists and is accessible',
          details: { 
            tableExists: true,
            rowCount: count || 0,
            canAccess: true
          }
        });
      }
    } catch (error: any) {
      console.error('❌ Database schema test error:', error);
      diagnosticResults.push({
        test: 'Database Schema',
        status: 'error',
        message: `Schema check error: ${error.message}`,
        details: {
          error: error.message,
          stack: error.stack,
          solution: 'Check network connectivity and Supabase project configuration'
        }
      });
    }

    // Test 4: User Profile Fetch (if user is authenticated)
    if (user) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            diagnosticResults.push({
              test: 'User Profile',
              status: 'warning',
              message: 'User profile does not exist in database',
              details: { 
                code: error.code,
                userId: user.id,
                hint: 'Profile will be created automatically on next login'
              }
            });
          } else {
            diagnosticResults.push({
              test: 'User Profile',
              status: 'error',
              message: `Profile fetch failed: ${error.message}`,
              details: error
            });
          }
        } else {
          diagnosticResults.push({
            test: 'User Profile',
            status: 'success',
            message: 'User profile found and accessible',
            details: { 
              profileId: profile?.id,
              email: profile?.email,
              name: profile?.name
            }
          });
        }
      } catch (error: any) {
        diagnosticResults.push({
          test: 'User Profile',
          status: 'error',
          message: `Profile test error: ${error.message}`,
          details: error
        });
      }
    } else {
      diagnosticResults.push({
        test: 'User Profile',
        status: 'warning',
        message: 'No authenticated user to test profile fetch',
        details: { hint: 'Login to test profile functionality' }
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);

    // Show summary toast
    const errorCount = diagnosticResults.filter(r => r.status === 'error').length;
    const warningCount = diagnosticResults.filter(r => r.status === 'warning').length;
    
    if (errorCount === 0 && warningCount === 0) {
      toast.success('All Supabase diagnostics passed!');
    } else if (errorCount > 0) {
      toast.error(`${errorCount} error(s) found in Supabase configuration`);
    } else {
      toast.warning(`${warningCount} warning(s) found in Supabase configuration`);
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'warning') => {
    const colors = {
      success: 'bg-green-500/10 text-green-700 border-green-200',
      error: 'bg-red-500/10 text-red-700 border-red-200',
      warning: 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Supabase Diagnostic Tool</CardTitle>
          </div>
          <CardDescription>
            This tool helps diagnose Supabase connection and profile fetching issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Run Supabase Diagnostics
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Environment Status */}
      {envCheck && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {envCheck.hasUrl ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span>VITE_SUPABASE_URL</span>
                </div>
                <div className="flex items-center gap-2">
                  {envCheck.hasKey ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  <span>VITE_SUPABASE_ANON_KEY</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  URL Length: {envCheck.urlLength} chars
                </div>
                <div className="text-sm text-muted-foreground">
                  Key Length: {envCheck.keyLength} chars
                </div>
              </div>
            </div>
            
            {envCheck.isDemo && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Environment variables are still set to demo values. Please update your .env file with actual Supabase credentials.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diagnostic Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1 ml-7">
                    {result.message}
                  </p>
                  
                  {result.details && (
                    <details className="mt-2 ml-7">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View Details
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {index < results.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={checkEnvironment}
              className="justify-start"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Environment Check
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="justify-start"
            >
              <Database className="h-4 w-4 mr-2" />
              Open Supabase Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDebug;