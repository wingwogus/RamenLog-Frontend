import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter } from 'lucide-react';

interface FilterOptions {
  district?: string;
}

interface SearchAndFilterProps {
  onSearch: (keyword: string) => void;
  onFilter: (filters: FilterOptions) => void;
  searchKeyword: string;
  setSearchKeyword: (keyword: string) => void;
}

const SearchAndFilter = ({ onSearch, onFilter, searchKeyword, setSearchKeyword }: SearchAndFilterProps) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("전체");

  const districts = [
    "전체",
    "강남구",
    "강동구", 
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구"
  ];

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    onFilter({ district: value === "전체" ? undefined : value });
  };

  const handleSearch = () => {
    onSearch(searchKeyword);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="라멘집 이름으로 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10"
          />
          <Button
            onClick={handleSearch}
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
          <SelectTrigger className="w-32">
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

      {selectedDistrict !== "전체" && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            지역: {selectedDistrict}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => handleDistrictChange("전체")}
            />
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;