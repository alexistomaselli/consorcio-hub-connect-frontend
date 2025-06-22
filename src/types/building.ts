export interface Building {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  role?: string;
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
