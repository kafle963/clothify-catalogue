// Script to add admin policies for vendor products
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pupkimkzrcddamkiufet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cGtpbWt6cmNkZGFta2l1ZmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDE2NTksImV4cCI6MjA3MTc3NzY1OX0.lT72IF29buK9Ag8L8STUhcI_zSoGMEt_4GzkZqm-2fE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addAdminPolicies() {
  console.log('🔧 Adding admin policies for vendor products...\n');
  
  try {
    // Add admin read policy for vendor_products
    const adminReadPolicy = `
      CREATE POLICY "Admins can read all vendor products"
        ON vendor_products
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
          )
        );
    `;
    
    const { error: readError } = await supabase.rpc('exec_sql', { sql: adminReadPolicy });
    
    if (readError && !readError.message.includes('already exists')) {
      console.error('❌ Error adding read policy:', readError);
      return;
    }
    
    console.log('✅ Admin read policy added');
    
    // Add admin update policy for vendor_products
    const adminUpdatePolicy = `
      CREATE POLICY "Admins can update vendor products"
        ON vendor_products
        FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
          )
        );
    `;
    
    const { error: updateError } = await supabase.rpc('exec_sql', { sql: adminUpdatePolicy });
    
    if (updateError && !updateError.message.includes('already exists')) {
      console.error('❌ Error adding update policy:', updateError);
      return;
    }
    
    console.log('✅ Admin update policy added');
    
    // Add admin read policy for vendors
    const vendorReadPolicy = `
      CREATE POLICY "Admins can read all vendors"
        ON vendors
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
          )
        );
    `;
    
    const { error: vendorReadError } = await supabase.rpc('exec_sql', { sql: vendorReadPolicy });
    
    if (vendorReadError && !vendorReadError.message.includes('already exists')) {
      console.error('❌ Error adding vendor read policy:', vendorReadError);
      return;
    }
    
    console.log('✅ Vendor read policy added');
    
    console.log('\n🎉 All admin policies applied successfully!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

addAdminPolicies();