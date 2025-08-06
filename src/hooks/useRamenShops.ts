import { useState, useEffect, useCallback } from 'react';
import { apiService, Restaurant, SearchFilters } from '@/services/api';

export const useRestaurants = (keyword?: string) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async (searchKeyword?: string) => {
    setLoading(true);
    setError(null);

    const response = await apiService.getRestaurants(searchKeyword);

    if (response.success) {
      setRestaurants(response.data);
      setAllRestaurants(response.data);
    } else {
      setError(response.error || '라멘집 데이터를 불러오는데 실패했습니다.');
      // 백엔드 연결 실패시 샘플 데이터 사용
      console.warn('API 연결 실패, 샘플 데이터 사용');
      const sampleData = getSampleData();
      setRestaurants(sampleData);
      setAllRestaurants(sampleData);
    }

    setLoading(false);
  }, []);

  const searchRestaurants = useCallback((searchKeyword: string) => {
    fetchRestaurants(searchKeyword);
  }, [fetchRestaurants]);

  const filterAndSortRestaurants = useCallback((filters: any) => {
    try {
      let filtered = [...allRestaurants];

      // Filter by district (주소별 필터링)
      if (filters.district && filters.district !== "전체") {
        filtered = filtered.filter(restaurant => 
          restaurant.address.fullAddress.includes(filters.district)
        );
      }

      // Filter by rating
      if (filters.rating && filters.rating > 0) {
        filtered = filtered.filter(restaurant => restaurant.avgRating >= filters.rating);
      }

      // Sort
      if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => b.avgRating - a.avgRating);
      }

      setRestaurants(filtered);
    } catch (error) {
      console.error('Filter and sort error:', error);
      setError('필터링 중 오류가 발생했습니다.');
    }
  }, [allRestaurants]);

  useEffect(() => {
    fetchRestaurants(keyword);
  }, [fetchRestaurants, keyword]);

  return {
    restaurants,
    loading,
    error,
    searchRestaurants,
    refreshRestaurants: () => fetchRestaurants(keyword),
    filterAndSortRestaurants,
  };
};

export const useRestaurant = (id: number) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);

      const response = await apiService.getRestaurant(id);

      if (response.success) {
        setRestaurant(response.data);
      } else {
        setError(response.error || '라멘집 정보를 불러오는데 실패했습니다.');
      }

      setLoading(false);
    };

    fetchRestaurant();
  }, [id]);

  return { restaurant, loading, error };
};

export const useReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = useCallback(async (restaurantId: number, score: number, content: string) => {
    setLoading(true);
    setError(null);

    const response = await apiService.createReview({
      restaurantId,
      rating: score,
      content,
    });

    if (!response.success) {
      setError(response.error || '리뷰 등록에 실패했습니다.');
    }

    setLoading(false);
    return response.success;
  }, []);

  return {
    submitReview,
    loading,
    error,
  };
};

// 백엔드 연결 실패시 사용할 샘플 데이터
const getSampleData = (): Restaurant[] => [
  {
    id: 1,
    name: "라멘야마토",
    address: {
      fullAddress: "서울특별시 강남구 테헤란로 123"
    },
    score: 4.5,
    avgRating: 4.5,
    imageUrl: "/src/assets/ramen-1.jpg",
    latitude: 37.5665,
    longitude: 126.978,
    reviewCount: 1032
  },
  {
    id: 2,
    name: "미소라멘 하우스",
    address: {
      fullAddress: "서울특별시 마포구 홍대입구 456"
    },
    score: 4.3,
    avgRating: 4.3,
    imageUrl: "/src/assets/ramen-2.jpg",
    latitude: 37.5547,
    longitude: 126.9236,
    reviewCount: 1087
  },
  {
    id: 3,
    name: "쇼유라멘 전문점",
    address: {
      fullAddress: "서울특별시 용산구 이태원로 789"
    },
    score: 4.7,
    avgRating: 4.7,
    imageUrl: "/src/assets/ramen-3.jpg",
    latitude: 37.5384,
    longitude: 126.9956,
    reviewCount: 1156
  },
  {
    id: 4,
    name: "매운라멘 코리아",
    address: {
      fullAddress: "서울특별시 송파구 잠실동 101"
    },
    score: 4.4,
    avgRating: 4.4,
    imageUrl: "/src/assets/ramen-4.jpg",
    latitude: 37.5125,
    longitude: 127.1025,
    reviewCount: 1021
  }
];