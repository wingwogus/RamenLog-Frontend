import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}

interface FilterOptions {
  category?: string;
  priceRange?: string;
  rating?: number;
  district?: string;
}

const categories = ["전체", "돈코츠", "미소", "쇼유", "시오", "츠케멘", "마제소바"];
const priceRanges = ["전체", "₩10,000 이하", "₩10,000-15,000", "₩15,000-20,000", "₩20,000 이상"];
const districts = ["전체", "강남구", "서초구", "마포구", "용산구", "종로구", "중구", "성동구", "송파구"];
const ratings = [
  { value: 0, label: "전체" },
  { value: 4, label: "4점 이상" },
  { value: 4.5, label: "4.5점 이상" }
];

const SearchAndFilter = ({ onSearch, onFilter, activeFilters }: SearchAndFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string | number) => {
    const newFilters = {
      ...activeFilters,
      [key]: value === "전체" || value === 0 ? undefined : value
    };
    onFilter(newFilters);
  };

  const clearFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    onFilter({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => value !== undefined).length;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="라멘집 이름 또는 지역으로 검색..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          필터
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>

        {getActiveFilterCount() > 0 && (
          <Button variant="ghost" onClick={clearAllFilters} className="text-sm">
            전체 초기화
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.category && (
            <Badge variant="secondary" className="gap-1">
              {activeFilters.category}
              <button onClick={() => clearFilter('category')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {activeFilters.priceRange && (
            <Badge variant="secondary" className="gap-1">
              {activeFilters.priceRange}
              <button onClick={() => clearFilter('priceRange')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {activeFilters.district && (
            <Badge variant="secondary" className="gap-1">
              {activeFilters.district}
              <button onClick={() => clearFilter('district')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {activeFilters.rating && (
            <Badge variant="secondary" className="gap-1">
              {activeFilters.rating}점 이상
              <button onClick={() => clearFilter('rating')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리</label>
              <Select
                value={activeFilters.category || "전체"}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">가격대</label>
              <Select
                value={activeFilters.priceRange || "전체"}
                onValueChange={(value) => handleFilterChange('priceRange', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">지역</label>
              <Select
                value={activeFilters.district || "전체"}
                onValueChange={(value) => handleFilterChange('district', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">평점</label>
              <Select
                value={activeFilters.rating?.toString() || "0"}
                onValueChange={(value) => handleFilterChange('rating', Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ratings.map((rating) => (
                    <SelectItem key={rating.value} value={rating.value.toString()}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;