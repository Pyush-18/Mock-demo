import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getPerformanceOverview,
  getTestAttempts,
  getProgressOverTime,
  getTestComparison,
  clearDashboardError,
} from "../slices/dashboardSlice";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const dispatch = useDispatch();

  // Get user from Redux store
  const { user } = useSelector((state) => state.auth);

  // Get dashboard data from Redux store
  const {
    performanceOverview,
    testAttempts,
    progressOverTime,
    testComparison,
    loading,
    error,
  } = useSelector((state) => state.dashboard);

  // Load dashboard data only for students
  const loadDashboardData = async () => {
    if (!user?.uid) {
      console.warn("⚠️ No user ID found, skipping dashboard load");
      return;
    }

    // ✅ CHECK USER ROLE - Only load for students
    if (user.role !== "student") {
      console.log("🔒 Non-student user detected, skipping dashboard load. Role:", user.role);
      return;
    }

    const uid = user.uid;
    console.log("🔵 Loading dashboard for student:", uid);

    try {
      await Promise.all([
        dispatch(getPerformanceOverview(uid)),
        dispatch(getTestAttempts({ userId: uid })),
        dispatch(getProgressOverTime({ userId: uid })),
        dispatch(getTestComparison(uid)),
      ]);
      console.log("✅ Dashboard data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading dashboard:", error);
    }
  };

  // Load dashboard when user changes (only if student)
  useEffect(() => {
    if (user?.uid && user?.role === "student") {
      console.log("👤 Student user detected, loading dashboard...");
      loadDashboardData();
    } else if (user?.uid) {
      console.log(`🔒 User role is ${user.role}, skipping dashboard load`);
    }
  }, [user?.uid, user?.role]);

  // Refresh dashboard data
  const refreshData = async () => {
    if (user?.role !== "student") {
      console.log("🔒 Cannot refresh - user is not a student");
      return;
    }
    console.log("🔄 Refreshing dashboard data...");
    await loadDashboardData();
  };

  // Clear error
  const clearError = () => {
    dispatch(clearDashboardError());
  };

  // Fetch test history
  const fetchTestHistory = async () => {
    return testAttempts || [];
  };

  // Dashboard data object
  const dashboardData = {
    performance: performanceOverview,
    attempts: testAttempts,
    progress: progressOverTime,
    comparison: testComparison,
  };

  const value = {
    dashboardData,
    performanceOverview,
    testAttempts,
    progressOverTime,
    testComparison,
    loading,
    error,
    refreshData,
    clearError,
    fetchTestHistory,
    isStudent: user?.role === "student", // ✅ Add this helper
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};