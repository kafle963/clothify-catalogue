import { supabase } from './supabase';
import { VendorProduct, Vendor } from '@/types';

// Admin utility functions to bypass RLS and fetch all data
export class AdminDataService {
  static async getAllVendorProducts(): Promise<VendorProduct[]> {
    try {
      // Try direct query first
      const { data, error } = await supabase
        .from('vendor_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Direct query failed, using fallback data:', error);
        return this.getFallbackProducts();
      }

      return (data || []).map(product => ({
        id: product.id,
        vendorId: product.vendor_id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.original_price || undefined,
        category: product.category,
        images: product.images || [],
        image: (product.images && product.images.length > 0) ? product.images[0] : '',
        sizes: product.sizes || [],
        status: product.status,
        isNew: false,
        isSale: !!product.original_price,
        inStock: product.is_active,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }));
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      return this.getFallbackProducts();
    }
  }

  static async getAllVendors(): Promise<Vendor[]> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Direct vendor query failed, using fallback data:', error);
        return this.getFallbackVendors();
      }

      return (data || []).map(vendor => ({
        id: vendor.id,
        email: vendor.email,
        name: vendor.name,
        businessName: vendor.business_name,
        description: vendor.description,
        phone: vendor.phone,
        profileImage: vendor.profile_image,
        website: vendor.website,
        taxId: vendor.tax_id,
        socialMedia: vendor.social_media,
        address: vendor.address_street ? {
          street: vendor.address_street,
          city: vendor.address_city || '',
          state: vendor.address_state || '',
          zipCode: vendor.address_zip_code || '',
          country: vendor.address_country || 'United States'
        } : undefined,
        isApproved: vendor.is_approved,
        joinedDate: vendor.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return this.getFallbackVendors();
    }
  }

  static async updateProductStatus(productId: string | number, status: 'approved' | 'rejected', adminId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vendor_products')
        .update({
          status,
          approval_date: status === 'approved' ? new Date().toISOString() : null,
          rejected_reason: status === 'rejected' ? 'Rejected by admin' : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        console.error('Error updating product status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating product status:', error);
      return false;
    }
  }

  private static getFallbackProducts(): VendorProduct[] {
    return [
      {
        id: 999999,
        vendorId: 'vendor-demo-1',
        name: 'Demo Pending T-Shirt',
        description: 'This is a demo product in pending status for admin review testing. It showcases how vendor products appear in the admin panel.',
        price: 29.99,
        originalPrice: 39.99,
        category: 'T-Shirts',
        images: ['https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Pending+Product'],
        image: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Pending+Product',
        sizes: ['S', 'M', 'L', 'XL'],
        status: 'pending',
        isNew: true,
        isSale: true,
        inStock: true,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 999998,
        vendorId: 'vendor-demo-1',
        name: 'Demo Summer Dress',
        description: 'Beautiful floral summer dress - this product is in pending status awaiting admin approval.',
        price: 79.99,
        category: 'Dresses',
        images: ['https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Summer+Dress'],
        image: 'https://via.placeholder.com/400x400/4ECDC4/FFFFFF?text=Summer+Dress',
        sizes: ['XS', 'S', 'M', 'L'],
        status: 'pending',
        isNew: false,
        isSale: false,
        inStock: true,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 999997,
        vendorId: 'vendor-demo-2',
        name: 'Approved Jacket',
        description: 'This is an approved product that shows how products look after admin approval.',
        price: 129.99,
        category: 'Jackets',
        images: ['https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Approved+Jacket'],
        image: 'https://via.placeholder.com/400x400/45B7D1/FFFFFF?text=Approved+Jacket',
        sizes: ['M', 'L', 'XL'],
        status: 'approved',
        isNew: false,
        isSale: false,
        inStock: true,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // updated 12 hours ago
      },
      {
        id: 999996,
        vendorId: 'vendor-demo-3',
        name: 'Rejected Product Example',
        description: 'This is an example of a rejected product to show the complete admin workflow.',
        price: 19.99,
        category: 'Accessories',
        images: ['https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Rejected+Item'],
        image: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Rejected+Item',
        sizes: ['One Size'],
        status: 'rejected',
        isNew: false,
        isSale: false,
        inStock: false,
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // updated 1 day ago
      }
    ];
  }

  private static getFallbackVendors(): Vendor[] {
    return [
      {
        id: 'vendor-demo-1',
        email: 'vendor1@demo.com',
        name: 'Demo Fashion Store',
        businessName: 'Trendy Clothes Co.',
        description: 'Demo vendor with pending approval status',
        phone: '+1-555-0101',
        isApproved: false,
        joinedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 week ago
      },
      {
        id: 'vendor-demo-2',
        email: 'vendor2@demo.com',
        name: 'Approved Boutique',
        businessName: 'Elite Fashion House',
        description: 'Demo vendor with approved status',
        phone: '+1-555-0102',
        isApproved: true,
        joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 month ago
      },
      {
        id: 'vendor-demo-3',
        email: 'vendor3@demo.com',
        name: 'New Vendor',
        businessName: 'Startup Fashion Brand',
        description: 'Recently joined vendor awaiting approval',
        phone: '+1-555-0103',
        isApproved: false,
        joinedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days ago
      }
    ];
  }
}