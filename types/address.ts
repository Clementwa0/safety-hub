export interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressInput {
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  isDefault?: boolean;
}
