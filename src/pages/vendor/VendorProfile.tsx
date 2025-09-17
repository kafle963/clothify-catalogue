import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  FileText,
  Save,
  Upload,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import VendorNavigation from '@/components/VendorNavigation';
import { Vendor } from '@/types';

const VendorProfile = () => {
  const { vendor, updateProfile } = useVendorAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<Vendor>>(vendor || {});

  const handleInputChange = (field: keyof Vendor, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      } as any
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProfile(profileData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your business profile and personal information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span>Profile Photo</span>
                </CardTitle>
                <CardDescription>
                  Upload a professional photo for your vendor profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileData.profileImage} />
                    <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                      {vendor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button type="button" variant="outline" className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1-555-0123"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Business Information</span>
                </CardTitle>
                <CardDescription>
                  Details about your business and brand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={profileData.businessName || ''}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Fashion Hub Store"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={profileData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell us about your business, what you sell, your story..."
                    className="min-h-[100px] resize-none"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Business Address</span>
                </CardTitle>
                <CardDescription>
                  Your business location and mailing address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={profileData.address?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.address?.city || ''}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="New York"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={profileData.address?.state || ''}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="NY"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={profileData.address?.zipCode || ''}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profileData.address?.country || ''}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Additional Information</span>
                </CardTitle>
                <CardDescription>
                  Extra details about your business operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profileData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.yourstore.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID/Business License</Label>
                    <Input
                      id="taxId"
                      value={profileData.taxId || ''}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      placeholder="123-45-6789"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socialMedia">Social Media Links</Label>
                  <Textarea
                    id="socialMedia"
                    value={profileData.socialMedia || ''}
                    onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                    placeholder="Instagram: @yourstore&#10;Facebook: facebook.com/yourstore&#10;Twitter: @yourstore"
                    className="min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Current status of your vendor account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">Account Approval Status</p>
                      <p className="text-sm text-muted-foreground">
                        {vendor.isApproved 
                          ? 'Your account is approved and active'
                          : 'Your account is pending approval'
                        }
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      vendor.isApproved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {vendor.isApproved ? 'Approved' : 'Pending'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div>
                      <p className="font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(vendor.joinedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vendor/dashboard')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full w-4 h-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;