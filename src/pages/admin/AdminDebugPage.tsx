import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Database, RefreshCw } from 'lucide-react';

interface DatabaseStats {
  vendors: any[];
  products: any[];
  profiles: any[];
  currentUser: any;
  errors: string[];
  accountSummary: {
    totalCustomers: number;
    totalVendors: number;
    approvedVendors: number;
    pendingVendors: number;
    vendorProfilesOnly: number;
    orphanedVendors: number;
    orphanedProfiles: number;
  };
}

const AdminDebugPage = () => {
  const [stats, setStats] = useState<DatabaseStats>({
    vendors: [],
    products: [],
    profiles: [],
    currentUser: null,
    errors: [],
    accountSummary: {
      totalCustomers: 0,
      totalVendors: 0,
      approvedVendors: 0,
      pendingVendors: 0,
      vendorProfilesOnly: 0,
      orphanedVendors: 0,
      orphanedProfiles: 0
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = async () => {
    setIsLoading(true);
    const errors: string[] = [];
    let vendors: any[] = [];
    let products: any[] = [];
    let profiles: any[] = [];
    let currentUser: any = null;

    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        errors.push(`Session error: ${sessionError.message}`);
      } else {
        currentUser = session?.user || null;
      }

      // Load vendors
      try {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*');
        
        if (vendorError) {
          errors.push(`Vendors error: ${vendorError.message}`);
        } else {
          vendors = vendorData || [];
        }
      } catch (error) {
        errors.push(`Vendors table error: ${error}`);
      }

      // Load products
      try {
        const { data: productData, error: productError } = await supabase
          .from('vendor_products')
          .select('*');
        
        if (productError) {
          errors.push(`Products error: ${productError.message}`);
        } else {
          products = productData || [];
        }
      } catch (error) {
        errors.push(`Products table error: ${error}`);
      }

      // Load profiles
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profileError) {
          errors.push(`Profiles error: ${profileError.message}`);
        } else {
          profiles = profileData || [];
        }
      } catch (error) {
        errors.push(`Profiles table error: ${error}`);
      }

    } catch (error) {
      errors.push(`General error: ${error}`);
    }

    // Calculate account summary
    const customerProfiles = profiles.filter(p => p.account_type === 'customer');
    const vendorProfiles = profiles.filter(p => p.account_type === 'vendor');
    const approvedVendors = vendors.filter(v => v.is_approved);
    const pendingVendors = vendors.filter(v => !v.is_approved);
    
    // Check for orphaned records
    const vendorEmails = vendors.map(v => v.email);
    const vendorProfileEmails = vendorProfiles.map(p => p.email);
    const orphanedVendors = vendors.filter(v => !vendorProfileEmails.includes(v.email));
    const orphanedProfiles = vendorProfiles.filter(p => !vendorEmails.includes(p.email));

    setStats({
      vendors,
      products,
      profiles,
      currentUser,
      errors,
      accountSummary: {
        totalCustomers: customerProfiles.length,
        totalVendors: vendorProfiles.length,
        approvedVendors: approvedVendors.length,
        pendingVendors: pendingVendors.length,
        vendorProfilesOnly: vendorProfiles.length,
        orphanedVendors: orphanedVendors.length,
        orphanedProfiles: orphanedProfiles.length
      }
    });
    setIsLoading(false);
  };

  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Debug Panel</h1>
          <p className="text-gray-600 mt-2">Diagnose Supabase connection and data issues</p>
        </div>
        <Button 
          onClick={loadDatabaseStats} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {isSupabaseConfigured ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Supabase Configuration</span>
            </div>
            <div className="flex items-center gap-2">
              {stats.currentUser ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>User Session</span>
            </div>
          </div>
          
          {stats.currentUser && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm"><strong>Current User:</strong> {stats.currentUser.email}</p>
              <p className="text-sm"><strong>User ID:</strong> {stats.currentUser.id}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Account Summary
          </CardTitle>
          <CardDescription>Complete breakdown of user accounts by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Accounts */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.accountSummary.totalCustomers}
              </div>
              <div className="text-sm font-medium text-blue-800">Customer Accounts</div>
              <div className="text-xs text-blue-600 mt-1">
                Users registered as customers
              </div>
            </div>
            
            {/* Vendor Accounts */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.accountSummary.totalVendors}
              </div>
              <div className="text-sm font-medium text-green-800">Vendor Accounts</div>
              <div className="text-xs text-green-600 mt-1">
                Users registered as vendors
              </div>
            </div>
            
            {/* Total Accounts */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.profiles.length}
              </div>
              <div className="text-sm font-medium text-purple-800">Total Accounts</div>
              <div className="text-xs text-purple-600 mt-1">
                All registered users
              </div>
            </div>
          </div>
          
          {/* Vendor Status Breakdown */}
          {stats.vendors.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Vendor Status Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{stats.accountSummary.approvedVendors}</div>
                  <div className="text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-600">{stats.accountSummary.pendingVendors}</div>
                  <div className="text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{stats.accountSummary.orphanedVendors}</div>
                  <div className="text-gray-600">Orphaned Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{stats.accountSummary.orphanedProfiles}</div>
                  <div className="text-gray-600">Orphaned Profiles</div>
                </div>
              </div>
              
              {(stats.accountSummary.orphanedVendors > 0 || stats.accountSummary.orphanedProfiles > 0) && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
                  <p className="font-medium text-amber-800">⚠️ Data Integrity Issues:</p>
                  {stats.accountSummary.orphanedVendors > 0 && (
                    <p className="text-amber-700">• {stats.accountSummary.orphanedVendors} vendor record(s) without user profiles</p>
                  )}
                  {stats.accountSummary.orphanedProfiles > 0 && (
                    <p className="text-amber-700">• {stats.accountSummary.orphanedProfiles} vendor profile(s) without vendor records</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.vendors.length}</div>
            <div className="space-y-2">
              {stats.vendors.slice(0, 3).map((vendor, index) => (
                <div key={vendor.id} className="text-sm p-2 bg-gray-50 rounded">
                  <p><strong>{vendor.business_name}</strong></p>
                  <p className="text-gray-600">{vendor.email}</p>
                  <Badge variant={vendor.is_approved ? "default" : "secondary"}>
                    {vendor.is_approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
              ))}
              {stats.vendors.length > 3 && (
                <p className="text-xs text-gray-500">...and {stats.vendors.length - 3} more</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.products.length}</div>
            <div className="space-y-2">
              {stats.products.slice(0, 3).map((product, index) => (
                <div key={product.id} className="text-sm p-2 bg-gray-50 rounded">
                  <p><strong>{product.name}</strong></p>
                  <p className="text-gray-600">${product.price}</p>
                  <Badge variant={
                    product.status === 'approved' ? "default" : 
                    product.status === 'pending' ? "secondary" : "destructive"
                  }>
                    {product.status}
                  </Badge>
                </div>
              ))}
              {stats.products.length > 3 && (
                <p className="text-xs text-gray-500">...and {stats.products.length - 3} more</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{stats.profiles.length}</div>
            <div className="space-y-2">
              {stats.profiles.slice(0, 3).map((profile, index) => (
                <div key={profile.id} className="text-sm p-2 bg-gray-50 rounded">
                  <p><strong>{profile.name}</strong></p>
                  <p className="text-gray-600">{profile.email}</p>
                  <Badge variant="outline">{profile.account_type}</Badge>
                </div>
              ))}
              {stats.profiles.length > 3 && (
                <p className="text-xs text-gray-500">...and {stats.profiles.length - 3} more</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errors */}
      {stats.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.errors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">If no products are showing:</h4>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-600">
                <li>Ensure a vendor is logged in (check User Session above)</li>
                <li>Vendor should navigate to /vendor/add-product and create products</li>
                <li>Products will appear with "pending" status initially</li>
                <li>Admin can then approve/reject products</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium">If Supabase connection fails:</h4>
              <ol className="list-decimal list-inside ml-4 space-y-1 text-gray-600">
                <li>Check environment variables in .env file</li>
                <li>Verify Supabase URL and anonymous key are correct</li>
                <li>Ensure database tables exist (run migrations)</li>
                <li>Check browser console for detailed errors</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDebugPage;