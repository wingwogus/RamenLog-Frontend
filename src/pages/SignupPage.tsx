import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Mail, User, Lock } from 'lucide-react';

type SignupStep = 'email' | 'verification' | 'details' | 'complete';

export default function SignupPage() {
  const [step, setStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "입력 오류",
        description: "이메일을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.sendEmailCode(email);
      
      if (response.success) {
        toast({
          title: "인증코드 전송",
          description: "이메일로 인증코드가 전송되었습니다.",
        });
        setStep('verification');
      } else {
        toast({
          title: "전송 실패",
          description: response.error || "인증코드 전송에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "인증코드 전송 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast({
        title: "입력 오류",
        description: "인증코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.verifyEmailCode(email, verificationCode);
      
      if (response.success) {
        toast({
          title: "인증 성공",
          description: "이메일 인증이 완료되었습니다.",
        });
        setStep('details');
      } else {
        toast({
          title: "인증 실패",
          description: response.error || "잘못된 인증코드입니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "인증 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyNickname = async () => {
    if (!nickname) {
      toast({
        title: "입력 오류",
        description: "닉네임을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.verifyNickname(nickname);
      
      if (response.success) {
        toast({
          title: "사용 가능",
          description: "사용 가능한 닉네임입니다.",
        });
        setIsNicknameVerified(true);
      } else {
        toast({
          title: "사용 불가",
          description: response.error || "이미 사용중인 닉네임입니다.",
          variant: "destructive",
        });
        setIsNicknameVerified(false);
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "닉네임 확인 중 문제가 발생했습니다.",
        variant: "destructive",
      });
      setIsNicknameVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname || !password || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!isNicknameVerified) {
      toast({
        title: "닉네임 확인 필요",
        description: "닉네임 중복 확인을 해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.signup({
        email,
        password,
        nickname,
      });
      
      if (response.success) {
        setStep('complete');
      } else {
        toast({
          title: "회원가입 실패",
          description: response.error || "회원가입에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "회원가입 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleSendEmail} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '전송 중...' : '인증코드 받기'}
            </Button>
          </form>
        );

      case 'verification':
        return (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">인증코드</Label>
              <Input
                id="code"
                type="text"
                placeholder="6자리 인증코드"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
                maxLength={6}
              />
              <p className="text-sm text-muted-foreground">
                {email}로 전송된 인증코드를 입력하세요
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '확인 중...' : '인증하기'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => setStep('email')}
            >
              이메일 다시 입력
            </Button>
          </form>
        );

      case 'details':
        return (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <div className="flex gap-2">
                <Input
                  id="nickname"
                  type="text"
                  placeholder="닉네임을 입력하세요"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setIsNicknameVerified(false);
                  }}
                  disabled={isLoading}
                />
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleVerifyNickname}
                  disabled={isLoading || !nickname}
                >
                  중복확인
                </Button>
              </div>
              {isNicknameVerified && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  사용 가능한 닉네임입니다
                </p>
              )}
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
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !isNicknameVerified}>
              {isLoading ? '가입 중...' : '회원가입 완료'}
            </Button>
          </form>
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">회원가입 완료!</h3>
            <p className="text-muted-foreground">
              라멘로그에 오신 것을 환영합니다.<br />
              이제 로그인하여 라멘 리뷰를 시작해보세요!
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              홈으로 가기
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepIcon = (currentStep: SignupStep) => {
    switch (currentStep) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'verification':
        return <CheckCircle className="w-5 h-5" />;
      case 'details':
        return <User className="w-5 h-5" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return '이메일 입력';
      case 'verification':
        return '이메일 인증';
      case 'details':
        return '회원정보 입력';
      case 'complete':
        return '가입완료';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'email':
        return '회원가입을 위해 이메일을 입력해주세요';
      case 'verification':
        return '이메일로 전송된 인증코드를 입력해주세요';
      case 'details':
        return '닉네임과 비밀번호를 설정해주세요';
      case 'complete':
        return '회원가입이 성공적으로 완료되었습니다';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step !== 'complete' && (
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        )}
        
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStepIcon(step)}
            </div>
            <CardTitle className="text-2xl">{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
        
        {step !== 'complete' && (
          <div className="text-center mt-6 text-sm text-muted-foreground">
            이미 계정이 있으신가요?{' '}
            <Link to="/" className="text-primary hover:underline">
              로그인하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}