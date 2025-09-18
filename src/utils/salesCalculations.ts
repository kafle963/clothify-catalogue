import { VendorProduct } from '@/types';

// Sales calculation utilities for vendor dashboard
export interface SalesData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export interface OrderData {
  id: string;
  vendorId: string;
  productId: number;
  quantity: number;
  price: number;
  orderDate: string;
  status: 'pending' | 'completed' | 'cancelled';
}

// Mock function for future implementation
export const calculateVendorSales = (
  products: VendorProduct[],
  orders: OrderData[] = []
): SalesData => {
  // When real order data is available, this function will calculate:
  // - Total revenue from all completed orders
  // - Monthly revenue (current month)
  // - Total number of orders
  // - Average order value
  // - Top-selling products
  
  if (orders.length === 0) {
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topProducts: []
    };
  }

  const completedOrders = orders.filter(order => order.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
  
  // Calculate monthly revenue (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyOrders = completedOrders.filter(order => {
    const orderDate = new Date(order.orderDate);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });
  const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);

  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Calculate top products
  const productSales = new Map<number, { name: string; sales: number; revenue: number }>();
  completedOrders.forEach(order => {
    const product = products.find(p => p.id === order.productId);
    if (product) {
      const existing = productSales.get(order.productId) || { name: product.name, sales: 0, revenue: 0 };
      existing.sales += order.quantity;
      existing.revenue += order.price * order.quantity;
      productSales.set(order.productId, existing);
    }
  });

  const topProducts = Array.from(productSales.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalRevenue,
    monthlyRevenue,
    totalOrders: completedOrders.length,
    averageOrderValue,
    topProducts
  };
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Helper function to get sales growth percentage
export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to get revenue insights
export const getRevenueInsights = (
  totalProducts: number,
  activeProducts: number,
  monthlyRevenue: number
): string => {
  if (totalProducts === 0) {
    return 'Add your first product to start selling';
  }
  
  if (activeProducts === 0) {
    return 'Get products approved to start earning';
  }
  
  if (monthlyRevenue === 0) {
    return 'Products are live - promote them to get sales';
  }
  
  return 'Great job! Keep adding products to grow your revenue';
};