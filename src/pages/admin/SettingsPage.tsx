import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Key, 
  User, 
  Save, 
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from '@/components/ui/sonner';

const SettingsPage = () => {
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    siteName: 'Clothify Catalogue',
    siteDescription: 'Modern e-commerce platform for clothing products',
    timezone: 'UTC',
    currency: 'USD',
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    twoFactorAuth: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    setFormData({
      siteName: 'Clothify Catalogue',
      siteDescription: 'Modern e-commerce platform for clothing products',
      timezone: 'UTC',
      currency: 'USD',
      notifications: true,
      emailAlerts: true,
      darkMode: false,
      twoFactorAuth: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    toast.info('Settings reset to default values');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your admin panel preferences and system settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Configure basic site information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={formData.siteName}
                      onChange={handleInputChange}
                      placeholder="Enter site name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Input
                      id="siteDescription"
                      name="siteDescription"
                      value={formData.siteDescription}
                      onChange={handleInputChange}
                      placeholder="Enter site description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={formData.timezone} 
                      onValueChange={(value) => handleSelectChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                        <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                        <SelectItem value="GMT">GMT</SelectItem>
                        <SelectItem value="CET">Central European Time (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => handleSelectChange('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage authentication and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      id="twoFactorAuth"
                      name="twoFactorAuth"
                      checked={formData.twoFactorAuth}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, twoFactorAuth: checked }))
                      }
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            placeholder="Enter current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how you receive alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about important events
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      name="notifications"
                      checked={formData.notifications}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, notifications: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Alerts for New Orders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new orders are placed
                      </p>
                    </div>
                    <Switch
                      id="emailAlerts"
                      name="emailAlerts"
                      checked={formData.emailAlerts}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, emailAlerts: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Vendor Application Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new vendor applications
                      </p>
                    </div>
                    <Switch
                      id="vendorAlerts"
                      name="vendorAlerts"
                      checked={true}
                      onCheckedChange={() => {}}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Product Review Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get alerts for products pending review
                      </p>
                    </div>
                    <Switch
                      id="productAlerts"
                      name="productAlerts"
                      checked={true}
                      onCheckedChange={() => {}}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>Customize the look and feel of your admin panel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable dark theme for the admin panel
                      </p>
                    </div>
                    <Switch
                      id="darkMode"
                      name="darkMode"
                      checked={formData.darkMode}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, darkMode: checked }))
                      }
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-4">Theme Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-300">
                        <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded mb-2"></div>
                        <p className="text-sm font-medium">Default</p>
                      </div>
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 opacity-50">
                        <div className="h-20 bg-gradient-to-r from-green-500 to-teal-600 rounded mb-2"></div>
                        <p className="text-sm font-medium">Nature</p>
                      </div>
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 opacity-50">
                        <div className="h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded mb-2"></div>
                        <p className="text-sm font-medium">Sunset</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      More themes available in premium version
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset Defaults
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;