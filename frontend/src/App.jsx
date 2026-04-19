import { Box, Center, Spinner, useToast } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import MainNavbar from "./components/MainNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { getRoleDashboardPath } from "./utils/rolePaths";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AlumniDirectoryPage = lazy(() => import("./pages/AlumniDirectoryPage"));
const AlumniProfilePage = lazy(() => import("./pages/AlumniProfilePage"));
const MentorshipPage = lazy(() => import("./pages/MentorshipPage"));
const MentorshipRequestsPage = lazy(() => import("./pages/MentorshipRequestsPage"));
const OpportunitiesPage = lazy(() => import("./pages/OpportunitiesPage"));
const OpportunitiesManagePage = lazy(() => import("./pages/OpportunitiesManagePage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const AdminOpportunitiesPage = lazy(() => import("./pages/AdminOpportunitiesPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const SESSION_EXPIRED_FLAG = "alumniconnect-session-expired";
const MotionBox = motion(Box);

const RouteFallback = () => {
  return (
    <Center minH="50vh">
      <Spinner size="xl" color="teal.500" />
    </Center>
  );
};

const PageTransition = ({ children }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </MotionBox>
  );
};

function App() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const authLandingPath = user ? getRoleDashboardPath(user.role) : "/login";

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_EXPIRED_FLAG) === "1") {
      sessionStorage.removeItem(SESSION_EXPIRED_FLAG);

      if (!toast.isActive("session-expired-toast")) {
        toast({
          id: "session-expired-toast",
          title: "Session expired",
          description: "Session expired, please log in again",
          status: "warning",
          duration: 3500,
          isClosable: true,
        });
      }
    }
  }, [toast]);

  return (
    <Box minH="100vh" bg="gray.50">
      <MainNavbar />

      <Suspense fallback={<RouteFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route
              path="/login"
              element={
                user ? <Navigate to={authLandingPath} replace /> : <PageTransition><LoginPage /></PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                user ? <Navigate to={authLandingPath} replace /> : <PageTransition><RegisterPage /></PageTransition>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Student", "Alumni"]}>
                  <PageTransition><DashboardPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/alumni"
              element={<PageTransition><AlumniDirectoryPage /></PageTransition>}
            />
            <Route path="/alumni/:id" element={<PageTransition><AlumniProfilePage /></PageTransition>} />
            <Route
              path="/mentorship"
              element={
                <ProtectedRoute allowedRoles={["Student"]}>
                  <PageTransition><MentorshipPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunities"
              element={<PageTransition><OpportunitiesPage /></PageTransition>}
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute allowedRoles={["Student", "Alumni"]}>
                  <PageTransition><MessagesPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["Student", "Alumni"]}>
                  <PageTransition><ProfilePage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentorship/requests"
              element={
                <ProtectedRoute allowedRoles={["Alumni"]}>
                  <PageTransition><MentorshipRequestsPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/opportunities/manage"
              element={
                <ProtectedRoute allowedRoles={["Alumni"]}>
                  <PageTransition><OpportunitiesManagePage /></PageTransition>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <PageTransition><AdminDashboardPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <PageTransition><AdminUsersPage /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/opportunities"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <PageTransition><AdminOpportunitiesPage /></PageTransition>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </Box>
  );
}

export default App;
