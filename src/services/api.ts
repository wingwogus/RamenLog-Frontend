// API Base Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api' 
  : 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface RamenShop {
  id: number;
  name: string;
  address: string;
  phone: string;
  openHours: string;
  rating: number;
  ratingCount: number;
  category: string;
  specialties: string[];
  image: string;
  priceRange: string;
  district: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: number;
  shopId: number;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface CreateRatingRequest {
  shopId: number;
  rating: number;
  review?: string;
}

export interface SearchFilters {
  category?: string;
  priceRange?: string;
  rating?: number;
  district?: string;
  search?: string;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // 로컬스토리지에서 토큰 가져오기 (있다면)
    this.authToken = localStorage.getItem('authToken');
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 라멘집 관련 API
  async getRamenShops(filters?: SearchFilters): Promise<ApiResponse<RamenShop[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/shops${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<RamenShop[]>(endpoint);
  }

  async getRamenShop(id: number): Promise<ApiResponse<RamenShop>> {
    return this.makeRequest<RamenShop>(`/shops/${id}`);
  }

  async createRamenShop(shop: Omit<RamenShop, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<RamenShop>> {
    return this.makeRequest<RamenShop>('/shops', {
      method: 'POST',
      body: JSON.stringify(shop),
    });
  }

  async updateRamenShop(id: number, shop: Partial<RamenShop>): Promise<ApiResponse<RamenShop>> {
    return this.makeRequest<RamenShop>(`/shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shop),
    });
  }

  async deleteRamenShop(id: number): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/shops/${id}`, {
      method: 'DELETE',
    });
  }

  // 평점 관련 API
  async createRating(rating: CreateRatingRequest): Promise<ApiResponse<Rating>> {
    return this.makeRequest<Rating>('/ratings', {
      method: 'POST',
      body: JSON.stringify(rating),
    });
  }

  async getRatings(shopId: number): Promise<ApiResponse<Rating[]>> {
    return this.makeRequest<Rating[]>(`/ratings/shop/${shopId}`);
  }

  async getUserRatings(): Promise<ApiResponse<Rating[]>> {
    return this.makeRequest<Rating[]>('/ratings/user');
  }

  // 인증 관련 API (필요시)
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.makeRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async register(userData: { email: string; password: string; name: string }): Promise<ApiResponse<{ token: string; user: any }>> {
    const response = await this.makeRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    this.clearAuthToken();
  }
}

export const apiService = new ApiService();
export default apiService;