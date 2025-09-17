import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Order, CartItem } from '@/types';

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    // Check if we're using demo users or if Supabase is properly configured
    // Enhanced demo user detection: check email OR if it's a generated UUID demo user
    const isDemoUser = user.email === 'demo@clothify.com' || 
                       user.id.startsWith('demo-user-') ||
                       user.name === 'Demo User';
    
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                 import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                                 import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co';

    // Use demo mode if using demo users OR if Supabase is not configured
    if (isDemoUser || !isSupabaseConfigured) {
      console.warn('Using demo mode for orders');
      // Create demo orders for better UX in demo mode
      const demoOrders: Order[] = [
        {
          id: 'demo-order-1',
          items: [
            {
              product: {
                id: 1,
                name: "Elegant Summer Dress",
                price: 89,
                image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=600&fit=crop&crop=center",
                category: "Women",
                description: "",
                sizes: ["M"],
                inStock: true,
              },
              quantity: 1,
              size: "M",
            }
          ],
          total: 96.12,
          status: 'Delivered',
          orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryAddress: {
            street: "123 Demo Street",
            city: "Demo City",
            state: "DC",
            zipCode: "12345",
            country: "United States",
          },
        },
        {
          id: 'demo-order-2',
          items: [
            {
              product: {
                id: 2,
                name: "Classic Cotton Shirt",
                price: 65,
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop&crop=center",
                category: "Men",
                description: "",
                sizes: ["L"],
                inStock: true,
              },
              quantity: 2,
              size: "L",
            }
          ],
          total: 140.40,
          status: 'Shipped',
          orderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryAddress: {
            street: "456 Demo Avenue",
            city: "Demo City",
            state: "DC",
            zipCode: "12345",
            country: "United States",
          },
        }
      ];
      setOrders(demoOrders);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch orders with their items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setOrders([]);
        return;
      }

      // Transform the data to match our Order type
      const transformedOrders: Order[] = ordersData.map((order: any) => ({
        id: order.id,
        items: order.order_items.map((item: any) => ({
          product: {
            id: item.product_id,
            name: item.product_name,
            price: parseFloat(item.product_price),
            image: item.product_image,
            category: item.product_category,
            description: '', // Not stored in order items
            sizes: [item.size], // Only the selected size
            inStock: true, // Assume in stock for historical orders
          },
          quantity: item.quantity,
          size: item.size,
        })),
        total: parseFloat(order.total),
        status: order.status === 'placed' ? 'Placed' : 
               order.status === 'processing' ? 'Processing' :
               order.status === 'shipped' ? 'Shipped' : 'Delivered',
        orderDate: order.created_at,
        deliveryAddress: {
          street: order.delivery_street,
          city: order.delivery_city,
          state: order.delivery_state,
          zipCode: order.delivery_zip_code,
          country: order.delivery_country,
        },
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (
    items: CartItem[],
    total: number,
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }
  ): Promise<string | null> => {
    if (!user) return null;

    console.log('Creating order with user:', {
      user_id: user.id,
      user_email: user.email,
      total,
      deliveryAddress,
      items: items.length
    });

    // Check if we're using demo users or if Supabase is properly configured
    // Enhanced demo user detection: check email OR if it's a generated UUID demo user
    const isDemoUser = user.email === 'demo@clothify.com' || 
                       user.id.startsWith('demo-user-') ||
                       user.name === 'Demo User';
    
    const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                                 import.meta.env.VITE_SUPABASE_ANON_KEY &&
                                 import.meta.env.VITE_SUPABASE_URL !== 'your_supabase_project_url' &&
                                 import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co';

    console.log('🔍 Order creation mode check:', {
      isDemoUser,
      isSupabaseConfigured,
      userEmail: user.email,
      userId: user.id,
      userName: user.name,
      shouldUseDemo: isDemoUser || !isSupabaseConfigured,
      envUrl: import.meta.env.VITE_SUPABASE_URL,
      envKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    });

    // Always use demo mode for demo users, regardless of Supabase configuration
    if (isDemoUser) {
      console.warn('✅ Demo user detected - using demo mode for order creation');
      const demoOrderId = 'demo-order-' + Date.now();
      
      // Create a demo order for local state
      const demoOrder: Order = {
        id: demoOrderId,
        items: items,
        total: total,
        status: 'Placed',
        orderDate: new Date().toISOString(),
        deliveryAddress: deliveryAddress,
      };
      
      setOrders(prev => [demoOrder, ...prev]);
      console.log('✅ Demo order created successfully:', demoOrderId);
      return demoOrderId;
    }

    // If not a demo user but Supabase is not configured, also use demo mode
    if (!isSupabaseConfigured) {
      console.warn('✅ Supabase not configured - using demo mode for order creation');
      const demoOrderId = 'demo-order-' + Date.now();
      
      // Create a demo order for local state
      const demoOrder: Order = {
        id: demoOrderId,
        items: items,
        total: total,
        status: 'Placed',
        orderDate: new Date().toISOString(),
        deliveryAddress: deliveryAddress,
      };
      
      setOrders(prev => [demoOrder, ...prev]);
      console.log('✅ Demo order created successfully:', demoOrderId);
      return demoOrderId;
    }

    console.log('⚠️ Using Supabase mode - this may cause RLS errors with demo users');

    try {
      console.log('Starting order creation process...');
      
      // Create the order
      const orderData = {
        user_id: user.id,
        total: total,
        status: 'placed',
        delivery_street: deliveryAddress.street,
        delivery_city: deliveryAddress.city,
        delivery_state: deliveryAddress.state,
        delivery_zip_code: deliveryAddress.zipCode,
        delivery_country: deliveryAddress.country,
      };
      
      console.log('Inserting order data:', orderData);
      
      const { data: createdOrder, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        console.error('Order error details:', orderError.message, orderError.details, orderError.hint);
        return null;
      }
      
      if (!createdOrder) {
        console.error('No order data returned from insert');
        return null;
      }
      
      console.log('Order created successfully:', createdOrder);

      // Create order items
      const orderItems = items.map(item => ({
        order_id: createdOrder.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        product_image: item.product.image,
        product_category: item.product.category,
        size: item.size,
        quantity: item.quantity,
      }));
      
      console.log('Inserting order items:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        console.error('Items error details:', itemsError.message, itemsError.details, itemsError.hint);
        return null;
      }
      
      console.log('Order items created successfully');

      // Refresh orders list
      await fetchOrders();

      return createdOrder.id;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return null;
    }
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  return {
    orders,
    loading,
    createOrder,
    getOrderById,
    refetch: fetchOrders,
  };
};