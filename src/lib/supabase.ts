import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Using demo mode.')
  console.warn('To enable full functionality, please set up Supabase:')
  console.warn('1. Create a Supabase project at https://supabase.com')
  console.warn('2. Copy your project URL and anon key to the .env file')
  console.warn('3. Run the database migrations')
}

export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'demo-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Types for our database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
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
          street?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
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
    }
  }
}