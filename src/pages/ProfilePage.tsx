import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, Member } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, MessageSquare, Star } from 'lucide-react';

const gradeConfig = {
  '멘알못': { color: 'bg-slate-500', textColor: 'text-slate-100', description: '라멘 입문자' },
  '라린이': { color: 'bg-green-500', textColor: 'text-green-100', description: '라멘 초보자' },
  '라더쿠': { color: 'bg-blue-500', textColor: 'text-blue-100', description: '라멘 애호가' },
  '라전드': { color: 'bg-purple-500', textColor: 'text-purple-100', description: '라멘 고수' },
  '라오타': { color: 'bg-gradient-to-r from-yellow-400 to-orange-500', textColor: 'text-yellow-100', description: '라멘 마스터' },
};

const ProfilePage = () => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMemberInfo = async () => {
      setLoading(true);
      setError(null);

      const response = await apiService.getMemberInfo();

      if (response.success) {
        setMember(response.data);
      } else {
        setError(response.error || '회원 정보를 불러오는데 실패했습니다.');
      }

      setLoading(false);
    };

    fetchMemberInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">{error || '회원 정보를 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  const gradeInfo = gradeConfig[member.grade as keyof typeof gradeConfig] || gradeConfig['멘알못'];
  const progressPercentage = member.endReviewCount > 0 
    ? ((member.reviewCount - member.startReviewCount) / (member.endReviewCount - member.startReviewCount)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">마이페이지</h1>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={member.profileImageUrl} alt={member.nickname} />
                <AvatarFallback className="text-lg">
                  {member.nickname.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{member.nickname}</h2>
                  <Badge 
                    className={`${gradeInfo.color} ${gradeInfo.textColor} px-3 py-1`}
                  >
                    {member.grade}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{member.email}</p>
                <p className="text-sm text-muted-foreground">{gradeInfo.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{member.reviewCount}</p>
                  <p className="text-sm text-muted-foreground">작성한 리뷰</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{member.likeCount}</p>
                  <p className="text-sm text-muted-foreground">찜한 라멘집</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{member.grade}</p>
                  <p className="text-sm text-muted-foreground">현재 등급</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grade Progress */}
        {member.nextGrade && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                등급 진행상황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{member.grade}</span>
                <span className="font-medium">{member.nextGrade}</span>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-3"
              />
              
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  다음 등급까지 <span className="font-bold text-primary">{member.remainingReviewCount}개</span>의 리뷰가 더 필요해요!
                </p>
                <p className="text-xs text-muted-foreground">
                  현재 {member.reviewCount}개 / 목표 {member.endReviewCount}개
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-12"
            onClick={() => navigate('/my-reviews')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            내가 쓴 리뷰
          </Button>
          
          <Button 
            variant="outline" 
            className="h-12"
            onClick={() => navigate('/liked-restaurants')}
          >
            <Heart className="h-4 w-4 mr-2" />
            찜한 라멘집
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;