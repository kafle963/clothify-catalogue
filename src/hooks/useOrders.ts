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

    try {
      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: total,
          status: 'placed',
          delivery_street: deliveryAddress.street,
          delivery_city: deliveryAddress.city,
          delivery_state: deliveryAddress.state,
          delivery_zip_code: deliveryAddress.zipCode,
          delivery_country: deliveryAddress.country,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
      }

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        product_image: item.product.image,
        product_category: item.product.category,
        size: item.size,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        return null;
      }

      // Refresh orders list
      await fetchOrders();

      return orderData.id;
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