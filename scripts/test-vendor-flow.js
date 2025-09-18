// Test script to check if vendor is logged in and can add products
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pupkimkzrcddamkiufet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cGtpbWt6cmNkZGFta2l1ZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDE2NTksImV4cCI6MjA3MTc3NzY1OX0.lT72IF29buK9Ag8L8STUhcI_zSoGMEt_4GzkZqm-2fE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testVendorFlow() {
  console.log('🧪 Testing vendor product submission flow...\n');
  
  // Check current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('❌ Session error:', sessionError);
    return;
  }
  
  if (!session?.user) {
    console.log('❌ No active session - vendor must be logged in');
    console.log('📝 Steps to test:');
    console.log('1. Go to /vendor/login');
    console.log('2. Login as a vendor'); 
    console.log('3. Try adding a product');
    console.log('4. Check if it appears in admin dashboard');
    return;
  }
  
  console.log('✅ Active session found');
  console.log('👤 User ID:', session.user.id);
  console.log('📧 Email:', session.user.email);
  
  // Check if user has vendor profile
  const { data: vendorData, error: vendorError } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (vendorError) {
    console.log('❌ No vendor profile found for this user');
    console.log('💡 User needs to create vendor profile first');
    return;
  }
  
  console.log('✅ Vendor profile found');
  console.log('🏪 Business:', vendorData.business_name);
  console.log('✅ Approved:', vendorData.is_approved);
  console.log('🆔 Vendor ID:', vendorData.id);
  
  // Check vendor's products
  const { data: products, error: productsError } = await supabase
    .from('vendor_products')
    .select('*')
    .eq('vendor_id', vendorData.id);
  
  if (productsError) {
    console.error('❌ Error loading vendor products:', productsError);
    return;
  }
  
  console.log('📦 Vendor products:', products?.length || 0);
  products?.forEach((product, index) => {
    console.log(`  ${index + 1}. "${product.name}" - Status: ${product.status}`);
  });
  
  console.log('\n🎯 Summary:');
  if (products && products.length > 0) {
    console.log('✅ Vendor has products in database');
    console.log('🔄 Admin dashboard should refresh to show these products');
  } else {
    console.log('❌ No products found for this vendor');
    console.log('📝 Try adding a product as this vendor');
  }
}

testVendorFlow().catch(console.error);