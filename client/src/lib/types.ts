export interface UserState {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'farmer' | 'buyer' | 'admin';
  location?: string;
  phone?: string;
}

export interface ProductWithFarmer {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: string;
  unit: string;
  quantity: number;
  availableQuantity: number;
  saleMode: 'direct' | 'contact';
  location: string;
  province: string;
  images?: string[];
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  farmer: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  averageRating?: number;
  reviewCount?: number;
}

export interface OrderWithDetails {
  id: number;
  quantity: number;
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  product: {
    id: number;
    name: string;
    price: string;
    unit: string;
    images?: string[];
  };
  farmer: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface ReviewWithUser {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  buyer: {
    firstName: string;
    lastName: string;
  };
}

export interface ContactWithDetails {
  id: number;
  message: string;
  buyerPhone?: string;
  status: 'pending' | 'contacted' | 'completed';
  createdAt: string;
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    name: string;
  };
}
