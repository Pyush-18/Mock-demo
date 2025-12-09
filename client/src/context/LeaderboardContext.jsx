import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getAllTestAttempts, getAttemptsByTest } from "../slices/attemptSlice";

const LeaderboardContext = createContext();

export const LeaderboardProvider = ({ children }) => {
  const dispatch = useDispatch();
  
  // ✅ Use correct selector - attemptedTests instead of attemptedTests
  const { attemptedTests, loading } = useSelector((state) => state.attempts);
  const { user } = useSelector((state) => state.auth);

  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);

  // Fetch tests with attempts
  const fetchTests = async () => {
    if (!user || !user.uid) {
      console.log("⛔ User not ready, skipping fetch");
      return;
    }

    if (user.role === "superadmin") {
      console.log("🟢 SUPERADMIN — Test fetch disabled for now");
      return;
    }

    try {
      console.log("🔄 Fetching tests for user:", user.uid, "Role:", user.role);
      const result = await dispatch(getAllTestAttempts()).unwrap();
      
      console.log("✅ Fetched tests:", result.length);
      
      setTests(result);
      
      // Auto-select first test with attempts
      const testsWithAttempts = result.filter(t => t.hasAttempts);
      if (testsWithAttempts.length > 0) {
        setSelectedTest(testsWithAttempts[0]);
        console.log("✅ Auto-selected test:", testsWithAttempts[0].testName);
      }

    } catch (err) {
      console.error("❌ Failed test fetch:", err);
      toast.error("Failed to load tests");
    }
  };

  // Fetch leaderboard for selected test
  const fetchLeaderboard = async (testId) => {
    if (!testId) {
      console.log("⚠️ No testId provided");
      return;
    }

    try {
      console.log("🎯 Fetching leaderboard for:", testId);
      
      const result = await dispatch(getAttemptsByTest(testId)).unwrap();
      
      console.log("📊 Raw leaderboard data:", result.data);

      if (!result.data || result.data.length === 0) {
        console.log("⚠️ No leaderboard data found");
        setLeaderboard([]);
        setSelectedTest((prev) => ({
          ...prev,
          totalParticipants: 0,
        }));
        return;
      }

      // Map leaderboard with ranks
      const leaderboardData = result.data.map((attempt, index) => {
        const isCurrentUser = user?.uid === attempt.user._id;
        
        console.log(`👤 Attempt ${index + 1}:`, {
          userId: attempt.user._id,
          currentUserId: user?.uid,
          isCurrentUser,
          name: attempt.user.name,
          score: attempt.score
        });

        return {
          rank: index + 1,
          userId: attempt.user._id,
          name: attempt.user.name,
          email: attempt.user.email,
          score: attempt.score,
          submittedAt: attempt.submittedAt,
          isCurrentUser: isCurrentUser,
        };
      });

      console.log("✅ Processed leaderboard:", leaderboardData.length, "entries");
      
      // Find current user in leaderboard
      const currentUserEntry = leaderboardData.find(entry => entry.isCurrentUser);
      console.log("👤 Current user entry:", currentUserEntry);

      setLeaderboard(leaderboardData);

      // Update selected test with participant count
      setSelectedTest((prev) => ({
        ...prev,
        totalParticipants: leaderboardData.length,
      }));

    } catch (error) {
      console.error("❌ Error fetching leaderboard:", error);
      toast.error("Failed to load leaderboard");
      setLeaderboard([]);
      setSelectedTest((prev) => ({
        ...prev,
        totalParticipants: 0,
      }));
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      if (user && leaderboard.length > 0) {
        const userAttempts = leaderboard.filter(
          (entry) => entry.userId === user.uid
        );

        console.log("📈 User stats - attempts:", userAttempts.length);

        setStats({
          totalAttempts: userAttempts.length,
          averageScore:
            userAttempts.length > 0
              ? userAttempts.reduce((sum, a) => sum + a.score, 0) /
                userAttempts.length
              : 0,
          bestScore:
            userAttempts.length > 0
              ? Math.max(...userAttempts.map((a) => a.score))
              : 0,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    }
  };

  // Handle test selection
  const handleTestSelect = (test) => {
    console.log("🎯 Test selected:", test.testName, "Has attempts:", test.hasAttempts);
    
    if (!test.hasAttempts) {
      toast.info(
        "No attempts found for this test. Be the first to attempt it!"
      );
      return;
    }
    setSelectedTest(test);
  };

  // Fetch tests when user is ready
  useEffect(() => {
    if (!user) {
      console.log("⏳ Waiting for user...");
      return;
    }
    if (!user.uid) {
      console.log("⏳ User ID not ready...");
      return;
    }
    if (user.role === "superadmin") {
      console.log("🔑 Superadmin - skipping test fetch");
      return;
    }

    console.log("🚀 User ready, fetching tests...");
    fetchTests();
  }, [user]);

  // Fetch leaderboard when test is selected
  useEffect(() => {
    if (selectedTest && selectedTest.hasAttempts && selectedTest.testId) {
      console.log("🔄 Fetching leaderboard for selected test:", selectedTest.testName);
      fetchLeaderboard(selectedTest.testId);
    }
  }, [selectedTest?.testId]);

  // Update stats when leaderboard changes
  useEffect(() => {
    if (leaderboard.length > 0) {
      fetchUserStats();
    }
  }, [leaderboard, user]);

  const value = {
    tests,
    selectedTest,
    leaderboard,
    stats,
    loading,
    handleTestSelect,
    refetchTests: fetchTests,
    refetchStats: fetchUserStats,
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error("useLeaderboard must be used within LeaderboardProvider");
  }
  return context;
};