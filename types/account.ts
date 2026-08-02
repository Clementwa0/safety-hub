export interface AccountMe {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface LinkGuestOrdersResult {
  linkedCount: number;
}
