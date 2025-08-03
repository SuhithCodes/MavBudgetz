import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/context/auth-context";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <div className="relative flex-1 pb-20 md:pb-0">
          {children}
        </div>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
