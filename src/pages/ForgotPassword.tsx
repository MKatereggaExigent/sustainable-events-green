import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Loader2, Home, ArrowLeft, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:8035'
        : `${window.location.protocol}//${window.location.hostname}`;

      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({ title: 'Email sent!', description: 'Check your inbox for password reset instructions.' });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to send reset email', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setIsLoading(false);
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
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            {isSuccess ? 'Check your email' : 'Enter your email to receive reset instructions'}
          </CardDescription>
        </CardHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We'll send you an email with instructions to reset your password.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
              </Button>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-green-600 hover:underline text-center flex items-center justify-center gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </CardFooter>
          </form>
        ) : (
          <>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                <Mail className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-center text-muted-foreground">
                If an account exists with <strong>{email}</strong>, you will receive an email with password reset instructions.
              </p>
              <p className="text-sm text-muted-foreground text-center">
                The link will expire in 1 hour for security reasons.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Link to="/login" className="w-full">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Return to Login
                </Button>
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}

