import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/context/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        {children}
      </div>
    </ProtectedRoute>
  );
}
