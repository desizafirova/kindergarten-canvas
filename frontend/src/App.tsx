import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Index from "./pages/Index";
import Groups from "./pages/Groups";
import Admission from "./pages/Admission";
import DailySchedule from "./pages/DailySchedule";
import Careers from "./pages/Careers";
import News from "./pages/News";
import WeeklyMenu from "./pages/WeeklyMenu";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import NewsList from "./pages/admin/NewsList";
import { NewsCreate } from "./pages/admin/NewsCreate";
import { NewsEdit } from "./pages/admin/NewsEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/admission" element={<Admission />} />
            <Route path="/daily-schedule" element={<DailySchedule />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/news" element={<News />} />
            <Route path="/menu" element={<WeeklyMenu />} />
            <Route path="/documents" element={<Documents />} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/news"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <NewsList />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/news/create"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <NewsCreate />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/news/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <NewsEdit />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
