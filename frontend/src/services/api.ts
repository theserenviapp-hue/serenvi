import axios, { AxiosInstance, AxiosError } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private tokenGetter: (() => Promise<string | null>) | null = null;

  constructor() {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach Clerk JWT token to every request
    this.client.interceptors.request.use(async (config) => {
      if (this.tokenGetter) {
        try {
          const token = await this.tokenGetter();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          console.error('Failed to get token:', err);
        }
      }
      return config;
    });

    // Handle responses
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // 401 will be handled by Clerk's <SignedOut> component
          localStorage.removeItem('distributorId');
          localStorage.removeItem('isAdmin');
        }
        return Promise.reject(error);
      }
    );
  }

  setTokenGetter(getter: () => Promise<string | null>) {
    this.tokenGetter = getter;
  }

  // GENERIC METHODS
  async post(endpoint: string, payload?: any) {
    const { data } = await this.client.post(endpoint, payload);
    return { data };
  }

  async get(endpoint: string, config?: any) {
    const { data } = await this.client.get(endpoint, config);
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

  // USER ENDPOINTS
  async getMe() {
    const { data } = await this.client.get('/me');
    return data;
  }

  async completeOnboarding(name: string, phone: string, referralCode?: string) {
    const { data } = await this.client.post('/me/onboarding', {
      name,
      phone,
      referralCode,
    });
    return data;
  }

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

  // SALES ENDPOINTS
  async createSale(productId: string, quantity: number, paymentMethod: string) {
    const { data } = await this.client.post('/sales', {
      productId,
      quantity,
      paymentMethod,
    });
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

  // PRODUCTS ENDPOINTS
  async getProducts(category?: string, skip = 0, take = 20) {
    const { data } = await this.client.get('/products', {
      params: { category, skip, take },
    });
    return data;
  }

  async getProduct(productId: string) {
    const { data } = await this.client.get(`/products/${productId}`);
    return data;
  }

  // WALLET ENDPOINTS
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

export const api = new ApiClient();
export default api;
