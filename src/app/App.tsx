import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { getTheme, NAV_LINKS } from "./data/constants";
import { AnimatePresence } from "motion/react";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout & Shared
import { Navbar } from "./components/layout/Navbar";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Footer } from "./components/layout/Footer";
import { ScrollToTop } from "./components/shared/ScrollToTop";
import { LoadingScreen } from "./components/shared/LoadingScreen";
import { FoodPatternBackground } from "./components/shared/FoodPatternBackground";

// User Pages
import { DashboardPage } from "./pages/DashboardPage";
import { AccountPage } from "./pages/AccountPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { TrackingPage } from "./pages/TrackingPage";
import { LoginPage } from "./pages/LoginPage";
import { MenuPage } from "./pages/MenuPage";
import { BudgetPage } from "./pages/BudgetPage";
import { LaporanPage } from "./pages/LaporanPage";
import { AIPage } from "./pages/AIPage";

// Admin Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminMenusPage } from "./pages/admin/AdminMenusPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminFeedbackPage } from "./pages/admin/AdminFeedbackPage";
import { AdminJadwalPage } from "./pages/admin/AdminJadwalPage";
import { NotificationProvider } from "./context/NotificationContext";
import { NotificationPage } from "./pages/NotificationPage";

// ─── Guards ──────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ─── Main App ────────────────────────────────────────────────────────────────
function AppContent() {
  const [dark, setDark] = useState(false);
  const [activeNav, setActiveNav] = useState(NAV_LINKS[0].label);
  const [isAppLoading, setIsAppLoading] = useState(true);

  const { isLoading: isAuthLoading } = useAuth();
  const location = useLocation();

  const theme = getTheme(dark);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const isLoginPage = location.pathname === "/login";
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div
      className={`min-h-screen transition-colors duration-300 antialiased flex flex-col ${dark ? "dark" : ""}`}
      style={{ color: theme.textMain, fontFamily: "'Inter', sans-serif" }}
    >
      <FoodPatternBackground theme={theme} />
      <Toaster position="top-center" richColors theme={dark ? "dark" : "light"} />
      <AnimatePresence>
        {isAppLoading && <LoadingScreen onComplete={() => setIsAppLoading(false)} theme={theme} />}
      </AnimatePresence>

      {/* Navbar hanya untuk halaman user (bukan login & bukan admin) */}
      {!isLoginPage && !isAdminPage && (
        <Navbar theme={theme} activeNav={activeNav} setActiveNav={setActiveNav} dark={dark} setDark={setDark} />
      )}

      <div className="flex-1 flex flex-col relative z-10">
        {isAuthLoading ? null : (
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage theme={theme} />} />

            {/* User Routes */}
            <Route path="/" element={<ProtectedRoute><DashboardPage theme={theme} /></ProtectedRoute>} />
            <Route path="/menus" element={<ProtectedRoute><MenuPage theme={theme} /></ProtectedRoute>} />
            <Route path="/lacak" element={<ProtectedRoute><TrackingPage theme={theme} /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><FeedbackPage theme={theme} /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><BudgetPage theme={theme} /></ProtectedRoute>} />
            <Route path="/laporan" element={<ProtectedRoute><LaporanPage theme={theme} /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPage theme={theme} /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage theme={theme} /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationPage theme={theme} /></ProtectedRoute>} />

            {/* Admin Routes — layout terpisah dengan sidebar */}
            <Route path="/admin" element={<AdminRoute><AdminLayout theme={theme} dark={dark} setDark={setDark} /></AdminRoute>}>
              <Route index element={<AdminDashboard theme={theme} />} />
              <Route path="menus" element={<AdminMenusPage theme={theme} />} />
              <Route path="pengguna" element={<AdminUsersPage theme={theme} />} />
              <Route path="pengaduan" element={<AdminFeedbackPage theme={theme} />} />
              <Route path="jadwal" element={<AdminJadwalPage theme={theme} />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>

      {/* Footer hanya untuk user pages */}
      {!isLoginPage && !isAdminPage && <div className="relative z-10"><Footer theme={theme} /></div>}

      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
