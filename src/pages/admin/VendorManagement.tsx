import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useData } from '@/contexts/DataContext';
import { Vendor } from '@/types';
import { toast } from '@/components/ui/sonner';

const VendorManagement = () => {
  const { admin, hasPermission } = useAdminAuth();
  const { vendors, updateVendor, isLoadingVendors } = useData();
  const navigate = useNavigate();
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingVendorId, setProcessingVendorId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    if (!hasPermission('vendors', 'read')) {
      navigate('/admin/dashboard');
      return;
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, filterStatus]);

  const filterVendors = () => {
    let filtered = vendors;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending') {
        filtered = filtered.filter(vendor => !vendor.isApproved);
      } else if (filterStatus === 'approved') {
        filtered = filtered.filter(vendor => vendor.isApproved);
      } else if (filterStatus === 'rejected') {
        // For now, we'll treat rejected as not approved
        filtered = filtered.filter(vendor => !vendor.isApproved);
      }
    }

    setFilteredVendors(filtered);
  };

  const handleApproveVendor = async (vendorId: string) => {
    if (!hasPermission('vendors', 'approve')) {
      toast.error('You do not have permission to approve vendors');
      return;
    }

    setProcessingVendorId(vendorId);
    try {
      // Update vendor status using DataContext
      updateVendor(vendorId, { isApproved: true });
      
      toast.success('Vendor approved successfully!');
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast.error('Failed to approve vendor');
    } finally {
      setProcessingVendorId(null);
    }
  };

  const handleRejectVendor = async (vendorId: string, reason: string) => {
    if (!hasPermission('vendors', 'reject')) {
      toast.error('You do not have permission to reject vendors');
      return;
    }

    setProcessingVendorId(vendorId);
    try {
      // Update vendor status using DataContext
      updateVendor(vendorId, { isApproved: false });
      
      toast.success('Vendor rejected and notified');
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast.error('Failed to reject vendor');
    } finally {
      setProcessingVendorId(null);
    }
  };

  const getStatusBadge = (vendor: Vendor) => {
    if (vendor.isApproved) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProfileCompletion = (vendor: Vendor) => {
    let completedFields = 0;
    const totalFields = 5; // name, businessName, email, phone, address
    
    if (vendor.name) completedFields++;
    if (vendor.businessName) completedFields++;
    if (vendor.email) completedFields++;
    if (vendor.phone) completedFields++;
    if (vendor.address) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  if (isLoadingVendors) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="mt-2 text-gray-600">
            Review and manage vendor applications and accounts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredVendors.length} of {vendors.length} vendors
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{vendors.filter(v => !v.isApproved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{vendors.filter(v => v.isApproved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors by name, business, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No vendors have been registered yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {vendor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {vendor.businessName}
                        </h3>
                        {getStatusBadge(vendor)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Joined {formatDate(vendor.joinedDate)}
                          </div>
                        </div>
                        
                        <p className="font-medium text-gray-700">{vendor.name}</p>
                        
                        {vendor.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {vendor.phone}
                          </div>
                        )}
                        
                        {vendor.address && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {vendor.address.city}, {vendor.address.state}
                          </div>
                        )}
                        
                        {vendor.description && (
                          <p className="text-gray-600 mt-2">{vendor.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!vendor.isApproved && hasPermission('vendors', 'approve') && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveVendor(vendor.id)}
                          disabled={processingVendorId === vendor.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingVendorId === vendor.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Approve
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={processingVendorId === vendor.id}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Vendor Application</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject {vendor.businessName}? This action will notify the vendor.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                              <Label htmlFor="reason">Reason for rejection</Label>
                              <Textarea
                                id="reason"
                                placeholder="Please provide a reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setRejectionReason('')}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRejectVendor(vendor.id, rejectionReason)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={!rejectionReason.trim()}
                              >
                                Reject Vendor
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedVendor(vendor);
                          setIsViewDialogOpen(true);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Vendor Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {selectedVendor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedVendor.businessName}</h3>
                  <p className="text-gray-600">{selectedVendor.name}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    {getStatusBadge(selectedVendor)}
                    <span className="text-sm text-gray-500">
                      Joined {formatDate(selectedVendor.joinedDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedVendor.email}
                    </div>
                    {selectedVendor.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedVendor.phone}
                      </div>
                    )}
                    {selectedVendor.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                        <div>
                          <p>{selectedVendor.address.street}</p>
                          <p>{selectedVendor.address.city}, {selectedVendor.address.state} {selectedVendor.address.zipCode}</p>
                          <p>{selectedVendor.address.country}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Profile Completion:</span>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${calculateProfileCompletion(selectedVendor)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{calculateProfileCompletion(selectedVendor)}% complete</span>
                      </div>
                    </div>
                    {selectedVendor.description && (
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-600">{selectedVendor.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {!selectedVendor.isApproved && hasPermission('vendors', 'approve') && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleApproveVendor(selectedVendor.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Vendor
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;