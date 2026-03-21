import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Groups from "./pages/Groups";
import Admission from "./pages/Admission";
import DailySchedule from "./pages/DailySchedule";
import Careers from "./pages/Careers";
import WeeklyMenu from "./pages/WeeklyMenu";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import NewsList from "./pages/admin/NewsList";
import { NewsCreate } from "./pages/admin/NewsCreate";
import { NewsEdit } from "./pages/admin/NewsEdit";
import { NewsListPage } from "./pages/public/NewsListPage";
import { NewsDetailPage } from "./pages/public/NewsDetailPage";
import { TeachersPage } from "./pages/public/TeachersPage";
import { EventsPage } from "./pages/public/EventsPage";
import { DeadlinesPage } from "./pages/public/DeadlinesPage";
import { JobsPage } from "./pages/public/JobsPage";
import { JobDetailPage } from "./pages/public/JobDetailPage";
import { GalleriesPage } from "./pages/public/GalleriesPage";
import { GalleryDetailPage } from "./pages/public/GalleryDetailPage";
import TeachersList from "./pages/admin/TeachersList";
import TeacherCreate from "./pages/admin/TeacherCreate";
import TeacherEdit from "./pages/admin/TeacherEdit";
import EventsList from "./pages/admin/EventsList";
import EventCreate from "./pages/admin/EventCreate";
import EventEdit from "./pages/admin/EventEdit";
import DeadlinesList from "./pages/admin/DeadlinesList";
import DeadlineCreate from "./pages/admin/DeadlineCreate";
import DeadlineEdit from "./pages/admin/DeadlineEdit";
import JobsList from "./pages/admin/JobsList";
import JobCreate from "./pages/admin/JobCreate";
import JobEdit from "./pages/admin/JobEdit";
import GalleriesList from "./pages/admin/GalleriesList";
import GalleryCreate from "./pages/admin/GalleryCreate";
import GalleryEdit from "./pages/admin/GalleryEdit";

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
            <Route path="/news" element={<ErrorBoundary><PublicLayout><NewsListPage /></PublicLayout></ErrorBoundary>} />
            <Route path="/news/:id" element={<ErrorBoundary><PublicLayout><NewsDetailPage /></PublicLayout></ErrorBoundary>} />
            <Route path="/teachers" element={<ErrorBoundary><PublicLayout><TeachersPage /></PublicLayout></ErrorBoundary>} />
            <Route path="/events" element={<ErrorBoundary><PublicLayout><EventsPage /></PublicLayout></ErrorBoundary>} />
            <Route path="/deadlines" element={<ErrorBoundary><PublicLayout><DeadlinesPage /></PublicLayout></ErrorBoundary>} />
            <Route path="/jobs" element={<ErrorBoundary><PublicLayout><JobsPage /></PublicLayout></ErrorBoundary>} />
            <Route path="/jobs/:id" element={<ErrorBoundary><PublicLayout><JobDetailPage /></PublicLayout></ErrorBoundary>} />
            <Route path="/galleries" element={<ErrorBoundary><PublicLayout><GalleriesPage /></PublicLayout></ErrorBoundary>} />
            <Route path="/galleries/:id" element={<ErrorBoundary><PublicLayout><GalleryDetailPage /></PublicLayout></ErrorBoundary>} />
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
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <TeachersList />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers/create"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <TeacherCreate />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <TeacherEdit />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <EventsList />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/create"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <EventCreate />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <EventEdit />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/deadlines"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <DeadlinesList />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/deadlines/create"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <DeadlineCreate />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/deadlines/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <DeadlineEdit />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <JobsList />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/create"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <JobCreate />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/jobs/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <JobEdit />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/galleries"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <GalleriesList />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/galleries/create"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <GalleryCreate />
                    </ErrorBoundary>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/galleries/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ErrorBoundary>
                      <GalleryEdit />
                    </ErrorBoundary>
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
