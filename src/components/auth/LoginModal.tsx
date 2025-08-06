import React, {useEffect, useState} from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleUnauthorized = () => {
      // 로그인 모달 열기
      onOpenChange(true);
      toast({
        title: "권한 없음",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "로그인 성공",
          description: "라멘로그에 오신 것을 환영합니다!",
        });
        onOpenChange(false);
        window.location.href = '/';
        setEmail('');
        setPassword('');
      } else {
        toast({
          title: "로그인 실패",
          description: "이메일 또는 비밀번호를 확인해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "로그인 오류",
        description: "로그인 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">로그인</DialogTitle>
          <DialogDescription className="text-center">
            라멘로그에 오신 것을 환영합니다
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
        
        <div className="text-center text-sm text-muted-foreground">
          아직 계정이 없으신가요?{' '}
          <Link 
            to="/signup" 
            className="text-primary hover:underline"
            onClick={() => onOpenChange(false)}
          >
            회원가입
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};