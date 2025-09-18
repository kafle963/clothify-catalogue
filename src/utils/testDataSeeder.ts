// Test data seeder for demonstrating interconnected data relationships
// This will populate the system with sample data to show how everything connects

import { User, Vendor, VendorProduct } from '@/types';

export const seedTestData = () => {
  // Clear existing data
  localStorage.removeItem('app_users');
  localStorage.removeItem('app_vendors');
  localStorage.removeItem('app_products');
  localStorage.removeItem('app_orders');

  // Sample Users
  const users: User[] = [
    {
      id: 'user_1',
      email: 'alice.customer@clothify.com',
      name: 'Alice Johnson',
      account_type: 'customer',
      address: {
        street: '123 Fashion Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      }
    },
    {
      id: 'user_2', 
      email: 'bob.shopper@clothify.com',
      name: 'Bob Smith',
      account_type: 'customer'
    },
    {
      id: 'vendor_1',
      email: 'sarah@fashionhub.com',
      name: 'Sarah Wilson',
      account_type: 'vendor'
    },
    {
      id: 'vendor_2',
      email: 'mike@trendsetter.com', 
      name: 'Mike Davis',
      account_type: 'vendor'
    }
  ];

  // Sample Vendors
  const vendors: Vendor[] = [
    {
      id: 'vendor_1',
      email: 'sarah@fashionhub.com',
      name: 'Sarah Wilson',
      businessName: 'Fashion Hub',
      description: 'Premium clothing and accessories for modern lifestyle.',
      phone: '+1 (555) 123-4567',
      address: {
        street: '456 Business Blvd',
        city: 'Los Angeles', 
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      isApproved: true,
      joinedDate: '2024-01-15'
    },
    {
      id: 'vendor_2',
      email: 'mike@trendsetter.com',
      name: 'Mike Davis',
      businessName: 'TrendSetter Boutique',
      description: 'Contemporary fashion for the modern professional.',
      phone: '+1 (555) 987-6543',
      isApproved: false, // Pending approval
      joinedDate: '2024-01-20'
    }
  ];

  // Sample Products (linked to vendors)
  const products: VendorProduct[] = [
    {
      id: 1,
      vendorId: 'vendor_1', // Links to Fashion Hub (approved vendor)
      name: 'Premium Cotton T-Shirt',
      description: 'High-quality organic cotton t-shirt with perfect fit and comfort.',
      price: 29.99,
      originalPrice: 39.99,
      category: 'Men',
      sizes: ['S', 'M', 'L', 'XL'],
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'],
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
      status: 'approved',
      isNew: false,
      isSale: true,
      inStock: true,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      createdAt: '2024-01-16T10:00:00.000Z',
      updatedAt: '2024-01-17T09:30:00.000Z'
    },
    {
      id: 2,
      vendorId: 'vendor_1', // Links to Fashion Hub
      name: 'Elegant Summer Dress',
      description: 'Flowing summer dress perfect for any occasion.',
      price: 89.99,
      category: 'Women',
      sizes: ['XS', 'S', 'M', 'L'],
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300'],
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300',
      status: 'pending', // Awaiting approval
      isNew: true,
      isSale: false,
      inStock: true,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      createdAt: '2024-01-22T14:30:00.000Z',
      updatedAt: '2024-01-22T14:30:00.000Z'
    },
    {
      id: 3,
      vendorId: 'vendor_2', // Links to TrendSetter (pending vendor)
      name: 'Urban Streetwear Hoodie',
      description: 'Comfortable hoodie with modern street style.',
      price: 59.99,
      category: 'Unisex',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300'],
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300',
      status: 'pending', // Will be pending until vendor is approved
      isNew: true,
      isSale: false,
      inStock: true,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      createdAt: '2024-01-21T16:45:00.000Z',
      updatedAt: '2024-01-21T16:45:00.000Z'
    }
  ];

  // Save to localStorage
  localStorage.setItem('app_users', JSON.stringify(users));
  localStorage.setItem('app_vendors', JSON.stringify(vendors));
  localStorage.setItem('app_products', JSON.stringify(products));
  localStorage.setItem('app_orders', JSON.stringify([])); // Empty orders to start

  console.log('✅ Test data seeded successfully!');
  console.log('📊 Data Overview:');
  console.log(`- ${users.length} users (${users.filter(u => u.account_type === 'customer').length} customers, ${users.filter(u => u.account_type === 'vendor').length} vendors)`);
  console.log(`- ${vendors.length} vendor businesses (${vendors.filter(v => v.isApproved).length} approved, ${vendors.filter(v => !v.isApproved).length} pending)`);
  console.log(`- ${products.length} products (${products.filter(p => p.status === 'approved').length} approved, ${products.filter(p => p.status === 'pending').length} pending)`);
  
  return {
    users,
    vendors, 
    products,
    orders: []
  };
};

export const clearTestData = () => {
  localStorage.removeItem('app_users');
  localStorage.removeItem('app_vendors');
  localStorage.removeItem('app_products');
  localStorage.removeItem('app_orders');
  console.log('🗑️ Test data cleared');
};

// Data relationship demonstrations
export const getDataRelationships = () => {
  const users = JSON.parse(localStorage.getItem('app_users') || '[]');
  const vendors = JSON.parse(localStorage.getItem('app_vendors') || '[]'); 
  const products = JSON.parse(localStorage.getItem('app_products') || '[]');
  
  return {
    // Show which users are also vendors
    vendorUsers: users.filter((user: User) => 
      vendors.some((vendor: Vendor) => vendor.email === user.email)
    ),
    
    // Show products by vendor status
    approvedVendorProducts: products.filter((product: VendorProduct) => {
      const vendor = vendors.find((v: Vendor) => v.id === product.vendorId);
      return vendor?.isApproved;
    }),
    
    pendingVendorProducts: products.filter((product: VendorProduct) => {
      const vendor = vendors.find((v: Vendor) => v.id === product.vendorId);
      return !vendor?.isApproved;
    }),
    
    // Analytics by status
    analytics: {
      totalUsers: users.length,
      customerCount: users.filter((u: User) => u.account_type === 'customer').length,
      vendorCount: vendors.length,
      approvedVendors: vendors.filter((v: Vendor) => v.isApproved).length,
      pendingVendors: vendors.filter((v: Vendor) => !v.isApproved).length,
      totalProducts: products.length,
      approvedProducts: products.filter((p: VendorProduct) => p.status === 'approved').length,
      pendingProducts: products.filter((p: VendorProduct) => p.status === 'pending').length
    }
  };
};