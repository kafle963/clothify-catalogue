// Script to identify and count vendors and customers in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pupkimkzrcddamkiufet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cGtpbWt6cmNkZGFta2l1ZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDE2NTksImV4cCI6MjA3MTc3NzY1OX0.lT72IF29buK9Ag8L8STUhcI_zSoGMEt_4GzkZqm-2fE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeUserAccounts() {
  console.log('🔍 Analyzing User Accounts in Supabase Database\n');
  console.log('=' .repeat(60));

  try {
    // 1. Check Auth Users (Supabase Auth table)
    console.log('\n📊 AUTHENTICATION USERS ANALYSIS');
    console.log('-'.repeat(40));
    
    try {
      // Note: auth.users is not directly accessible via client, but we can check profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.log('❌ Error accessing profiles table:', profilesError.message);
      } else {
        console.log(`📋 Total User Profiles: ${profiles?.length || 0}`);
        
        if (profiles && profiles.length > 0) {
          const customers = profiles.filter(p => p.account_type === 'customer');
          const vendors = profiles.filter(p => p.account_type === 'vendor');
          
          console.log(`👥 Customers: ${customers.length}`);
          console.log(`🏪 Vendors: ${vendors.length}`);
          
          console.log('\n📝 Profile Details:');
          profiles.forEach((profile, index) => {
            console.log(`  ${index + 1}. ${profile.name} (${profile.email}) - Type: ${profile.account_type}`);
          });
        }
      }
    } catch (error) {
      console.log('❌ Profiles table access error:', error);
    }

    // 2. Check Vendors Table
    console.log('\n🏪 VENDOR ACCOUNTS ANALYSIS');
    console.log('-'.repeat(40));
    
    try {
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('*');
      
      if (vendorsError) {
        console.log('❌ Error accessing vendors table:', vendorsError.message);
      } else {
        console.log(`📊 Total Vendor Records: ${vendors?.length || 0}`);
        
        if (vendors && vendors.length > 0) {
          const approvedVendors = vendors.filter(v => v.is_approved);
          const pendingVendors = vendors.filter(v => !v.is_approved);
          
          console.log(`✅ Approved Vendors: ${approvedVendors.length}`);
          console.log(`⏳ Pending Vendors: ${pendingVendors.length}`);
          
          console.log('\n📝 Vendor Details:');
          vendors.forEach((vendor, index) => {
            console.log(`  ${index + 1}. ${vendor.business_name}`);
            console.log(`     📧 Email: ${vendor.email}`);
            console.log(`     👤 Contact: ${vendor.name}`);
            console.log(`     ✅ Approved: ${vendor.is_approved ? 'Yes' : 'No'}`);
            console.log(`     📅 Joined: ${new Date(vendor.created_at).toLocaleDateString()}`);
            if (vendor.user_id) {
              console.log(`     🔗 Auth User ID: ${vendor.user_id}`);
            }
            console.log('');
          });
        }
      }
    } catch (error) {
      console.log('❌ Vendors table access error:', error);
    }

    // 3. Cross-reference Analysis
    console.log('\n🔗 CROSS-REFERENCE ANALYSIS');
    console.log('-'.repeat(40));
    
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: vendors } = await supabase.from('vendors').select('*');
      
      if (profiles && vendors) {
        console.log('\n📊 Account Type Distribution:');
        
        // Profiles breakdown
        const profileCustomers = profiles.filter(p => p.account_type === 'customer');
        const profileVendors = profiles.filter(p => p.account_type === 'vendor');
        
        console.log(`📋 Profiles Table:`);
        console.log(`   👥 Customer Profiles: ${profileCustomers.length}`);
        console.log(`   🏪 Vendor Profiles: ${profileVendors.length}`);
        
        console.log(`📋 Vendors Table:`);
        console.log(`   🏪 Vendor Records: ${vendors.length}`);
        
        // Check for orphaned records
        const vendorEmails = vendors.map(v => v.email);
        const profileVendorEmails = profileVendors.map(p => p.email);
        
        const orphanedVendors = vendors.filter(v => !profileVendorEmails.includes(v.email));
        const orphanedProfiles = profileVendors.filter(p => !vendorEmails.includes(p.email));
        
        if (orphanedVendors.length > 0) {
          console.log(`⚠️  Vendors without profiles: ${orphanedVendors.length}`);
          orphanedVendors.forEach(v => console.log(`     - ${v.email}`));
        }
        
        if (orphanedProfiles.length > 0) {
          console.log(`⚠️  Vendor profiles without vendor records: ${orphanedProfiles.length}`);
          orphanedProfiles.forEach(p => console.log(`     - ${p.email}`));
        }
        
        if (orphanedVendors.length === 0 && orphanedProfiles.length === 0) {
          console.log(`✅ All vendor accounts are properly linked`);
        }
      }
    } catch (error) {
      console.log('❌ Cross-reference analysis error:', error);
    }

    // 4. Summary Statistics
    console.log('\n📈 SUMMARY STATISTICS');
    console.log('-'.repeat(40));
    
    try {
      const { data: profiles } = await supabase.from('profiles').select('account_type');
      const { data: vendors } = await supabase.from('vendors').select('is_approved');
      const { data: products } = await supabase.from('vendor_products').select('vendor_id, status');
      
      console.log('\n🎯 Final Count Summary:');
      console.log(`👥 Total Customer Accounts: ${profiles?.filter(p => p.account_type === 'customer').length || 0}`);
      console.log(`🏪 Total Vendor Accounts: ${profiles?.filter(p => p.account_type === 'vendor').length || 0}`);
      console.log(`📊 Total User Accounts: ${profiles?.length || 0}`);
      
      if (vendors) {
        console.log(`✅ Approved Vendors: ${vendors.filter(v => v.is_approved).length}`);
        console.log(`⏳ Pending Vendors: ${vendors.filter(v => !v.is_approved).length}`);
      }
      
      if (products) {
        console.log(`📦 Total Products: ${products.length}`);
        console.log(`✅ Approved Products: ${products.filter(p => p.status === 'approved').length}`);
        console.log(`⏳ Pending Products: ${products.filter(p => p.status === 'pending').length}`);
        
        // Products per vendor
        const vendorProductCounts = {};
        products.forEach(p => {
          vendorProductCounts[p.vendor_id] = (vendorProductCounts[p.vendor_id] || 0) + 1;
        });
        
        if (Object.keys(vendorProductCounts).length > 0) {
          console.log('\n📦 Products per Vendor:');
          Object.entries(vendorProductCounts).forEach(([vendorId, count]) => {
            console.log(`   Vendor ${vendorId}: ${count} products`);
          });
        }
      }
      
    } catch (error) {
      console.log('❌ Summary statistics error:', error);
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Analysis Complete');
}

// Run the analysis
analyzeUserAccounts().catch(console.error);