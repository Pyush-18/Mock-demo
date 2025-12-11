import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

// ✅ Get all tests that have attempts (for leaderboard test list)
export const getAllTestAttempts = createAsyncThunk(
  "attempt/getAllTestAttempts",
  async (_, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      // Get user data
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) throw new Error("User not found");

      const userData = userDoc.data();
      const userRole = userData.role;

      console.log("👤 Current user role:", userRole);

      // Determine which tests the user can see
      let allowedCreatorId = null;

      if (userRole === "student") {
        // Students see tests from their admin
        allowedCreatorId = userData.createdBy;
        console.log("📚 Student viewing admin's tests:", allowedCreatorId);
      } else if (userRole === "admin") {
        // Admins see their own tests
        allowedCreatorId = userId;
        console.log("👨‍💼 Admin viewing own tests");
      } else if (userRole === "superadmin") {
        // Superadmin sees all tests
        console.log("🔑 Superadmin viewing all tests");
      }

      // Get question papers based on role
      const questionsRef = collection(db, "questions");
      let questionsQuery;

      if (userRole === "superadmin") {
        questionsQuery = query(questionsRef);
      } else if (allowedCreatorId) {
        questionsQuery = query(
          questionsRef,
          where("createdBy", "==", allowedCreatorId)
        );
      } else {
        console.log("❌ No creator ID found for student");
        return [];
      }

      const questionsSnapshot = await getDocs(questionsQuery);

      if (questionsSnapshot.empty) {
        console.log("📊 No tests found for this user");
        return [];
      }

      // Get test IDs
      const testIds = [];
      const testsData = {};
      questionsSnapshot.forEach((doc) => {
        testIds.push(doc.id);
        testsData[doc.id] = doc.data();
      });

      console.log("📊 Found", testIds.length, "tests");

      if (testIds.length === 0) {
        return [];
      }

      // Get all attempts for these tests
      const batchSize = 10;
      const allTests = [];

      for (let i = 0; i < testIds.length; i += batchSize) {
        const batch = testIds.slice(i, i + batchSize);

        const attemptsRef = collection(db, "testAttempts");
        const attemptsQuery = query(
          attemptsRef,
          where("testId", "in", batch),
          where("submittedAt", "!=", null),
          orderBy("submittedAt", "desc")
        );

        const attemptsSnapshot = await getDocs(attemptsQuery);

        // Group attempts by testId
        const testAttemptsMap = {};

        for (const docSnapshot of attemptsSnapshot.docs) {
          const attemptData = docSnapshot.data();
          const testId = attemptData.testId;

          if (!testAttemptsMap[testId]) {
            testAttemptsMap[testId] = [];
          }

          testAttemptsMap[testId].push({
            id: docSnapshot.id,
            ...attemptData,
            submittedAt: attemptData.submittedAt?.toDate(),
          });
        }

        // Create test objects with attempt info
        batch.forEach((testId) => {
          const testData = testsData[testId];
          const attempts = testAttemptsMap[testId] || [];

          // Check if current user has attempted
          const userHasAttempted = attempts.some(
            (attempt) => attempt.userId === userId
          );

          allTests.push({
            testId: testId,
            testName: testData.testName || "Unnamed Test",
            categoryName: testData.categoryName,
            subject: testData.subject,
            subcategory: testData.subcategory,
            hasAttempts: attempts.length > 0,
            totalParticipants: attempts.length,
            userHasAttempted: userHasAttempted,
          });
        });
      }

      console.log("✅ Processed", allTests.length, "tests for leaderboard");
      return allTests;
    } catch (error) {
      console.error("❌ Error fetching test attempts:", error);
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Get leaderboard data for a specific test
export const getAttemptsByTest = createAsyncThunk(
  "attempt/getAttemptsByTest",
  async (testId, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      console.log("🎯 Fetching leaderboard for test:", testId);

      // Verify the test exists and user has access
      const testDoc = await getDoc(doc(db, "questions", testId));
      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }

      const testData = testDoc.data();

      // Check user permissions
      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.data();
      const userRole = userData.role;

      // Verify access
      if (userRole === "student" && userData.createdBy) {
        if (testData.createdBy !== userData.createdBy) {
          throw new Error("You don't have access to this test");
        }
      } else if (userRole === "admin") {
        if (testData.createdBy !== userId) {
          throw new Error("You can only view leaderboards for your tests");
        }
      }

      // Get all attempts for this test
      const attemptsRef = collection(db, "testAttempts");
      const q = query(
        attemptsRef,
        where("testId", "==", testId),
        where("submittedAt", "!=", null),
        orderBy("submittedAt", "desc") // ✅ Required when using != null
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("📊 No attempts found for test:", testId);
        return { data: [] };
      }

      const attempts = [];

      for (const docSnapshot of querySnapshot.docs) {
        const attemptData = docSnapshot.data();

        // Get user details
        let userName = "Unknown";
        let userEmail = "N/A";
        let attemptUserId = attemptData.userId;

        if (attemptUserId) {
          const studentDoc = await getDoc(doc(db, "users", attemptUserId));
          if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            userName = studentData.name || "Unknown";
            userEmail = studentData.email || "N/A";
          }
        }

        attempts.push({
          id: docSnapshot.id,
          score: attemptData.score || 0,
          submittedAt: attemptData.submittedAt?.toDate(),
          user: {
            _id: attemptUserId, // ✅ This matches your LeaderboardContext expectation
            name: userName,
            email: userEmail,
          },
        });
      }

      // ✅ Sort by score in descending order (highest first) in memory
      attempts.sort((a, b) => b.score - a.score);

      console.log("✅ Found", attempts.length, "attempts for leaderboard");
      console.log("👤 Current user ID:", userId);
      console.log(
        "📊 Sample attempt user IDs:",
        attempts.slice(0, 3).map((a) => a.user._id)
      );

      return { data: attempts };
    } catch (error) {
      console.error("❌ Error fetching test leaderboard:", error);
      return rejectWithValue(error.message);
    }
  }
);

