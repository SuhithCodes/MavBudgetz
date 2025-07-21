'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryManager } from "@/components/settings/category-manager"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";


interface UserPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    monthlyReports: boolean;
}

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [preferences, setPreferences] = useState<UserPreferences>({
        emailNotifications: false,
        pushNotifications: false,
        monthlyReports: false,
    });
    
    useEffect(() => {
        if (user) {
            const prefDocRef = doc(db, 'userPreferences', user.uid);
            getDoc(prefDocRef).then((docSnap) => {
                if (docSnap.exists()) {
                    setPreferences(docSnap.data() as UserPreferences);
                }
            });
        }
    }, [user]);

    const handlePreferenceChange = async (key: keyof UserPreferences, value: boolean) => {
        if (!user) return;
        
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);

        try {
            const prefDocRef = doc(db, 'userPreferences', user.uid);
            await setDoc(prefDocRef, newPreferences, { merge: true });
            toast({ title: 'Preferences Updated' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save preferences.' });
        }
    };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
      <h1 className="font-headline text-3xl font-semibold">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-4 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user?.displayName || ''} placeholder="Your name"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} disabled />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password. Make sure it's a strong one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
           <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="email-notifications" className="flex flex-col space-y-1 cursor-pointer">
                        <span>Email Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        Receive summaries and alerts.
                        </span>
                    </Label>
                    <Switch 
                        id="email-notifications" 
                        checked={preferences.emailNotifications}
                        onCheckedChange={(value) => handlePreferenceChange('emailNotifications', value)}
                    />
                </div>
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="push-notifications" className="flex flex-col space-y-1 cursor-pointer">
                        <span>Push Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        Get real-time alerts on your devices.
                        </span>
                    </Label>
                    <Switch 
                        id="push-notifications" 
                        checked={preferences.pushNotifications}
                        onCheckedChange={(value) => handlePreferenceChange('pushNotifications', value)}
                    />
                </div>
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="monthly-reports" className="flex flex-col space-y-1 cursor-pointer">
                        <span>Monthly Reports</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        Get a PDF report each month.
                        </span>
                    </Label>
                    <Switch 
                        id="monthly-reports" 
                        checked={preferences.monthlyReports}
                        onCheckedChange={(value) => handlePreferenceChange('monthlyReports', value)}
                    />
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
            <CategoryManager />
        </TabsContent>

      </Tabs>
    </main>
  )
}
