import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config/firebase";
import { setUser } from "./slices/authSlice";
import { getSubscriptionStatus } from "./slices/subscriptionSlice";
import ProtectedRoute from "./layout/ProtectedRoute";
import SpotlightBackground from "./ui/SpotlightBackground";
import SubscriptionMonitor from "./layout/SubscriptionMonitor";
import Home from "./Pages/Home";
import ProfilePage from "./componets/ProfilePage";
import TestInterface from "./componets/test/TestInterface";
import RecentTestsHome from "./componets/RecentTestsHome";
import TestAnalysis from "./ui/TestAnalysis";
import Dashboard from "./componets/dashboard/Dashboard";
import ResetPasswordPage from "./componets/ResetPasswordPage";
import SuperApp from "./super-admin/SuperApp";
import AdminDashboard from "./componets/admin/AdminDashboard";

import { TestProvider } from "./context/TestContext.jsx";
import { DashboardProvider } from "./context/DashboardContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import { LeaderboardProvider } from "./context/LeaderboardContext.jsx";
import { SubscriptionProvider } from "./context/SubscriptionContext.jsx";

const StudentRoutes = () => (
  <SubscriptionProvider>
    <DashboardProvider>
      <TestProvider>
        <LeaderboardProvider>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profilePage" element={<ProfilePage />} />
            <Route path="/test/:testId" element={<TestInterface />} />
            <Route path="/study" element={<RecentTestsHome />} />
            <Route path="/test-analysis/:attemptId" element={<TestAnalysis />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </LeaderboardProvider>
      </TestProvider>
    </DashboardProvider>
  </SubscriptionProvider>
);

const AdminRoutes = () => (
  <AdminProvider>
    <Routes>
      <Route path="/*" element={<AdminDashboard />} />
    </Routes>
  </AdminProvider>
);

const SuperAdminRoutes = () => (
  <Routes>
    <Route path="/*" element={<SuperApp />} />
  </Routes>
);

const App = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

useEffect(() => {
  const initializeAuth = async () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Initial user from localStorage:", parsedUser.uid);
        const currentUserId = auth.currentUser?.uid;
        
        if (currentUserId && currentUserId !== parsedUser.uid) {
          console.log("⚠️ User mismatch detected. Clearing data...");
          localStorage.clear();
          window.location.reload();
          return;
        }

        dispatch(setUser(parsedUser));

        if (parsedUser?.uid) {
          console.log("Fetching fresh user data from Firestore...");
          const userRef = doc(db, "users", parsedUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const freshUserData = userSnap.data();
            console.log("Fresh user data:", freshUserData);
            console.log("User role:", freshUserData.role);

            const updatedUser = {
              uid: parsedUser.uid,
              ...freshUserData,
            };

            dispatch(setUser(updatedUser));
            localStorage.setItem("user", JSON.stringify(updatedUser));

            if (freshUserData.subscription) {
              dispatch(getSubscriptionStatus(parsedUser.uid));
            }
          } else {
            console.log("⚠️ User document not found. Clearing session...");
            localStorage.clear();
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("user");
      }
    }
  };

  initializeAuth();
}, [dispatch]);
  return (
    <div className="relative min-h-screen w-full text-gray-200">
      <Toaster position="top-center" />
      {(!user || user.role === "student") && <SpotlightBackground />}

      <SubscriptionMonitor />

      <div className="relative z-10">
        <Routes>
          <Route
            path="/super/*"
            element={
              <ProtectedRoute allowedRoles={["superadmin"]}>
                <SuperAdminRoutes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/*"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentRoutes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              user?.role === "superadmin" ? (
                <Navigate to="/super/dashboard" replace />
              ) : user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user?.role === "student" ? (
                <Home />
              ) : (
                <Home />
              )
            }
          />

          <Route
            path="*"
            element={
              user?.role === "superadmin" ? (
                <Navigate to="/super/dashboard" replace />
              ) : user?.role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : user?.role === "student" ? (
                <Navigate to="/student/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;