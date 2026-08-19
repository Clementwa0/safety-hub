export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
