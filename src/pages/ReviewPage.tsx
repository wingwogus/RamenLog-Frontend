import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const next = [...images, ...files].slice(0, 3);
    setImages(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const convertToJpeg = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        resolve(file);
        return;
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const converted = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), { type: 'image/jpeg' });
            resolve(converted);
          } else {
            resolve(file);
          }
          URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.9);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  };

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

    const processedImages = await Promise.all(images.map(convertToJpeg));
    const success = await submitReview(parseInt(id), rating, content, processedImages);
    
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

            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">리뷰 이미지 (최대 3장, 자동 JPG 변환)</h3>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={onFilesSelected}
                aria-label="리뷰 이미지 업로드"
              />
              {previews.length > 0 && (
                <div className="flex gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img src={src} alt={`업로드 이미지 ${idx + 1}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeImage(idx)}
                        aria-label={`이미지 ${idx + 1} 제거`}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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