// Script to apply admin policies to vendor_products table
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://pupkimkzrcddamkiufet.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cGtpbWt6cmNkZGFta2l1ZmV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIwMTY1OSwiZXhwIjoyMDcxNzc3NjU5fQ.QZ7x72HslY0KnfZDxK4lPGePpw7xKyQsGpX8hMjgUZ8'; // Replace with your service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyAdminPolicies() {
  console.log('🔧 Applying admin policies to vendor_products and vendors tables...\n');
  
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250918000001_add_admin_product_policies.sql', 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Error applying policies:', error);
      return;
    }
    
    console.log('✅ Admin policies applied successfully!');
    
    // Test admin access to products
    console.log('\n🧪 Testing admin access...');
    const { data: products, error: productsError } = await supabase
      .from('vendor_products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      console.error('❌ Error testing product access:', productsError);
    } else {
      console.log(`✅ Can access ${products?.length || 0} products`);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

applyAdminPolicies();