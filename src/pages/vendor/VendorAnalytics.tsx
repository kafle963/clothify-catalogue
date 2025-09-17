import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package, 
  ShoppingCart, 
  Eye,
  Users,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import VendorNavigation from '@/components/VendorNavigation';

const VendorAnalytics = () => {
  const { vendor } = useVendorAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Mock analytics data - replace with actual API calls
  const analyticsData = {
    overview: {
      totalRevenue: 12450.75,
      revenueChange: 15.3,
      totalOrders: 142,
      ordersChange: 8.2,
      totalViews: 3420,
      viewsChange: -2.1,
      conversionRate: 4.15,
      conversionChange: 1.8
    },
    topProducts: [
      {
        id: 1,
        name: "Summer Floral Dress",
        revenue: 1800.75,
        orders: 18,
        views: 450,
        conversionRate: 4.0,
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=60&h=60&fit=crop"
      },
      {
        id: 2,
        name: "Leather Handbag",
        revenue: 1599.20,
        orders: 8,
        views: 320,
        conversionRate: 2.5,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=60&h=60&fit=crop"
      },
      {
        id: 3,
        name: "Classic Denim Jacket",
        revenue: 1299.75,
        orders: 10,
        views: 380,
        conversionRate: 2.6,
        image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=60&h=60&fit=crop"
      }
    ],
    salesData: [
      { month: 'Jan', sales: 2400, orders: 24, views: 800 },
      { month: 'Feb', sales: 3200, orders: 32, views: 950 },
      { month: 'Mar', sales: 2800, orders: 28, views: 900 },
      { month: 'Apr', sales: 3800, orders: 38, views: 1200 },
      { month: 'May', sales: 4200, orders: 42, views: 1350 },
      { month: 'Jun', sales: 3600, orders: 36, views: 1100 }
    ],
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 25, count: 36 },
        { range: '25-34', percentage: 35, count: 50 },
        { range: '35-44', percentage: 28, count: 40 },
        { range: '45+', percentage: 12, count: 16 }
      ],
      genderSplit: {
        female: 68,
        male: 28,
        other: 4
      }
    }
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (!vendor) {
    navigate('/vendor/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <VendorNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">
              Track your store performance and customer insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analyticsData.overview.totalRevenue.toLocaleString()}</div>
              <div className={`flex items-center text-xs ${getChangeColor(analyticsData.overview.revenueChange)}`}>
                {getChangeIcon(analyticsData.overview.revenueChange)}
                <span className="ml-1">
                  {Math.abs(analyticsData.overview.revenueChange)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalOrders}</div>
              <div className={`flex items-center text-xs ${getChangeColor(analyticsData.overview.ordersChange)}`}>
                {getChangeIcon(analyticsData.overview.ordersChange)}
                <span className="ml-1">
                  {Math.abs(analyticsData.overview.ordersChange)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</div>
              <div className={`flex items-center text-xs ${getChangeColor(analyticsData.overview.viewsChange)}`}>
                {getChangeIcon(analyticsData.overview.viewsChange)}
                <span className="ml-1">
                  {Math.abs(analyticsData.overview.viewsChange)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.conversionRate}%</div>
              <div className={`flex items-center text-xs ${getChangeColor(analyticsData.overview.conversionChange)}`}>
                {getChangeIcon(analyticsData.overview.conversionChange)}
                <span className="ml-1">
                  {Math.abs(analyticsData.overview.conversionChange)}% from last period
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Monthly sales performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analyticsData.salesData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="bg-accent rounded-t w-full relative"
                      style={{ 
                        height: `${(data.sales / Math.max(...analyticsData.salesData.map(d => d.sales))) * 200}px`,
                        minHeight: '20px'
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                        ${(data.sales / 1000).toFixed(1)}k
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{data.month}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Demographics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Demographics</CardTitle>
              <CardDescription>Age distribution of your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.demographics.ageGroups.map((group, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium w-12">{group.range}</div>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {group.percentage}% ({group.count})
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Gender Distribution</h4>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                    <span>Female {analyticsData.demographics.genderSplit.female}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>Male {analyticsData.demographics.genderSplit.male}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Other {analyticsData.demographics.genderSplit.other}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Your best-selling products this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-4 p-4 rounded-lg border bg-card">
                  <div className="flex items-center space-x-3 flex-1">
                    <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product.orders} orders • {product.views} views
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-lg font-bold">${product.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{product.orders}</div>
                      <div className="text-xs text-muted-foreground">Orders</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">{product.conversionRate}%</div>
                      <div className="text-xs text-muted-foreground">Conversion</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorAnalytics;