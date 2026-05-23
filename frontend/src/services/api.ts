import axios, { AxiosInstance, AxiosError } from 'axios';

interface AuthResponse {
  access_token: string;
  distributor: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rank: string;
    referralCode: string;
  };
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    // Attach authorization header
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // AUTH ENDPOINTS
  async register(
    email: string,
    password: string,
    name: string,
    phone: string,
    sponsorId?: string
  ): Promise<AuthResponse> {
    const { data } = await this.client.post('/auth/register', {
      email,
      password,
      name,
      phone,
      sponsorId,
    });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('distributorId', data.distributor.id);
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.client.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('distributorId', data.distributor.id);
    return data;
  }

  // GENERIC METHODS
  async post(endpoint: string, payload: any) {
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

const apiClient = new ApiClient();
export default apiClient;
