// API Base Configuration
const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Restaurant {
  id: number;
  name: string;
  address: {
    fullAddress: string;
  };
  score: number;
  avgRating: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
  liked?: boolean;
  reviewCount?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface Review {
  restaurantName: string;
  rating: number;
  content: string;
  nickname: string;
  createdAt: string;
  images: string[];
}

export interface CreateReviewRequest {
  restaurantId: number;
  rating: number;
  content: string;
}

export interface JwtToken {
  accessToken: string;
  refreshToken: string;
}

export interface Member {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  grade: string;
  nextGrade: string;
  startReviewCount: number;
  endReviewCount: number;
  remainingReviewCount: number;
  reviewCount: number;
  likeCount: number;
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
        if (response.status === 401) {
          this.clearAuthToken();
          window.dispatchEvent(new CustomEvent('unauthorized'));
        }
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
  // 키워드로 라멘집 검색 (페이지네이션 없음)
  async searchRestaurants(keyword: string): Promise<ApiResponse<Restaurant[]>> {
    return this.makeRequest<Restaurant[]>(`/restaurants/search?keyword=${encodeURIComponent(keyword)}`);
  }

  // 모든 라멘집 조회 (페이지네이션)
  async getRestaurants(page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<Restaurant>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return this.makeRequest<PaginatedResponse<Restaurant>>(`/restaurants?${params.toString()}`);
  }

  async getRestaurantsByAddress(address: string, page = 0, size = 10): Promise<ApiResponse<PaginatedResponse<Restaurant>>> {
    const params = new URLSearchParams({
      address: address,
      page: page.toString(),
      size: size.toString(),
    });

    return this.makeRequest<PaginatedResponse<Restaurant>>(`/restaurants/by-address?${params.toString()}`);
  }

  async getRestaurant(id: number): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest<Restaurant>(`/restaurants/${id}`);
  }

  async getRandomRestaurant(): Promise<ApiResponse<Restaurant>> {
    return this.makeRequest<Restaurant>('/restaurants/random');
  }

  async getRestaurantRanking(): Promise<ApiResponse<Restaurant[]>> {
    return this.makeRequest<Restaurant[]>('/restaurants/rank');
  }

  // 리뷰 관련 API
  async createReview(review: CreateReviewRequest): Promise<ApiResponse<string>> {
    return this.makeRequest<string>('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  async getReviews(): Promise<ApiResponse<Review[]>> {
    return this.makeRequest<Review[]>('/reviews');
  }

  async getRestaurantReviews(restaurantId: number): Promise<ApiResponse<Review[]>> {
    return this.makeRequest<Review[]>(`/reviews/${restaurantId}`);
  }

  // 찜 관련 API
  async getLikedRestaurants(): Promise<ApiResponse<Restaurant[]>> {
    return this.makeRequest<Restaurant[]>('/likes');
  }

  async toggleLike(restaurantId: number): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>(`/likes/${restaurantId}`, {
      method: 'POST',
    });
  }

  // 회원 리뷰 관련 API
  async getMyReviews(): Promise<ApiResponse<Review[]>> {
    return this.makeRequest<Review[]>('/reviews');
  }

  // 인증 관련 API
  async login(email: string, password: string): Promise<ApiResponse<JwtToken>> {
    const response = await this.makeRequest<JwtToken>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data.accessToken) {
      this.setAuthToken(response.data.accessToken);
    }

    return response;
  }

  async sendEmailCode(email: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/auth/send-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmailCode(email: string, code: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/auth/verification', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async verifyNickname(nickname: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/auth/verification-nickname', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
  }

  async signup(userData: { email: string; password: string; nickname: string }): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.makeRequest<void>('/auth/logout', {
      method: 'POST',
    });
    this.clearAuthToken();
    return response;
  }

  // 회원 정보 관련 API
  async getMemberInfo(): Promise<ApiResponse<Member>> {
    return this.makeRequest<Member>('/members');
  }
}

export const apiService = new ApiService();
export default apiService;