import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Target,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getTestHistory } from "../../slices/dashboardSlice";
import Paginator from "../../ui/Paginator";
import { useNavigate } from "react-router";

const TestHistory = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const testsPerPage = 2;
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { testHistory, loading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    if (user?.uid) {
      fetchTestHistory();
    }
  }, [user]);

  const fetchTestHistory = () => {
    if (user?.uid) {
      dispatch(getTestHistory({ userId: user.uid, testType: "all" }));
    }
  };

  const stats = {
    totalTests: testHistory?.length || 0,
    averageScore:
      testHistory && testHistory.length > 0
        ? Math.round(
            testHistory.reduce((acc, test) => acc + test.score, 0) /
              testHistory.length
          )
        : 0,
    bestScore:
      testHistory && testHistory.length > 0
        ? Math.max(...testHistory.map((test) => test.score))
        : 0,
  };

  const totalPages = Math.ceil((testHistory?.length || 0) / testsPerPage);
  const startIndex = (currentPage - 1) * testsPerPage;
  const endIndex = startIndex + testsPerPage;
  const currentTests = testHistory?.slice(startIndex, endIndex) || [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (startedAt, submittedAt) => {
    if (!submittedAt) return "Not completed";

    const start = startedAt.toDate ? startedAt.toDate() : new Date(startedAt);
    const end = submittedAt.toDate
      ? submittedAt.toDate()
      : new Date(submittedAt);
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadgeStyles = (score) => {
    if (score >= 80)
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score >= 60)
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  const getPerformanceText = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4 shadow-[0_0_15px_rgba(45,212,191,0.5)]"></div>
          <p className="text-teal-400 text-lg font-medium tracking-wide animate-pulse">
            Loading Test History...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center bg-slate-900/50 border border-red-500/30 p-8 rounded-2xl backdrop-blur-sm max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            Connection Interrupted
          </h3>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchTestHistory}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-red-600 to-red-800 text-white px-6 py-3 rounded-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all duration-200 mx-auto w-full font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black rounded-2xl text-slate-200 font-sans selection:bg-teal-500/30 flex flex-col">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 lg:py-12 w-full flex flex-col flex-1">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800/60 pb-8">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-slate-400 tracking-tight">
              Test History
            </h1>
            <p className="text-teal-400/80 mt-3 text-lg font-light tracking-wide">
              Analyze your performance metrics and decentralized learning
              progress.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            <div className="text-center px-4 border-r border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Tests
              </p>
              <p className="text-xl font-bold text-white">{stats.totalTests}</p>
            </div>
            <div className="text-center px-4 border-r border-slate-700/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Avg Score
              </p>
              <p
                className={`text-xl font-bold ${getScoreColor(
                  stats.averageScore
                )}`}
              >
                {stats.averageScore}%
              </p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Best
              </p>
              <p className="text-xl font-bold text-teal-400">
                {stats.bestScore}%
              </p>
            </div>
          </div>
        </div>

        {testHistory?.length === 0 || !testHistory ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 backdrop-blur-sm flex-1 flex items-center justify-center">
            <div>
              <div className="bg-slate-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <FileText className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                No Data Available
              </h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                Initiate your first deployment to generate performance history.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 mt-10">
            <div className="grid gap-6 flex-1">
              {currentTests.map((attempt) => (
                <div
                  key={attempt.attemptId}
                  className="group relative bg-slate-900/40 border border-slate-800 hover:border-teal-500/30 transition-all duration-300 rounded-2xl backdrop-blur-md hover:shadow-lg"
                >
                  <div className="p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-white group-hover:text-teal-400 transition-colors">
                            {attempt.testName}
                          </h3>
                          <span className="px-3 py-1 bg-linear-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-full text-xs font-medium uppercase tracking-wider">
                            {attempt.testType?.replace("_", " ") || "General"}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-teal-500" />
                            <span>{formatDate(attempt.startedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-500" />
                            <span>
                              {calculateDuration(
                                attempt.startedAt,
                                attempt.submittedAt
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-teal-500" />
                            <span>{attempt.markingScheme}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0">
                        <div className="text-right">
                          <div
                            className={`text-4xl font-bold ${getScoreColor(
                              attempt.score
                            )} drop-shadow-sm`}
                          >
                            {attempt.score}%
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            Score Efficiency
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            navigate(`/test-analysis/${attempt.attemptId}`)
                          }
                          className="h-12 w-12 flex items-center justify-center rounded-full border bg-slate-800/50 text-teal-400 border-slate-700 hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all duration-300"
                        >
                          <ChevronDown className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <span
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${getScoreBadgeStyles(
                          attempt.score
                        )}`}
                      >
                        {attempt.score >= 70 ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {getPerformanceText(attempt.score)}
                      </span>

                      {!attempt.submittedAt && (
                        <span className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Incomplete
                        </span>
                      )}

                      <span className="ml-auto text-sm text-slate-500 font-mono">
                        {attempt.correctAnswers}/{attempt.totalQuestions}{" "}
                        Correct
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={testHistory?.length || 0}
                itemsPerPage={testsPerPage}
                onPageChange={setCurrentPage}
                maxVisiblePages={7}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default TestHistory;
