import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield } from 'lucide-react';
import { getAccountTypeDisplayName, isCustomer, isVendor } from '@/utils/accountTypes';

const AccountTypeDisplay: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No user logged in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Email:</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium">Name:</p>
          <p className="text-sm text-muted-foreground">{user.name}</p>
        </div>
        
        <div>
          <p className="text-sm font-medium">Account Type:</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={isVendor(user) ? "default" : "secondary"}
              className={isVendor(user) ? "bg-green-600" : "bg-blue-600"}
            >
              {user.account_type ? getAccountTypeDisplayName(user.account_type) : 'Unknown'}
            </Badge>
            {isCustomer(user) && (
              <span className="text-xs text-muted-foreground">Shopping account</span>
            )}
            {isVendor(user) && (
              <span className="text-xs text-muted-foreground">Business account</span>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Account ID: {user.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountTypeDisplay;