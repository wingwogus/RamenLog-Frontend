import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService, Restaurant, Review } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star, MapPin, Heart, MessageSquare, Phone, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  // --- 상태 관리 변경 ---
  // 단일 이미지가 아닌, 이미지 목록과 현재 인덱스를 관리합니다.
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeImages, setActiveImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const openPreview = (images: string[], startIndex: number) => {
    setActiveImages(images);
    setActiveImageIndex(startIndex);
    setIsPreviewOpen(true);
  };

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  // --- 이미지 네비게이션 함수 ---
  const goToNextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation(); // 버튼 클릭 시 모달이 닫히는 것을 방지
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % activeImages.length);
  }, [activeImages.length]);

  const goToPrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation(); // 버튼 클릭 시 모달이 닫히는 것을 방지
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + activeImages.length) % activeImages.length);
  }, [activeImages.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview();
      // --- 키보드 좌우 화살표로 네비게이션 ---
      if (activeImages.length > 1) {
        if (e.key === 'ArrowRight') goToNextImage();
        if (e.key === 'ArrowLeft') goToPrevImage();
      }
    };

    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isPreviewOpen, closePreview, goToNextImage, goToPrevImage, activeImages.length]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const [restaurantResponse, reviewsResponse] = await Promise.all([
          apiService.getRestaurant(Number(id)),
          apiService.getRestaurantReviews(Number(id))
        ]);

        if (restaurantResponse.success) {
          setRestaurant(restaurantResponse.data);
          setIsLiked(restaurantResponse.data.liked || false);
        } else {
          setError(restaurantResponse.error || '라멘집 정보를 불러오는데 실패했습니다.');
        }

        if (reviewsResponse.success) {
          setReviews(reviewsResponse.data);
        }
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (!restaurant) return;

    // Optimistic update - toggle immediately on frontend
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    setIsLiking(true);
    try {
      await apiService.toggleLike(restaurant.id);
      toast.success(newLikedState ? "찜 목록에 추가되었습니다" : "찜 목록에서 제거되었습니다");
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLiking(false);
    }
  };

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

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">{error || '라멘집 정보를 찾을 수 없습니다.'}</div>
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
          <h1 className="text-xl font-bold">라멘집 상세</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Restaurant Info */}
        <Card>
          <div className="relative h-64 overflow-hidden rounded-t-lg">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                onClick={handleLikeToggle}
                disabled={isLiking}
                className="backdrop-blur-sm bg-white/90 hover:bg-white"
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                {isLiked ? "찜 완료" : "찜하기"}
              </Button>
            </div>
          </div>

          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {renderStars(restaurant.avgRating ?? 0)}
                      <span className="ml-1 font-medium">{(restaurant.avgRating ?? 0).toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({reviews.length}개 리뷰)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{restaurant.address.fullAddress}</span>
                  {typeof restaurant.openNow === 'boolean' && (
                    <Badge variant="secondary" className={restaurant.openNow ? 'bg-green-500/10 text-green-600 border-green-500/20' : ''}>
                      {restaurant.openNow ? '영업중' : '영업 종료'}
                    </Badge>
                  )}
                </div>
                {restaurant.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <a href={`tel:${restaurant.phoneNumber}`} className="hover:underline">
                      {restaurant.phoneNumber}
                    </a>
                  </div>
                )}
                {restaurant.weekdayText && restaurant.weekdayText.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      {restaurant.weekdayText.map((line, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground">{line}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/review/${restaurant.id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  리뷰 작성
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              리뷰 ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                아직 작성된 리뷰가 없습니다.
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
                          <span className="font-medium">{review.nickname}</span>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating ?? 0)}
                            <span className="text-sm text-muted-foreground ml-1">
                              {(review.rating ?? 0).toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {review.createdAt ? formatDate(review.createdAt) : ''}
                          </span>
                        </div>

                        <p className="text-foreground leading-relaxed">
                          {review.content}
                        </p>

                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((image, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="w-20 h-20 rounded-lg overflow-hidden cursor-zoom-in group"
                                role="button"
                                tabIndex={0}
                                aria-label={`리뷰 이미지 ${imgIndex + 1} 확대`}
                                // --- 클릭 시 전체 이미지 목록과 현재 인덱스를 전달 ---
                                onClick={() => openPreview(review.images, imgIndex)}
                                onKeyDown={(e) => { if (e.key === 'Enter') openPreview(review.images, imgIndex); }}
                              >
                                <img
                                  src={image}
                                  alt={`리뷰 이미지 ${imgIndex + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                />
                              </div>
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

      {/* --- 이미지 뷰어 UI 변경 --- */}
      {isPreviewOpen && activeImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePreview}
          aria-modal="true"
          role="dialog"
        >
          {/* 이전 이미지 버튼 */}
          {activeImages.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 text-white/70 hover:text-white hover:bg-white/20"
              onClick={goToPrevImage}
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeImages[activeImageIndex]}
              alt="확대 이미지"
              className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl object-contain"
            />
          </div>

          {/* 다음 이미지 버튼 */}
          {activeImages.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-12 w-12 text-white/70 hover:text-white hover:bg-white/20"
              onClick={goToNextImage}
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* 닫기 버튼 (우측 상단) */}
          <Button type="button" variant="ghost" size="icon" className="absolute top-4 right-4 rounded-full h-12 w-12 text-white/70 hover:text-white hover:bg-white/20" onClick={closePreview} aria-label="확대 닫기">
            <X className="w-8 h-8" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;