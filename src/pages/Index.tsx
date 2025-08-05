import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RamenShopCard from "@/components/RamenShopCard";
import SearchAndFilter from "@/components/SearchAndFilter";
import { useToast } from "@/hooks/use-toast";
import { useRamenShops, useRating } from "@/hooks/useRamenShops";
import { SearchFilters } from "@/services/api";
import { Utensils, MapPin, TrendingUp, Star, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import ramen images
import ramen1 from "@/assets/ramen-1.jpg";
import ramen2 from "@/assets/ramen-2.jpg";
import ramen3 from "@/assets/ramen-3.jpg";
import ramen4 from "@/assets/ramen-4.jpg";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { restaurants, loading, error, searchRestaurants } = useRestaurants();
  const { submitRating, loading: ratingLoading } = useRating();
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilters({ search: query });
  };

  const handleFilter = (filters: SearchFilters) => {
    updateFilters({ ...filters, search: searchQuery });
  };

  const handleRating = async (shopId: number, rating: number) => {
    const success = await submitRating(shopId, rating);
    
    if (success) {
      toast({
        title: "평점이 등록되었습니다!",
        description: `${rating}점으로 평가해주셔서 감사합니다.`,
      });
    } else {
      toast({
        title: "평점 등록 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 이미지 경로 매핑 (백엔드에서 이미지 URL이 안 올 경우)
  const getImageUrl = (shop: any) => {
    if (shop.image?.startsWith('http')) {
      return shop.image;
    }
    // 로컬 이미지 매핑
    const imageMap: Record<number, string> = {
      1: ramen1,
      2: ramen2,
      3: ramen3,
      4: ramen4,
    };
    return imageMap[shop.id] || ramen1;
  };

  // 상점 데이터에 로컬 이미지 URL 적용
  const shopsWithImages = shops.map(shop => ({
    ...shop,
    image: getImageUrl(shop)
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">라멘집 정보를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Utensils className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">라멘로그</h1>
                <p className="text-sm text-muted-foreground">한국 최고의 라멘집을 찾아보세요</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>서울</span>
              </div>
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                인기순
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              백엔드 연결에 실패했습니다. 샘플 데이터를 표시합니다: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            최고의 라멘을 <span className="bg-gradient-primary bg-clip-text text-transparent">평가하고</span> 발견하세요
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            전국 라멘 애호가들이 추천하는 진짜 맛집들을 만나보세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card rounded-lg p-6 text-center shadow-card">
            <div className="text-3xl font-bold text-primary mb-2">{shops.length}</div>
            <div className="text-muted-foreground">등록된 라멘집</div>
          </div>
          <div className="bg-card rounded-lg p-6 text-center shadow-card">
            <div className="text-3xl font-bold text-accent mb-2">
              {(shops.reduce((sum, shop) => sum + shop.ratingCount, 0)).toLocaleString()}
            </div>
            <div className="text-muted-foreground">총 리뷰 수</div>
          </div>
          <div className="bg-card rounded-lg p-6 text-center shadow-card">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Star className="w-6 h-6 fill-accent text-accent" />
              <div className="text-3xl font-bold text-accent">
                {shops.length > 0 ? (shops.reduce((sum, shop) => sum + shop.rating, 0) / shops.length).toFixed(1) : "0.0"}
              </div>
            </div>
            <div className="text-muted-foreground">평균 평점</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <SearchAndFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            activeFilters={{}}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              검색 결과 <span className="text-primary">{shopsWithImages.length}개</span>
            </h3>
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  updateFilters({});
                }}
                className="text-sm"
              >
                전체 보기
              </Button>
            )}
          </div>
        </div>

        {/* Shop Grid */}
        {shopsWithImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shopsWithImages.map((shop) => (
              <RamenShopCard 
                key={shop.id} 
                shop={shop} 
                onRate={handleRating} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-muted-foreground mb-4">
              다른 검색어나 필터를 시도해보세요
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                updateFilters({});
              }}
            >
              전체 라멘집 보기
            </Button>
          </div>
        )}

        {/* Backend Configuration Note */}
        <div className="mt-16 p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" />
            백엔드 연결 설정
          </h3>
          <p className="text-muted-foreground mb-4">
            현재는 샘플 데이터를 사용하고 있습니다. 실제 백엔드와 연결하려면:
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. <code className="bg-muted px-2 py-1 rounded">src/services/api.ts</code>에서 API_BASE_URL을 실제 백엔드 URL로 변경</p>
            <p>2. 백엔드 서버가 실행 중인지 확인</p>
            <p>3. CORS 설정이 올바른지 확인</p>
            <p>4. API 엔드포인트가 예상 형식과 일치하는지 확인</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>© 2024 라멘로그. 맛있는 라멘을 위한 여정</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;