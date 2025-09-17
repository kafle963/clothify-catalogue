import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Bell, 
  Mail, 
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import VendorNavigation from '@/components/VendorNavigation';

const VendorSettings = () => {
  const { vendor, logout } = useVendorAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    productUpdates: true,
    promotionalEmails: false,
    weeklyReports: true,
    monthlyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: '24',
    allowedDevices: 'unlimited'
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSecurityToggle = (setting: string, value: boolean | string) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Notification settings updated successfully!');
    } catch (error) {
      alert('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your products and data.'
    );
    
    if (!confirmation) return;

    const finalConfirmation = window.prompt(
      'To confirm account deletion, please type "DELETE" in the box below:'
    );

    if (finalConfirmation !== 'DELETE') {
      alert('Account deletion cancelled.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Account deleted successfully. You will be redirected to the homepage.');
      logout();
      navigate('/');
    } catch (error) {
      alert('Failed to delete account. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vendor) {
    navigate('/vendor/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <VendorNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your account security, notifications, and preferences
            </p>
          </div>

          <div className="space-y-8">
            {/* Password Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Password & Security</span>
                </CardTitle>
                <CardDescription>
                  Update your password and manage security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                          className="pr-10"
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm new password"
                          className="pr-10"
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-8 w-8"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Two-Factor Authentication</span>
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      {securitySettings.twoFactorEnabled 
                        ? 'Protect your account with 2FA' 
                        : 'Enable 2FA for enhanced security'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={securitySettings.twoFactorEnabled ? "default" : "secondary"}>
                      {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => handleSecurityToggle('twoFactorEnabled', checked)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">Login Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new device logins
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onCheckedChange={(checked) => handleSecurityToggle('loginAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after inactivity
                    </p>
                  </div>
                  <Select 
                    value={securitySettings.sessionTimeout} 
                    onValueChange={(value) => handleSecurityToggle('sessionTimeout', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Choose how and when you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Methods</h4>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationToggle('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => handleNotificationToggle('smsNotifications', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-muted-foreground">New orders, cancellations, and shipping updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.orderUpdates}
                      onCheckedChange={(checked) => handleNotificationToggle('orderUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">Product Updates</p>
                      <p className="text-sm text-muted-foreground">Product approval status and reviews</p>
                    </div>
                    <Switch
                      checked={notificationSettings.productUpdates}
                      onCheckedChange={(checked) => handleNotificationToggle('productUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">Weekly sales and performance summaries</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => handleNotificationToggle('weeklyReports', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">Monthly Reports</p>
                      <p className="text-sm text-muted-foreground">Detailed monthly analytics and insights</p>
                    </div>
                    <Switch
                      checked={notificationSettings.monthlyReports}
                      onCheckedChange={(checked) => handleNotificationToggle('monthlyReports', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">Promotional Emails</p>
                      <p className="text-sm text-muted-foreground">Marketing tips and platform updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.promotionalEmails}
                      onCheckedChange={(checked) => handleNotificationToggle('promotionalEmails', checked)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveNotifications}
                  disabled={isLoading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">Delete Account</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Permanently delete your vendor account and all associated data. This action cannot be undone.
                      </p>
                      <ul className="text-sm text-red-600 mt-2 space-y-1">
                        <li>• All your products will be removed</li>
                        <li>• Order history will be deleted</li>
                        <li>• Analytics data will be lost</li>
                        <li>• Account cannot be recovered</li>
                      </ul>
                    </div>
                    <Button 
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isLoading ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSettings;