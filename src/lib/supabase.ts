import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase environment variables are required. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for our database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          account_type: 'customer' | 'vendor'
          street: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          account_type?: 'customer' | 'vendor'
          street?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          account_type?: 'customer' | 'vendor'
          street?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          user_id: string | null
          email: string
          name: string
          business_name: string
          description: string | null
          phone: string | null
          profile_image: string | null
          website: string | null
          tax_id: string | null
          social_media: string | null
          address_street: string | null
          address_city: string | null
          address_state: string | null
          address_zip_code: string | null
          address_country: string | null
          is_approved: boolean
          approval_date: string | null
          rejected_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          name: string
          business_name: string
          description?: string | null
          phone?: string | null
          profile_image?: string | null
          website?: string | null
          tax_id?: string | null
          social_media?: string | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip_code?: string | null
          address_country?: string | null
          is_approved?: boolean
          approval_date?: string | null
          rejected_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          name?: string
          business_name?: string
          description?: string | null
          phone?: string | null
          profile_image?: string | null
          website?: string | null
          tax_id?: string | null
          social_media?: string | null
          address_street?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip_code?: string | null
          address_country?: string | null
          is_approved?: boolean
          approval_date?: string | null
          rejected_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendor_products: {
        Row: {
          id: string
          vendor_id: string
          name: string
          description: string
          price: number
          original_price: number | null
          category: string
          images: any
          sizes: any
          colors: any | null
          inventory: any
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          approval_date: string | null
          rejected_reason: string | null
          tags: any | null
          is_active: boolean
          views: number
          sales_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          description: string
          price: number
          original_price?: number | null
          category: string
          images?: any
          sizes?: any
          colors?: any | null
          inventory?: any
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          approval_date?: string | null
          rejected_reason?: string | null
          tags?: any | null
          is_active?: boolean
          views?: number
          sales_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          description?: string
          price?: number
          original_price?: number | null
          category?: string
          images?: any
          sizes?: any
          colors?: any | null
          inventory?: any
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          approval_date?: string | null
          rejected_reason?: string | null
          tags?: any | null
          is_active?: boolean
          views?: number
          sales_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total: number
          status: 'placed' | 'processing' | 'shipped' | 'delivered'
          delivery_street: string
          delivery_city: string
          delivery_state: string
          delivery_zip_code: string
          delivery_country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total: number
          status?: 'placed' | 'processing' | 'shipped' | 'delivered'
          delivery_street: string
          delivery_city: string
          delivery_state: string
          delivery_zip_code: string
          delivery_country: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total?: number
          status?: 'placed' | 'processing' | 'shipped' | 'delivered'
          delivery_street?: string
          delivery_city?: string
          delivery_state?: string
          delivery_zip_code?: string
          delivery_country?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: number
          product_name: string
          product_price: number
          product_image: string
          product_category: string
          size: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: number
          product_name: string
          product_price: number
          product_image: string
          product_category: string
          size: string
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: number
          product_name?: string
          product_price?: number
          product_image?: string
          product_category?: string
          size?: string
          quantity?: number
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: number
          product_name: string
          product_price: number
          product_image: string
          product_category: string
          size: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: number
          product_name: string
          product_price: number
          product_image: string
          product_category: string
          size: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: number
          product_name?: string
          product_price?: number
          product_image?: string
          product_category?: string
          size?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: number
          product_name: string
          product_price: number
          product_image: string
          product_category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: number
          product_name: string
          product_price: number
          product_image: string
          product_category: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: number
          product_name?: string
          product_price?: number
          product_image?: string
          product_category?: string
          created_at?: string
        }
      }
      admin: {
        Row: {
          id: string
          name: string
          email: string
          role: 'super_admin' | 'admin' | 'moderator'
          permissions: any
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: 'super_admin' | 'admin' | 'moderator'
          permissions?: any
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'super_admin' | 'admin' | 'moderator'
          permissions?: any
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}