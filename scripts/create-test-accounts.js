// Script to create test users and vendors for demonstration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pupkimkzrcddamkiufet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cGtpbWt6cmNkZGFta2l1ZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDE2NTksImV4cCI6MjA3MTc3NzY1OX0.lT72IF29buK9Ag8L8STUhcI_zSoGMEt_4GzkZqm-2fE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestAccounts() {
  console.log('🧪 Creating Test Accounts for Demonstration\n');
  
  try {
    // Create test customer profiles
    const testCustomers = [
      { id: 'cust-1', email: 'customer1@test.com', name: 'John Smith', account_type: 'customer' },
      { id: 'cust-2', email: 'customer2@test.com', name: 'Sarah Johnson', account_type: 'customer' },
      { id: 'cust-3', email: 'customer3@test.com', name: 'Mike Davis', account_type: 'customer' }
    ];
    
    // Create test vendor profiles
    const testVendorProfiles = [
      { id: 'vend-1', email: 'vendor1@test.com', name: 'Fashion Store Owner', account_type: 'vendor' },
      { id: 'vend-2', email: 'vendor2@test.com', name: 'Boutique Manager', account_type: 'vendor' }
    ];
    
    // Create test vendor business records
    const testVendors = [
      {
        id: 'vendor-bus-1',
        user_id: 'vend-1',
        email: 'vendor1@test.com',
        name: 'Fashion Store Owner',
        business_name: 'Trendy Fashion Co.',
        description: 'Latest fashion trends and styles',
        is_approved: true
      },
      {
        id: 'vendor-bus-2', 
        user_id: 'vend-2',
        email: 'vendor2@test.com',
        name: 'Boutique Manager',
        business_name: 'Elite Boutique',
        description: 'Premium designer clothing',
        is_approved: false
      }
    ];
    
    console.log('📝 Inserting test customer profiles...');
    const { error: customerError } = await supabase
      .from('profiles')
      .insert(testCustomers);
    
    if (customerError) {
      console.log('⚠️ Customer profiles insert result:', customerError.message);
    } else {
      console.log('✅ Customer profiles created successfully');
    }
    
    console.log('📝 Inserting test vendor profiles...');
    const { error: vendorProfileError } = await supabase
      .from('profiles')
      .insert(testVendorProfiles);
    
    if (vendorProfileError) {
      console.log('⚠️ Vendor profiles insert result:', vendorProfileError.message);
    } else {
      console.log('✅ Vendor profiles created successfully');
    }
    
    console.log('📝 Inserting test vendor business records...');
    const { error: vendorBusinessError } = await supabase
      .from('vendors')
      .insert(testVendors);
    
    if (vendorBusinessError) {
      console.log('⚠️ Vendor business records insert result:', vendorBusinessError.message);
    } else {
      console.log('✅ Vendor business records created successfully');
    }
    
    // Create test products
    console.log('📝 Inserting test products...');
    const testProducts = [
      {
        id: 'prod-1',
        vendor_id: 'vendor-bus-1',
        name: 'Summer Dress',
        description: 'Beautiful floral summer dress',
        price: 89.99,
        category: 'Dresses',
        images: ['https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=Summer+Dress'],
        sizes: ['S', 'M', 'L'],
        status: 'pending'
      },
      {
        id: 'prod-2',
        vendor_id: 'vendor-bus-1',
        name: 'Casual T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 29.99,
        category: 'T-Shirts',
        images: ['https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=T-Shirt'],
        sizes: ['S', 'M', 'L', 'XL'],
        status: 'approved'
      },
      {
        id: 'prod-3',
        vendor_id: 'vendor-bus-2',
        name: 'Designer Jacket',
        description: 'Premium leather jacket',
        price: 299.99,
        category: 'Jackets',
        images: ['https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=Jacket'],
        sizes: ['M', 'L', 'XL'],
        status: 'pending'
      }
    ];
    
    const { error: productError } = await supabase
      .from('vendor_products')
      .insert(testProducts);
    
    if (productError) {
      console.log('⚠️ Products insert result:', productError.message);
    } else {
      console.log('✅ Test products created successfully');
    }
    
    console.log('\n📊 Test Account Summary:');
    console.log('👥 Customer Accounts: 3');
    console.log('🏪 Vendor Accounts: 2');
    console.log('✅ Approved Vendors: 1');
    console.log('⏳ Pending Vendors: 1');
    console.log('📦 Test Products: 3');
    console.log('✅ Approved Products: 1');
    console.log('⏳ Pending Products: 2');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Go to admin dashboard and click "Refresh Data"');
    console.log('2. Check /admin/debug for detailed account breakdown');
    console.log('3. View pending vendors and products in admin panels');
    
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
  }
}

async function clearTestData() {
  console.log('🧹 Clearing Test Data...\n');
  
  try {
    // Delete in reverse order due to foreign key constraints
    await supabase.from('vendor_products').delete().neq('id', 'xxx');
    await supabase.from('vendors').delete().neq('id', 'xxx');
    await supabase.from('profiles').delete().neq('id', 'xxx');
    
    console.log('✅ All test data cleared');
    
  } catch (error) {
    console.error('❌ Error clearing test data:', error);
  }
}

// Check command line arguments
const action = process.argv[2];

if (action === 'clear') {
  clearTestData().catch(console.error);
} else {
  createTestAccounts().catch(console.error);
}