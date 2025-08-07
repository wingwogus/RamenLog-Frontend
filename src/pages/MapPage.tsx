import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, Restaurant, PaginatedResponse } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Star } from 'lucide-react';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const MapPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllRestaurants = async () => {
      setLoading(true);
      setError(null);

      try {
        // 첫 번째 페이지를 가져와서 총 페이지 수 확인
        const firstResponse = await apiService.getRestaurants(0, 10);
        
        if (!firstResponse.success) {
          setError('라멘집 데이터를 불러오는데 실패했습니다.');
          setLoading(false);
          return;
        }

        const firstPageData = firstResponse.data as PaginatedResponse<Restaurant>;
        const totalPages = firstPageData.totalPages;
        let allRestaurants = [...firstPageData.content];

        // 나머지 페이지들을 병렬로 가져오기
        if (totalPages > 1) {
          const pagePromises = [];
          for (let page = 1; page < totalPages; page++) {
            pagePromises.push(apiService.getRestaurants(page, 10));
          }

          const pageResponses = await Promise.all(pagePromises);
          
          for (const response of pageResponses) {
            if (response.success) {
              const pageData = response.data as PaginatedResponse<Restaurant>;
              allRestaurants = [...allRestaurants, ...pageData.content];
            }
          }
        }

        setRestaurants(allRestaurants);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        setError('라멘집 데이터를 불러오는데 실패했습니다.');
      }

      setLoading(false);
    };

    fetchAllRestaurants();
  }, []);

  useEffect(() => {
    if (restaurants.length === 0) return;

    // Google Maps API 로드
    const loadGoogleMaps = () => {
      if (typeof window.google !== 'undefined') {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDf1k4eqDeL5O8GbZsnaMiC1seh6-NK8Fo&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initMap;
      
      document.head.appendChild(script);
    };

    const initMap = () => {
      const map = new window.google.maps.Map(
        document.getElementById('map') as HTMLElement,
        {
          zoom: 11,
          center: { lat: 37.5665, lng: 126.9780 }, // 서울 중심
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }
      );

      // 라멘집 마커 추가
      restaurants.forEach((restaurant) => {
        const marker = new window.google.maps.Marker({
          position: { lat: restaurant.latitude, lng: restaurant.longitude },
          map: map,
          title: restaurant.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,%3Csvg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="%23ef4444"/%3E%3Ccircle cx="12" cy="9" r="3" fill="white"/%3E%3C/svg%3E',
            scaledSize: new window.google.maps.Size(32, 32),
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${restaurant.name}</h3>
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <span style="color: #fbbf24;">★</span>
                <span style="font-size: 14px;">${restaurant.avgRating.toFixed(1)}</span>
              </div>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">${restaurant.address.fullAddress}</p>
              <button 
                onclick="window.location.href='/restaurant/${restaurant.id}'" 
                style="margin-top: 8px; padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;"
              >
                상세보기
              </button>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    };

    loadGoogleMaps();
  }, [restaurants]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">지도를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">라멘집 지도</h1>
          </div>
        </div>
        
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Google Maps API 키가 필요합니다. 개발자에게 문의하세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">라멘집 지도</h1>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div id="map" className="w-full h-[calc(100vh-80px)]"></div>
        
        {/* Info Card */}
        <div className="absolute top-4 left-4 z-10">
          <Card className="w-80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                라멘집 위치 ({restaurants.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                지도의 마커를 클릭하여 라멘집 정보를 확인하세요.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapPage;