import { useState, useEffect, useCallback } from 'react';
import { apiService, Restaurant, SearchFilters, PaginatedResponse } from '@/services/api';

export const useRestaurants = (keyword?: string) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false
  });
  const [currentFilters, setCurrentFilters] = useState<{
    keyword?: string;
    district?: string;
    city?: string;
  }>({});

  const fetchRestaurants = useCallback(async (searchKeyword?: string, page = 0, district?: string, city?: string, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    let response;
    
    // 키워드 검색이 있는 경우 검색 엔드포인트 사용 (페이지네이션 없음)
    if (searchKeyword && !district && !city) {
      response = await apiService.searchRestaurants(searchKeyword);
      // 검색 결과를 페이지네이션 형태로 변환
      if (response.success) {
        const searchData = {
          content: response.data,
          number: 0,
          totalPages: 1,
          totalElements: response.data.length,
          last: true
        };
        response = { success: true, data: searchData };
      }
    }
    // 지역 필터가 있으면 by-address 엔드포인트 사용
    else if (district || city) {
      const address = district || city || '';
      response = await apiService.getRestaurantsByAddress(address, page, 10);
    } 
    // 기본 전체 조회
    else {
      response = await apiService.getRestaurants(page, 10);
    }

    if (response.success) {
      if (isLoadMore) {
        // 무한 스크롤 시 기존 데이터에 추가
        setRestaurants(prev => [...prev, ...response.data.content]);
        setAllRestaurants(prev => [...prev, ...response.data.content]);
      } else {
        // 새로운 검색/필터 시 데이터 교체
        setRestaurants(response.data.content);
        setAllRestaurants(response.data.content);
      }
      setPagination({
        currentPage: response.data.number,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        hasNext: !response.data.last
      });
      
      // 현재 필터 상태 저장
      setCurrentFilters({
        keyword: searchKeyword,
        district: district,
        city
      });
    } else {
      setError(response.error || '라멘집 데이터를 불러오는데 실패했습니다.');
      if (!isLoadMore) {
        // 백엔드 연결 실패시 샘플 데이터 사용 (초기 로드시만)
        console.warn('API 연결 실패, 샘플 데이터 사용');
        const sampleData = getSampleData();
        setRestaurants(sampleData);
        setAllRestaurants(sampleData);
        setPagination({
          currentPage: 0,
          totalPages: 1,
          totalElements: sampleData.length,
          hasNext: false
        });
      }
    }

    if (isLoadMore) {
      setLoadingMore(false);
    } else {
      setLoading(false);
    }
  }, []);

  const goToPage = useCallback((page: number) => {
    fetchRestaurants(undefined, page);
  }, [fetchRestaurants]);

  const searchRestaurants = useCallback((searchKeyword: string, district?: string, city?: string) => {
    fetchRestaurants(searchKeyword, 0, district, city, false);
  }, [fetchRestaurants]);

  const filterAndSortRestaurants = useCallback((filters: any) => {
    try {
      // 필터링은 백엔드에서 처리하므로 API 호출
      fetchRestaurants(currentFilters.keyword, 0, filters.district, filters.city, false);
    } catch (error) {
      console.error('Filter and sort error:', error);
      setError('필터링 중 오류가 발생했습니다.');
    }
  }, [fetchRestaurants, currentFilters.keyword]);

  const loadMoreRestaurants = useCallback(() => {
    if (pagination.hasNext && !loadingMore) {
      fetchRestaurants(
        currentFilters.keyword, 
        pagination.currentPage + 1, 
        currentFilters.district, 
        currentFilters.city, 
        true
      );
    }
  }, [fetchRestaurants, pagination, loadingMore, currentFilters]);

  const filterByCity = useCallback((city: string) => {
    fetchRestaurants(currentFilters.keyword, 0, undefined, city, false);
  }, [fetchRestaurants, currentFilters.keyword]);

  useEffect(() => {
    fetchRestaurants(keyword);
  }, [fetchRestaurants, keyword]);

  return {
    restaurants,
    loading,
    loadingMore,
    error,
    pagination,
    searchRestaurants,
    refreshRestaurants: () => fetchRestaurants(keyword),
    filterAndSortRestaurants,
    loadMoreRestaurants,
    filterByCity,
    goToPage,
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