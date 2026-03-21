import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Loader2, CheckCircle2, XCircle, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setErrorMessage('No verification token provided');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:8035'
        : `${window.location.protocol}//${window.location.hostname}`;

      const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({ title: 'Success!', description: 'Your email has been verified successfully.' });
      } else {
        setErrorMessage(data.error || 'Verification failed');
        toast({ title: 'Verification failed', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      toast({ title: 'Error', description: 'Failed to verify email', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-green-200 dark:border-green-800 group"
      >
        <Home className="h-5 w-5 text-green-600 group-hover:text-green-700" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-green-700">Home</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Link to="/" className="p-3 bg-green-100 dark:bg-green-900 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer">
              <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
            </Link>
          </div>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {isVerifying ? 'Verifying your email address...' : isSuccess ? 'Email verified!' : 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {isVerifying && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-16 w-16 text-green-600 animate-spin" />
              <p className="text-muted-foreground">Please wait while we verify your email...</p>
            </div>
          )}
          
          {!isVerifying && isSuccess && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
              <p className="text-center text-muted-foreground">
                Your email has been verified successfully! You can now access all features of your account.
              </p>
            </div>
          )}
          
          {!isVerifying && !isSuccess && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-16 w-16 text-red-600" />
              <p className="text-center text-muted-foreground">{errorMessage}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {isSuccess && (
            <Button onClick={() => navigate('/login')} className="w-full bg-green-600 hover:bg-green-700">
              Continue to Login
            </Button>
          )}
          {!isVerifying && !isSuccess && (
            <>
              <Button onClick={() => navigate('/login')} className="w-full bg-green-600 hover:bg-green-700">
                Go to Login
              </Button>
              <Button onClick={() => navigate('/register')} variant="outline" className="w-full">
                Create New Account
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

