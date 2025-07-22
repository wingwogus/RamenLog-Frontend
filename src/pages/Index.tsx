import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RamenShopCard from "@/components/RamenShopCard";
import SearchAndFilter from "@/components/SearchAndFilter";
import { useToast } from "@/hooks/use-toast";
import { Utensils, MapPin, TrendingUp, Star } from "lucide-react";

// Import ramen images
import ramen1 from "@/assets/ramen-1.jpg";
import ramen2 from "@/assets/ramen-2.jpg";
import ramen3 from "@/assets/ramen-3.jpg";
import ramen4 from "@/assets/ramen-4.jpg";

interface RamenShop {
  id: number;
  name: string;
  address: string;
  phone: string;
  openHours: string;
  rating: number;
  ratingCount: number;
  category: string;
  specialties: string[];
  image: string;
  priceRange: string;
  district: string;
}

interface FilterOptions {
  category?: string;
  priceRange?: string;
  rating?: number;
  district?: string;
}

// Sample data for Korean ramen shops
const sampleRamenShops: RamenShop[] = [
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
    image: ramen1,
    priceRange: "₩10,000-15,000",
    district: "강남구"
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
    image: ramen2,
    priceRange: "₩10,000 이하",
    district: "마포구"
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
    image: ramen3,
    priceRange: "₩15,000-20,000",
    district: "용산구"
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
    image: ramen4,
    priceRange: "₩10,000-15,000",
    district: "송파구"
  }
];

const Index = () => {
  const [shops] = useState<RamenShop[]>(sampleRamenShops);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({});
  const { toast } = useToast();

  const handleRating = (shopId: number, rating: number) => {
    toast({
      title: "평점이 등록되었습니다!",
      description: `${rating}점으로 평가해주셔서 감사합니다.`,
    });
  };

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      // Search filter
      if (searchQuery && !shop.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !shop.district.includes(searchQuery)) {
        return false;
      }

      // Category filter
      if (filters.category && shop.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (filters.priceRange && shop.priceRange !== filters.priceRange) {
        return false;
      }

      // District filter
      if (filters.district && shop.district !== filters.district) {
        return false;
      }

      // Rating filter
      if (filters.rating && shop.rating < filters.rating) {
        return false;
      }

      return true;
    });
  }, [shops, searchQuery, filters]);

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
                <h1 className="text-2xl font-bold text-foreground">라멘맵</h1>
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
                {(shops.reduce((sum, shop) => sum + shop.rating, 0) / shops.length).toFixed(1)}
              </div>
            </div>
            <div className="text-muted-foreground">평균 평점</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <SearchAndFilter
            onSearch={setSearchQuery}
            onFilter={setFilters}
            activeFilters={filters}
          />
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              검색 결과 <span className="text-primary">{filteredShops.length}개</span>
            </h3>
            {(searchQuery || Object.keys(filters).length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setFilters({});
                }}
                className="text-sm"
              >
                전체 보기
              </Button>
            )}
          </div>
        </div>

        {/* Shop Grid */}
        {filteredShops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredShops.map((shop) => (
              <RamenShopCard key={shop.id} shop={shop} onRate={handleRating} />
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
                setFilters({});
              }}
            >
              전체 라멘집 보기
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>© 2024 라멘맵. 맛있는 라멘을 위한 여정</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