// ✅ Get attempts for admin dashboard (different from leaderboard)
export const getTestAttemptsByAdmin = createAsyncThunk(
  "attempt/getTestAttemptsByAdmin",
  async (testId, { rejectWithValue }) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      // Verify the test belongs to this admin
      const testDoc = await getDoc(doc(db, "questions", testId));
      if (!testDoc.exists()) {
        throw new Error("Test not found");
      }

      const testData = testDoc.data();

      // Check if user is superadmin or the test creator
      const userDoc = await getDoc(doc(db, "users", userId));
      const userRole = userDoc.data()?.role;

      if (userRole !== "superadmin" && testData.createdBy !== userId) {
        throw new Error("You don't have permission to view these attempts");
      }

      const attemptsRef = collection(db, "testAttempts");
      const q = query(
        attemptsRef,
        where("testId", "==", testId),
        where("submittedAt", "!=", null),
        orderBy("submittedAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      const attempts = [];
      for (const docSnapshot of querySnapshot.docs) {
        const attemptData = docSnapshot.data();

        let userName = "Unknown";
        let userEmail = "N/A";
        if (attemptData.userId) {
          try {
            const studentDoc = await getDoc(
              doc(db, "users", attemptData.userId)
            );
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              userName =
                studentData.name || studentData.displayName || "Unknown";
              userEmail = studentData.email || "N/A";
            }
          } catch (error) {
            console.error(`Error fetching user ${attemptData.userId}:`, error);
          }
        }

        attempts.push({
          id: docSnapshot.id,
          ...attemptData,
          userName,
          userEmail,
          submittedAt: attemptData.submittedAt?.toDate(),
        });
      }

      return attempts;
    } catch (error) {
      console.error("❌ Error fetching admin attempts:", error);
      return rejectWithValue(error.message);
    }
  }
);

const attemptSlice = createSlice({
  name: "attempt",
  initialState: {
    attemptedTests: [], // ✅ For leaderboard test list
    leaderboardData: [], // ✅ For specific test leaderboard
    testAttempts: [], // ✅ For admin dashboard
    loading: false,
    error: null,
  },
  reducers: {
    clearAttempts: (state) => {
      state.attemptedTests = [];
      state.leaderboardData = [];
      state.testAttempts = [];
    },
    resetTestAttempts: (state) => {
      state.testAttempts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all test attempts (for leaderboard test list)
      .addCase(getAllTestAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTestAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.attemptedTests = action.payload;
      })
      .addCase(getAllTestAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.attemptedTests = [];
      })

      // Get attempts by test (for leaderboard)
      .addCase(getAttemptsByTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAttemptsByTest.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboardData = action.payload.data;
      })
      .addCase(getAttemptsByTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.leaderboardData = [];
      })

      // Get test attempts by admin (for admin dashboard)
      .addCase(getTestAttemptsByAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTestAttemptsByAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.testAttempts = action.payload;
      })
      .addCase(getTestAttemptsByAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.testAttempts = [];
      });
  },
});

export const { clearAttempts, resetTestAttempts } = attemptSlice.actions;
export default attemptSlice.reducer;
