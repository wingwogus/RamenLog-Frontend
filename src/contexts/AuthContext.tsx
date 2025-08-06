import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, Member } from '@/services/api';

interface AuthContextType {
  user: Member | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        await refreshUserInfo();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    apiService.logout();
    apiService.clearAuthToken();
    setUser(null);
  };

  const refreshUserInfo = async () => {
    try {
      const response = await apiService.getMemberInfo();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // 앱 시작시 토큰이 있으면 사용자 정보 로드
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        apiService.setAuthToken(token);
        await refreshUserInfo();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
    refreshUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};