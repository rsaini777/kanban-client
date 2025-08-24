"use client"
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  password: string;
  name: string;
  regEmail: string;
  regPassword: string;
}

export default function Auth(): JSX.Element {
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    regEmail: '',
    regPassword: ''
  });
  const Router = useRouter();

  const handleInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Fixed Sign-In handler
  const handleSignInClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await loginUser({ email: formData.email, password: formData.password });
      if (res.ok) {
        setMessage("Login successful");
        Router.push("/projects"); // redirect to projects
      } else {
        setMessage(res.error || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setMessage(error?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Skeleton for Sign-Up
  const handleSignUpClick = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // TODO: call your signup API here, e.g.,
      // const res = await registerUser({ name: formData.name, email: formData.regEmail, password: formData.regPassword });
      // if (res.ok) { Router.push("/projects"); }
      setMessage("Sign-Up logic not implemented yet");
    } catch (error: any) {
      console.error("Sign-Up error:", error);
      setMessage(error?.message || "Sign-Up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>Login or create a new account to continue</CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <Alert className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={handleSignInClick}
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </TabsContent>

            {/* Register */}
            <TabsContent value="register" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={formData.regEmail}
                    onChange={(e) => handleInputChange('regEmail', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    placeholder="Create a password" 
                    value={formData.regPassword}
                    onChange={(e) => handleInputChange('regPassword', e.target.value)}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={handleSignUpClick}
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
