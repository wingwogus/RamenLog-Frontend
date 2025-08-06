import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ReviewPage from "./pages/ReviewPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import RestaurantDetailPage from "./pages/RestaurantDetailPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import LikedRestaurantsPage from "./pages/LikedRestaurantsPage";
import MapPage from "./pages/MapPage";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import Forbidden from "./pages/Forbidden";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/my-reviews" element={<MyReviewsPage />} />
            <Route path="/liked-restaurants" element={<LikedRestaurantsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/500" element={<ServerError />} />
            <Route path="/403" element={<Forbidden />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
