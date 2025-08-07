import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, Restaurant } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import RamenShopCard from '@/components/RamenShopCard';

const LikedRestaurantsPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedRestaurants = async () => {
      setLoading(true);
      setError(null);

      const response = await apiService.getLikedRestaurants();

      if (response.success) {
        setRestaurants(response.data);
      } else {
        setError(response.error || '찜한 라멘집을 불러오는데 실패했습니다.');
      }

      setLoading(false);
    };

    fetchLikedRestaurants();
  }, []);

  const handleLikeToggle = () => {
    // 찜 해제 후 목록 새로고침
    const fetchLikedRestaurants = async () => {
      const response = await apiService.getLikedRestaurants();
      if (response.success) {
        setRestaurants(response.data);
      }
    };
    fetchLikedRestaurants();
  };

  const handleRate = (shopId: number, rating: number) => {
    // 평점 기능 (필요시 구현)
    console.log('Rating:', shopId, rating);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
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
            onClick={() => navigate('/profile')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">내 라멘 그릇</h1>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              내 라멘 그릇 ({restaurants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-destructive">
                {error}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                아직 찜한 라멘집이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RamenShopCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onRate={handleRate}
                    onLikeToggle={handleLikeToggle}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LikedRestaurantsPage;