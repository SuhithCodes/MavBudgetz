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
import { doc, setDoc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { getExpenses } from '@/lib/actions/expenses';
import { saveAs } from 'file-saver';
import { getSavingsGoals } from '@/lib/actions/savings-goals';
import { getBudgets } from '@/lib/actions/budgets';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import { endOfMonth, startOfMonth, format as formatDate } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getAuth, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";


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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter();
    
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

  // CSV export logic
  const handleExportExpensesCSV = async () => {
    if (!user) return;
    const expenses = await getExpenses(user.uid);
    if (expenses.length === 0) {
      toast({ title: 'No Data', description: 'There are no expenses to export.', variant: 'destructive' });
      return;
    }
    const headers = [
      'id', 'vendorName', 'date', 'time', 'totalAmount', 'currency',
      'category', 'subtotal', 'taxes', 'paymentMethod', 'lineItems', 'confidence'
    ];
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      let str = String(value);
      if (Array.isArray(value)) {
        str = value.join('; ');
      }
      if (str.search(/("|,|\n)/g) >= 0) {
        str = `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const csvRows = [headers.join(',')];
    for (const expense of expenses) {
      const values = headers.map(header => {
        const key = header as keyof typeof expense;
        return escapeCSV(expense[key]);
      });
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'expenses.csv');
    toast({ title: 'Export Successful', description: 'Your expenses have been downloaded as a CSV file.' });
  };

  // AI Summary Report logic
  const handleSummaryReport = async () => {
    if (!user) return;
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const [expenses, goals, budgets] = await Promise.all([
      getExpenses(user.uid),
      getSavingsGoals(user.uid),
      getBudgets(user.uid),
    ]);
    // Filter expenses for current month
    const monthExpenses = expenses.filter(e => e.date >= formatDate(start, 'yyyy-MM-dd') && e.date <= formatDate(end, 'yyyy-MM-dd'));
    // Beautified Markdown generation
    let md = `# 📊 **Monthly Financial Summary**\n\n`;
    md += `---\n`;
    md += `**Period:** _${formatDate(start, 'MMM dd, yyyy')} - ${formatDate(end, 'MMM dd, yyyy')}_\n\n`;
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
    md += `> **Total spent this month:** $${totalSpent.toFixed(2)}\n`;
    md += `\n---\n`;
    md += `## 🧾 Expenses (${monthExpenses.length})\n`;
    if (monthExpenses.length === 0) {
      md += '_No expenses recorded this month._\n';
    } else {
      md += '\n| Date | Vendor | Category | Amount |\n|:---:|:---|:---|---:|\n';
      for (const e of monthExpenses) {
        md += `| ${e.date} | ${e.vendorName} | ${e.category} | **$${e.totalAmount.toFixed(2)}** |\n`;
      }
    }
    md += '\n---\n';
    md += `## 🎯 Savings Goals\n`;
    if (goals.length === 0) {
      md += '_No savings goals._\n';
    } else {
      md += '\n| Name | Target | Current | Progress |\n|:---|---:|---:|---:|\n';
      for (const g of goals) {
        const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
        md += `| ${g.name} | $${g.targetAmount.toFixed(2)} | $${g.currentAmount.toFixed(2)} | ${progress.toFixed(1)}% |\n`;
      }
    }
    md += '\n---\n';
    md += `## 💰 Budgets\n`;
    if (budgets.length === 0) {
      md += '_No budgets._\n';
    } else {
      md += '\n| Name | Category | Amount | Period |\n|:---|:---|---:|:---:|\n';
      for (const b of budgets) {
        md += `| ${b.name} | ${b.category} | $${b.amount.toFixed(2)} | ${b.period} |\n`;
      }
    }
    md += '\n---\n';
    md += `## 📈 Analytics\n`;
    md += `- **Total spent:** $${totalSpent.toFixed(2)}\n`;
    md += `- **Number of transactions:** ${monthExpenses.length}\n`;
    md += `- **Number of savings goals:** ${goals.length}\n`;
    md += `- **Number of budgets:** ${budgets.length}\n`;
    // Custom CSS for PDF styling
    const customCSS = `
      <style>
        body { font-family: 'Alegreya', serif; color: #222; background: #fff; }
        h1, h2, h3 { color: #D9A829; font-family: 'Alegreya', serif; }
        h1 { font-size: 2.2em; margin-bottom: 0.2em; }
        h2 { font-size: 1.4em; margin-top: 1.5em; margin-bottom: 0.5em; }
        h3 { font-size: 1.1em; margin-top: 1em; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #eee; padding: 0.5em 0.8em; text-align: left; }
        th { background: #f5f4f0; color: #D97A29; font-weight: bold; }
        tr:nth-child(even) { background: #faf8f3; }
        tr:hover { background: #f5f4f0; }
        .summary-box { background: #f5f4f0; border-left: 6px solid #D9A829; padding: 1em; margin-bottom: 1.5em; font-size: 1.1em; }
        .section-divider { border: none; border-top: 2px solid #D9A829; margin: 2em 0 1em 0; }
        .emoji { font-size: 1.3em; vertical-align: middle; margin-right: 0.3em; }
        .analytics-list { margin: 0.5em 0 0 1em; }
        .analytics-list li { margin-bottom: 0.2em; }
      </style>
    `;
    // Convert markdown to HTML
    const html = customCSS + marked.parse(md);
    // Convert HTML to PDF and save
    html2pdf().from(html).set({ filename: 'summary-report.pdf' }).save();
    toast({ title: 'Summary Report Generated', description: 'Your summary report PDF is downloading.' });
  };

    const handleDeleteAccount = async () => {
        if (!user) return;

        try {
            // 1. Get all collections for the user
            const expensesPromise = getExpenses(user.uid);
            const budgetsPromise = getBudgets(user.uid);
            const savingsGoalsPromise = getSavingsGoals(user.uid);
            const userPrefsRef = doc(db, 'userPreferences', user.uid);

            const [expenses, budgets, savingsGoals] = await Promise.all([
                expensesPromise,
                budgetsPromise,
                savingsGoalsPromise
            ]);

            // 2. Create a batched write to delete all data
            const batch = writeBatch(db);

            expenses.forEach(exp => batch.delete(doc(db, 'expenses', exp.id)));
            budgets.forEach(bud => batch.delete(doc(db, 'budgets', bud.id)));
            savingsGoals.forEach(goal => batch.delete(doc(db, 'savingsGoals', goal.id)));
            batch.delete(userPrefsRef);

            await batch.commit();

            // 3. Delete the user from Firebase Auth
            const auth = getAuth();
            const currentUser = auth.currentUser;
            if (currentUser) {
                await deleteUser(currentUser);
            }
            
            toast({ title: "Account Deleted", description: "Your account and all data have been permanently deleted." });
            router.push('/');

        } catch (error: any) {
            console.error("Error deleting account:", error);
            if (error.code === 'auth/requires-recent-login') {
                 toast({
                    variant: "destructive",
                    title: "Re-authentication Required",
                    description: "For your security, please log out and log back in before deleting your account.",
                });
            } else {
                 toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not delete your account. Please try again.",
                });
            }
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 container mx-auto">
      <h1 className="font-headline text-3xl font-semibold">Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-5 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
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

        <TabsContent value="data">
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Data & Reports</CardTitle>
              <CardDescription>Manage your data export and reporting settings.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
               <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="expenses-report" className="flex flex-col space-y-1">
                        <span>Expenses Report</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                           Export a CSV file of all your transactions.
                        </span>
                    </Label>
                    <Button id="expenses-report" variant="outline" size="sm" onClick={handleExportExpensesCSV} className="w-32 justify-center">
                        Export CSV
                    </Button>
                </div>
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="summary-report" className="flex flex-col space-y-1">
                        <span>Monthly Summary Report</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                           Generate an AI-powered PDF summary of your finances.
                        </span>
                    </Label>
                    <Button id="summary-report" size="sm" onClick={handleSummaryReport} className="w-32 justify-center">
                        Generate PDF
                    </Button>
                </div>
                 <div className="flex items-center justify-between space-x-2 pt-4 border-t border-destructive/20">
                    <Label htmlFor="delete-account" className="flex flex-col space-y-1">
                        <span className="font-semibold text-destructive">Delete Account</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                           Permanently delete your account and all of your data.
                        </span>
                    </Label>
                    <Button id="delete-account" variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="w-32 justify-center">
                        Delete Account
                    </Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </main>
  )
}
