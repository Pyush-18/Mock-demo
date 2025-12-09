import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { doc, onSnapshot } from "firebase/firestore"; // ✅ Changed from getDoc to onSnapshot
import { db } from "../../config/firebase";
import InstructionModal from "./InstructionModal";
import { isSubscriptionActive } from "../../../utils/subscriptionHelpers";
import {
  startTest,
  clearTests,
  getAllTests,
} from "../../slices/testSlice";
import { LockIcon } from "lucide-react";

const GetAllTest = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const {
    tests,
    allTestsLoading,
    loading: testStarting,
  } = useSelector((state) => state.test);

  const [starting, setStarting] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [realtimeUserData, setRealtimeUserData] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

  // ✅ Load tests on mount
  useEffect(() => {
    dispatch(getAllTests());
  
    return () => {
      dispatch(clearTests());
    };
  }, [dispatch, user?.uid]);

  // ✅ Set up real-time listener for user data changes
  useEffect(() => {
    if (!user?.uid) {
      setRealtimeUserData(null);
      return;
    }

    console.log("🔄 Setting up real-time listener for user:", user.uid);
    setCheckingSubscription(true);

    // ✅ Real-time listener using onSnapshot
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          console.log("✅ Real-time user data updated:", {
            subscription: userData.subscription,
            timestamp: new Date().toISOString()
          });
          setRealtimeUserData(userData);
          setCheckingSubscription(false);
        } else {
          console.log("⚠️ User document not found");
          setRealtimeUserData(null);
          setCheckingSubscription(false);
        }
      },
      (error) => {
        console.error("❌ Error in real-time listener:", error);
        setCheckingSubscription(false);
      }
    );

    // ✅ Cleanup listener on unmount
    return () => {
      console.log("🧹 Cleaning up real-time listener");
      unsubscribe();
    };
  }, [user?.uid]);

  // ✅ Check access based on real-time user data
  const checkAccess = (test) => {
    // Demo tests are always accessible
    if (test.isDemo || test.testType?.toLowerCase() === "demo") {
      return true;
    }

    if (!user) {
      return false;
    }

    // ✅ Use real-time data if available, otherwise fall back to Redux user
    const userData = realtimeUserData || user;
    
    console.log("🔍 Checking access:", {
      testName: test.testName,
      hasRealtimeData: !!realtimeUserData,
      subscription: userData.subscription,
      isArray: Array.isArray(userData.subscription),
      subscriptionLength: userData.subscription?.length || 0
    });

    if (userData.subscription && Array.isArray(userData.subscription) && userData.subscription.length > 0) {
      const activeSubscription = userData.subscription.find(sub => {
        return isSubscriptionActive(sub);
      });

      const hasAccess = !!activeSubscription;
      console.log("✅ Access check result:", {
        hasAccess,
        activeSubscription: activeSubscription ? {
          plan: activeSubscription.plan,
          status: activeSubscription.status,
          expiresAt: activeSubscription.expiresAt
        } : null
      });
      return hasAccess;
    }

    console.log("❌ No active subscription found");
    return false;
  };

  const handleStartClick = async (test) => {
    if (!user) {
      toast.error("Please log in to start the test.");
      navigate("/login");
      return;
    }

    // ✅ No need to fetch again - we already have real-time data
    console.log("🎯 Starting test with current subscription status");

    if (!checkAccess(test)) {
      toast.error("Upgrade to PRO or Premium to access this test!");
      navigate("/");
      return;
    }

    console.log("✅ Access granted. Opening instructions for:", test.testName);
    setSelectedTest(test);
    setShowInstructions(true);
  };

  const handleConfirmInstructions = async () => {
    if (!selectedTest) return;

    try {
      setStarting(selectedTest.id);
      console.log("🚀 Initializing test:", selectedTest.id);

      const result = await dispatch(startTest(selectedTest.id)).unwrap();

      if (result?.testId) {
        navigate(`/test/${result.testId}`);
      } else {
        toast.error("Failed to initialize test. Please try again.");
      }
    } catch (error) {
      console.error("❌ Start test error:", error);
      toast.error(error || "Failed to start test. Please try again.");
    } finally {
      setShowInstructions(false);
      setStarting(null);
    }
  };

  const getTypeColor = (type) => {
    const map = {
      demo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      organic: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      inorganic: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      physical: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      "full-length": "bg-purple-500/10 text-purple-400 border-purple-500/20",
      chapterwise: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    };
    return (
      map[type?.toLowerCase()] || "bg-white/5 text-gray-400 border-white/10"
    );
  };

  // ✅ Check premium access using real-time data
  const hasPremiumAccess = () => {
    const userData = realtimeUserData || user;
    if (!userData || !userData.subscription || !Array.isArray(userData.subscription)) {
      return false;
    }
    return userData.subscription.some(sub => isSubscriptionActive(sub));
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto py-12 px-6">
        <div className="text-center max-w-4xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">
              Library Live
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Next-Gen Chemistry{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-500">
              Testing
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience decentralized learning. Start with free demo tests or
            unlock the full potential with our PRO network.
          </p>

          {user && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  hasPremiumAccess()
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-gray-500"
                }`}
              ></div>
              <span className="text-gray-300">
                {hasPremiumAccess() ? "PRO Active" : "Free Tier"}
              </span>
            </div>
          )}
        </div>

        {allTestsLoading || checkingSubscription ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
            <p className="mt-6 text-emerald-400/80 font-mono text-sm tracking-widest animate-pulse">
              {checkingSubscription ? "VERIFYING ACCESS..." : "INITIALIZING..."}
            </p>
          </div>
        ) : !tests || tests.length === 0 ? (
          <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 max-w-2xl mx-auto border-dashed">
            <p className="text-2xl font-semibold text-gray-300 mb-2">
              No Data Found
            </p>
            <p className="text-gray-500">
              System could not locate tests for this category.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, i) => {
              const locked = !checkAccess(test);
              const isDemo =
                test.isDemo || test.testType?.toLowerCase() === "demo";
              const isStarting = starting === test.id;

              return (
                <motion.div
                  key={test.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {!isDemo && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-linear-to-bl from-amber-400 to-orange-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-lg">
                        PRO ACCESS
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getTypeColor(
                          test.testType
                        )}`}
                      >
                        {test.testType}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {test.testName}
                    </h2>

                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                      {test.title ||
                        test.description ||
                        "Standardized assessment protocol for chemistry evaluation."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1">
                          Questions
                        </div>
                        <div className="text-white font-mono font-semibold">
                          {test.totalQuestions ||
                            test.questions?.length ||
                            "00"}
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                        <div className="text-xs text-gray-500 mb-1">
                          Duration
                        </div>
                        <div className="text-white font-mono font-semibold">
                          {test.makeTime || test.timeLimit
                            ? `${test.makeTime || test.timeLimit}m`
                            : "--"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartClick(test)}
                    disabled={
                      locked ||
                      isStarting ||
                      testStarting
                    }
                    className={`relative w-full py-3.5 cursor-pointer rounded-xl font-bold text-sm tracking-wide transition-all duration-300 overflow-hidden ${
                      locked
                        ? "bg-white/5 text-gray-500 border border-white/5 hover:border-white/10 cursor-not-allowed"
                        : isStarting || testStarting
                        ? "bg-emerald-900/50 text-emerald-400 cursor-wait"
                        : "bg-linear-to-r from-emerald-400 to-teal-600 text-black shadow-[0_0_20px_rgba(52,211,153,0.2)] hover:shadow-[0_0_25px_rgba(52,211,153,0.4)] hover:scale-[1.02]"
                    }`}
                  >
                    {isStarting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>INITIALIZING...</span>
                      </div>
                    ) : locked ? (
                      <div className="flex items-center justify-center gap-2">
                        <span>LOCKED</span>
                        <LockIcon size={18} />
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {isDemo ? "DEPLOY DEMO" : "DEPLOY TEST"}
                      </span>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {showInstructions && (
          <InstructionModal
            test={selectedTest}
            onCancel={() => {
              setShowInstructions(false);
              setSelectedTest(null);
            }}
            onConfirm={handleConfirmInstructions}
          />
        )}
      </div>
    </div>
  );
};

export default GetAllTest;