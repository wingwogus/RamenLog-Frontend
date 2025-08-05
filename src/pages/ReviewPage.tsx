import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReview } from '@/hooks/useRamenShops';

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submitReview, loading } = useReview();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!id || rating === 0) {
      toast({
        title: "입력 오류",
        description: "평점을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (content.trim().length < 10) {
      toast({
        title: "입력 오류",
        description: "리뷰는 최소 10자 이상 작성해주세요.",
        variant: "destructive",
      });
      return;
    }

    const success = await submitReview(parseInt(id), rating, content);
    
    if (success) {
      toast({
        title: "리뷰 등록 완료",
        description: "소중한 리뷰가 등록되었습니다.",
      });
      navigate('/');
    } else {
      toast({
        title: "등록 실패",
        description: "리뷰 등록에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              리뷰 작성
            </CardTitle>
            <p className="text-muted-foreground">
              다른 사용자들에게 도움이 되는 솔직한 리뷰를 남겨주세요
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 별점 선택 */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">이 라멘집은 어떠셨나요?</h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="transition-transform hover:scale-110"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {rating}점 - {
                    rating === 5 ? '최고예요!' :
                    rating === 4 ? '좋아요!' :
                    rating === 3 ? '보통이에요' :
                    rating === 2 ? '별로예요' :
                    '실망이에요'
                  }
                </p>
              )}
            </div>

            {/* 리뷰 작성 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">자세한 리뷰를 남겨주세요</h3>
              <Textarea
                placeholder="맛, 서비스, 분위기 등에 대해 자세히 써주세요. (최소 10자)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {content.length}/500자
              </p>
            </div>

            {/* 제출 버튼 */}
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || content.trim().length < 10 || loading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 transition-all duration-300"
            >
              {loading ? '등록 중...' : '리뷰 등록하기'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}