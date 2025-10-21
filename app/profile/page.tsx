'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Mail, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  async function handleSignOut() {
    await signOut();
    router.push('/');
  }

  if (loading || !user || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account</p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userProfile.displayName}</p>
                <p className="text-sm text-muted-foreground">Display Name</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userProfile.email}</p>
                <p className="text-sm text-muted-foreground">Email Address</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {format(new Date(userProfile.createdAt), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">Member Since</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Available Features</CardTitle>
            <CardDescription>All features are free to use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-4">Free Access</h3>
              
              <div className="space-y-2 text-sm text-green-600 dark:text-green-400">
                <p>✓ Browse all news articles</p>
                <p>✓ AI-powered translations to 9 languages</p>
                <p>✓ Vocabulary extraction and flashcards</p>
                <p>✓ Spotify lyrics learning</p>
                <p>✓ Progress tracking</p>
                <p>✓ Text-to-speech pronunciation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/settings')}
            >
              View Settings
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Support */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help? <Link href="/contact" className="text-primary hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}