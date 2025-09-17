import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Shirt } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import Navigation from '@/components/Navigation';

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orders, loading } = useOrders();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your orders</h1>
            <Button onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-slate-100 text-slate-700';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10">
              <Shirt className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Order History</h1>
              <p className="text-muted-foreground">Track your past purchases and orders</p>
            </div>
          </div>
          <div className="ml-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
            <p className="text-muted-foreground mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button onClick={() => navigate('/products')}>
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                You have {orders.length} order{orders.length !== 1 ? 's' : ''}
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/products')}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Continue Shopping
              </Button>
            </div>
            {orders.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Package className="h-5 w-5 text-accent" />
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
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
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="text-lg font-bold mt-1">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Order Items</h4>
                  {order.items.map((item, index) => (
                    <div key={`${item.product.id}-${item.size}-${index}`} className="flex gap-3 p-3 rounded-lg bg-muted/30">
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

                {/* Delivery Address */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p className="font-medium text-foreground">{order.deliveryAddress.street}</p>
                    <p>
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                    </p>
                    <p>{order.deliveryAddress.country}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Navigate to the first product in the order for reordering
                      if (order.items.length > 0) {
                        navigate(`/product/${order.items[0].product.id}`);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    <Shirt className="h-4 w-4" />
                    Reorder
                  </Button>
                  {order.status === 'Placed' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-slate-600 border-slate-600 hover:bg-slate-50"
                    >
                      Track Order
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;