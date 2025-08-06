import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, LogIn, Home, Utensils } from "lucide-react";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-6">
            {/* Locked Ramen Bowl */}
            <div className="relative mx-auto w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full opacity-50">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Utensils className="w-12 h-12 text-amber-700 opacity-50" />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Shield className="w-16 h-16 text-destructive" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-6xl font-bold text-destructive">403</h1>
              <h2 className="text-2xl font-bold text-foreground">접근이 제한된 라멘집이에요!</h2>
              <p className="text-muted-foreground">
                이 페이지에 접근할 권한이 없습니다. <br />
                로그인이 필요하거나 권한이 부족할 수 있어요. 🔒
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => navigate('/login')}
                variant="outline"
                className="flex-1"
              >
                <LogIn className="w-4 h-4 mr-2" />
                로그인
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              권한을 확인하고 다시 시도해보세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forbidden;