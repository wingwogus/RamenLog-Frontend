import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, Review } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star, MessageSquare } from 'lucide-react';

const MyReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyReviews = async () => {
      setLoading(true);
      setError(null);

      const response = await apiService.getMyReviews();

      if (response.success) {
        setReviews(response.data);
      } else {
        setError(response.error || '리뷰를 불러오는데 실패했습니다.');
      }

      setLoading(false);
    };

    fetchMyReviews();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
              ? 'fill-yellow-200 text-yellow-400' 
              : 'text-gray-300'
        }`}
      />
    ));
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
          <h1 className="text-xl font-bold">내가 쓴 리뷰</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              내 리뷰 목록 ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-destructive">
                {error}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                아직 작성한 리뷰가 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {review.nickname.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary cursor-pointer hover:underline">
                            {review.restaurantName}
                          </span>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating ?? 0)}
                            <span className="text-sm text-muted-foreground ml-1">
                              {(review.rating ?? 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-foreground leading-relaxed">
                          {review.content}
                        </p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={image}
                                alt={`리뷰 이미지 ${imgIndex + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {index < reviews.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyReviewsPage;