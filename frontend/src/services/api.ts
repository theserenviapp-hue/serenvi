import axios, { AxiosInstance, AxiosError } from 'axios';

// Token getter set by App.tsx via Clerk's useAuth hook
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach Clerk session token to every request
    this.client.interceptors.request.use(async (config) => {
      if (tokenGetter) {
        const token = await tokenGetter();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Handle 401 -> Clerk handles redirect via SignedOut
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  // GENERIC METHODS
  async post(endpoint: string, payload?: any) {
    const { data } = await this.client.post(endpoint, payload);
    return { data };
  }

  async get(endpoint: string) {
    const { data } = await this.client.get(endpoint);
    return { data };
  }

  async put(endpoint: string, payload?: any) {
    const { data } = await this.client.put(endpoint, payload);
    return { data };
  }

  async delete(endpoint: string) {
    const { data } = await this.client.delete(endpoint);
    return { data };
  }

  // PROFILE
  async getProfile(distributorId: string) {
    const { data } = await this.client.get(`/distributors/${distributorId}`);
    return data;
  }

  async updateProfile(distributorId: string, payload: any) {
    const { data } = await this.client.put(`/distributors/${distributorId}`, payload);
    return data;
  }

  async getDashboard(distributorId: string) {
    const { data } = await this.client.get(`/distributors/${distributorId}/dashboard`);
    return data;
  }

  async getTeamAnalytics(distributorId: string) {
    const { data } = await this.client.get(`/distributors/${distributorId}/team`);
    return data;
  }

  async getAchievements(distributorId: string) {
    const { data } = await this.client.get(`/distributors/${distributorId}/achievements`);
    return data;
  }

  // SALES
  async createSale(productId: string, quantity: number, paymentMethod: string) {
    const { data } = await this.client.post('/sales', { productId, quantity, paymentMethod });
    return data;
  }

  async getSalesHistory(skip = 0, take = 20) {
    const { data } = await this.client.get(`/sales/history?skip=${skip}&take=${take}`);
    return data;
  }

  async getSalesStats() {
    const { data } = await this.client.get('/sales/stats');
    return data;
  }

  // PRODUCTS
  async getProducts(category?: string, skip = 0, take = 20) {
    const { data } = await this.client.get('/products', { params: { category, skip, take } });
    return data;
  }

  async getProduct(productId: string) {
    const { data } = await this.client.get(`/products/${productId}`);
    return data;
  }

  // WALLET
  async getWallet() {
    const { data } = await this.client.get('/wallet');
    return data;
  }

  async getTransactionHistory(skip = 0, take = 20) {
    const { data } = await this.client.get(`/wallet/transactions?skip=${skip}&take=${take}`);
    return data;
  }

  async requestWithdrawal(
    amount: number,
    bankAccount: string,
    bankIFSC: string,
    accountHolder: string
  ) {
    const { data } = await this.client.post('/wallet/withdraw', {
      amount,
      bankAccount,
      bankIFSC,
      accountHolder,
    });
    return data;
  }
}

const apiClient = new ApiClient();
export default apiClient;
