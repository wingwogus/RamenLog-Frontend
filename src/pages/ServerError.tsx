import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home, Utensils } from "lucide-react";

const ServerError = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8">
          <div className="space-y-6">
            {/* Broken Ramen Bowl */}
            <div className="relative mx-auto w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full opacity-50">
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <Utensils className="w-12 h-12 text-gray-600 opacity-50" />
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <AlertTriangle className="w-16 h-16 text-destructive animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-6xl font-bold text-destructive">500</h1>
              <h2 className="text-2xl font-bold text-foreground">주방에 문제가 생겼어요!</h2>
              <p className="text-muted-foreground">
                서버에 일시적인 문제가 발생했습니다. <br />
                잠시 후 다시 시도해주세요. 🔧
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
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
              문제가 지속되면 잠시 후 다시 방문해주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerError;