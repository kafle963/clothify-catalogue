import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useData } from '@/contexts/DataContext';
import { User } from '@/types';
import { toast } from '@/components/ui/sonner';

const UserManagement = () => {
  const { admin, hasPermission } = useAdminAuth();
  const { users, isLoadingUsers } = useData();
  const navigate = useNavigate();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'vendor'>('all');

  useEffect(() => {
    if (!hasPermission('users', 'read')) {
      navigate('/admin/dashboard');
      return;
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterType]);

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.account_type === filterType);
    }

    setFilteredUsers(filtered);
  };

  const getUserTypeBadge = (accountType: string) => {
    switch (accountType) {
      case 'vendor':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">
            <Shield className="w-3 h-3 mr-1" />
            Vendor
          </Badge>
        );
      case 'customer':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
            <Users className="w-3 h-3 mr-1" />
            Customer
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Unknown
          </Badge>
        );
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage customer and vendor accounts
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredUsers.length} of {users.length} users
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold">{users.filter(u => u.account_type === 'customer').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendors</p>
                <p className="text-2xl font-bold">{users.filter(u => u.account_type === 'vendor').length}</p>
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
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="customer">Customers</option>
                <option value="vendor">Vendors</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users have been registered yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {user.name}
                        </h3>
                        {getUserTypeBadge(user.account_type)}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    
                    {hasPermission('users', 'update') && (
                      <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement;