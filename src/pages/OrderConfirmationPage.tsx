import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import Navigation from '@/components/Navigation';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById, loading } = useOrders();
  
  const order = orderId ? getOrderById(orderId) : null;

  useEffect(() => {
    // Order will be loaded by useOrders hook
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order not found</h1>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
          </div>

          {/* Order Details */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h2>
                <p className="text-muted-foreground">
                  Placed on {new Date(order.orderDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {order.status}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items Ordered ({order.items.reduce((sum, item) => sum + item.quantity, 0)} items)
              </h3>
              {order.items.map((item, index) => (
                <div key={`${item.product.id}-${item.size}-${index}`} className="flex gap-3 p-3 rounded-lg bg-white/70">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => navigate(`/product/${item.product.id}`)}
                  />
                  <div className="flex-1">
                    <h4 
                      className="font-medium cursor-pointer hover:text-accent transition-smooth"
                      onClick={() => navigate(`/product/${item.product.id}`)}
                    >
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Size: <span className="font-medium">{item.size}</span> • Quantity: <span className="font-medium">{item.quantity}</span>
                    </p>
                    <p className="font-medium text-accent">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Order Total */}
            <div className="bg-white/70 p-4 rounded-lg">
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${(order.total / 1.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%)</span>
                  <span>${((order.total / 1.08) * 0.08).toFixed(2)}</span>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-accent">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Delivery Address */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Home className="h-5 w-5" />
              Delivery Address
            </h3>
            <div className="text-muted-foreground bg-muted/30 p-4 rounded-lg">
              <p className="font-medium text-foreground">{order.deliveryAddress.street}</p>
              <p>
                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
              </p>
              <p>{order.deliveryAddress.country}</p>
            </div>
          </Card>

          {/* Order Timeline */}
          <Card className="p-6 mb-8">
            <h3 className="font-semibold mb-4">Order Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.orderDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Processing</p>
                  <p className="text-sm text-muted-foreground">
                    We'll notify you when your order is ready
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Shipped</p>
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery in 3-5 business days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-muted-foreground">Delivered</p>
                  <p className="text-sm text-muted-foreground">
                    Your order will be delivered to your address
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              View Order History
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/products')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;