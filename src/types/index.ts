export interface User {
  id: string;
  email: string;
  name: string;
  account_type?: 'customer' | 'vendor';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  comment: string;
  date: string;
  verified: boolean;
  helpful: number; // number of helpful votes
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  sizes: string[];
  isNew?: boolean;
  isSale?: boolean;
  inStock: boolean;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered';
  orderDate: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, accountType?: 'customer' | 'vendor') => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isLoading?: boolean;
}

export interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

export interface AIContextType {
  messages: AIMessage[];
  isLoading: boolean;
  isOpen: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => void;
  toggleChat: () => void;
  closeChat: () => void;
}

export interface AIConfig {
  apiUrl?: string;
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// Vendor-related types
export interface Vendor {
  id: string;
  email: string;
  name: string;
  businessName: string;
  description?: string;
  phone?: string;
  profileImage?: string;
  website?: string;
  taxId?: string;
  socialMedia?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isApproved: boolean;
  joinedDate: string;
}

export interface VendorProduct extends Omit<Product, 'id'> {
  id?: number;
  vendorId: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface VendorAuthContextType {
  vendor: Vendor | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: VendorSignupData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Vendor>) => void;
}

export interface VendorSignupData {
  email: string;
  password: string;
  name: string;
  businessName: string;
  description?: string;
  phone?: string;
}

export interface VendorStats {
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  totalSales: number;
  monthlyRevenue: number;
  totalOrders: number;
}