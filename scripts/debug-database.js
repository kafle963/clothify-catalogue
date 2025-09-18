// Debug script to check Supabase data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pupkimkzrcddamkiufet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cGtpbWt6cmNkZGFta2l1ZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDE2NTksImV4cCI6MjA3MTc3NzY1OX0.lT72IF29buK9Ag8L8STUhcI_zSoGMEt_4GzkZqm-2fE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase database...\n');
  
  // Check vendors
  try {
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendors')
      .select('*');
    
    if (vendorsError) {
      console.error('❌ Error loading vendors:', vendorsError);
    } else {
      console.log('📋 Vendors in database:', vendors?.length || 0);
      vendors?.forEach((vendor, index) => {
        console.log(`  ${index + 1}. ${vendor.business_name} (${vendor.email}) - Approved: ${vendor.is_approved}`);
      });
    }
  } catch (error) {
    console.error('❌ Vendors table error:', error);
  }
  
  console.log('');
  
  // Check products
  try {
    const { data: products, error: productsError } = await supabase
      .from('vendor_products')
      .select('*');
    
    if (productsError) {
      console.error('❌ Error loading products:', productsError);
    } else {
      console.log('📦 Products in database:', products?.length || 0);
      products?.forEach((product, index) => {
        console.log(`  ${index + 1}. "${product.name}" by vendor ${product.vendor_id} - Status: ${product.status}`);
      });
    }
  } catch (error) {
    console.error('❌ Products table error:', error);
  }
  
  console.log('');
  
  // Check users/profiles
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('❌ Error loading profiles:', profilesError);
    } else {
      console.log('👥 User profiles in database:', profiles?.length || 0);
      profiles?.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.name} (${profile.email}) - Type: ${profile.account_type}`);
      });
    }
  } catch (error) {
    console.error('❌ Profiles table error:', error);
  }
}

checkDatabase().catch(console.error);