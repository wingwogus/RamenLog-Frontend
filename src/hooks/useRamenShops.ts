import { useState, useEffect, useCallback } from 'react';
import { apiService, RamenShop, SearchFilters } from '@/services/api';

export const useRamenShops = (initialFilters?: SearchFilters) => {
  const [shops, setShops] = useState<RamenShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {});

  const fetchShops = useCallback(async (newFilters?: SearchFilters) => {
    setLoading(true);
    setError(null);

    const filtersToUse = newFilters || filters;
    const response = await apiService.getRamenShops(filtersToUse);

    if (response.success) {
      setShops(response.data);
    } else {
      setError(response.error || '라멘집 데이터를 불러오는데 실패했습니다.');
      // 백엔드 연결 실패시 샘플 데이터 사용
      console.warn('API 연결 실패, 샘플 데이터 사용');
      setShops(getSampleData());
    }

    setLoading(false);
  }, [filters]);

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    fetchShops(newFilters);
  }, [fetchShops]);

  const refreshShops = useCallback(() => {
    fetchShops();
  }, [fetchShops]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  return {
    shops,
    loading,
    error,
    filters,
    updateFilters,
    refreshShops,
  };
};

export const useRamenShop = (id: number) => {
  const [shop, setShop] = useState<RamenShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      setError(null);

      const response = await apiService.getRamenShop(id);

      if (response.success) {
        setShop(response.data);
      } else {
        setError(response.error || '라멘집 정보를 불러오는데 실패했습니다.');
      }

      setLoading(false);
    };

    fetchShop();
  }, [id]);

  return { shop, loading, error };
};

export const useRating = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRating = useCallback(async (shopId: number, rating: number, review?: string) => {
    setLoading(true);
    setError(null);

    const response = await apiService.createRating({
      shopId,
      rating,
      review,
    });

    if (!response.success) {
      setError(response.error || '평점 등록에 실패했습니다.');
    }

    setLoading(false);
    return response.success;
  }, []);

  return {
    submitRating,
    loading,
    error,
  };
};

// 백엔드 연결 실패시 사용할 샘플 데이터
const getSampleData = (): RamenShop[] => [
  {
    id: 1,
    name: "라멘야마토",
    address: "서울특별시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    openHours: "11:00-22:00",
    rating: 4.5,
    ratingCount: 234,
    category: "돈코츠",
    specialties: ["돈코츠라멘", "차슈라멘", "교자"],
    image: "/src/assets/ramen-1.jpg",
    priceRange: "₩10,000-15,000",
    district: "강남구",
    latitude: 37.5665,
    longitude: 126.978,
    description: "정통 일본식 돈코츠 라멘 전문점",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "미소라멘 하우스",
    address: "서울특별시 마포구 홍대입구 456",
    phone: "02-2345-6789",
    openHours: "12:00-23:00",
    rating: 4.3,
    ratingCount: 189,
    category: "미소",
    specialties: ["미소라멘", "매운미소", "탄탄멘"],
    image: "/src/assets/ramen-2.jpg",
    priceRange: "₩10,000 이하",
    district: "마포구",
    latitude: 37.5547,
    longitude: 126.9236,
    description: "깊은 맛의 미소 라멘",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 3,
    name: "쇼유라멘 전문점",
    address: "서울특별시 용산구 이태원로 789",
    phone: "02-3456-7890",
    openHours: "11:30-21:30",
    rating: 4.7,
    ratingCount: 312,
    category: "쇼유",
    specialties: ["쇼유라멘", "치킨라멘", "와규차슈"],
    image: "/src/assets/ramen-3.jpg",
    priceRange: "₩15,000-20,000",
    district: "용산구",
    latitude: 37.5384,
    longitude: 126.9956,
    description: "깔끔한 쇼유 베이스 라멘",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 4,
    name: "매운라멘 코리아",
    address: "서울특별시 송파구 잠실동 101",
    phone: "02-4567-8901",
    openHours: "11:00-22:30",
    rating: 4.4,
    ratingCount: 156,
    category: "미소",
    specialties: ["매운미소라멘", "김치라멘", "불고기라멘"],
    image: "/src/assets/ramen-4.jpg",
    priceRange: "₩10,000-15,000",
    district: "송파구",
    latitude: 37.5125,
    longitude: 127.1025,
    description: "한국식 매운 라멘 전문점",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];