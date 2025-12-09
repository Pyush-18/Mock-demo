import { CheckCircle, Target, XCircle, Calendar, Clock, Award, ArrowLeft, Percent } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getTestAttemptById } from "../slices/dashboardSlice";
import Paginator from "../ui/Paginator";

const TestAnalysis = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const dispatch = useDispatch();
  
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  
  const { currentAttempt, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (attemptId) {
      dispatch(getTestAttemptById(attemptId));
    }
  }, [attemptId, dispatch]);

  if (loading || !currentAttempt) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-emerald-400 text-lg font-medium">Loading Analysis...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil((currentAttempt.questions?.length || 0) / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = currentAttempt.questions?.slice(startIndex, endIndex) || [];

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (score >= 60) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    return "bg-red-500/20 text-red-300 border-red-500/30";
  };

  const getPerformanceText = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    return "Needs Improvement";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-black text-slate-200">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-bold text-3xl shadow-lg shadow-emerald-500/30">
                <Percent size={25} />
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {currentAttempt.testName}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`px-3 py-1 border rounded-full text-sm font-medium ${getScoreBadge(currentAttempt.score)}`}>
                    {getPerformanceText(currentAttempt.score)}
                  </span>
                  <span className="text-sm text-slate-400">
                    {currentAttempt.correctAnswers}/{currentAttempt.totalQuestions} Correct Answers
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(currentAttempt.score)} drop-shadow-lg`}>
                  {currentAttempt.score}%
                </div>
                <div className="text-sm text-slate-500 mt-1">Final Score</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-emerald-500" size={24} />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Score</span>
            </div>
            <p className={`text-3xl font-bold ${getScoreColor(currentAttempt.score)}`}>
              {currentAttempt.score}%
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-emerald-500" size={24} />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Questions</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {currentAttempt.totalQuestions}
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-emerald-500" size={24} />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Test Type</span>
            </div>
            <p className="text-lg font-bold text-white truncate">
              {currentAttempt.markingScheme}
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-emerald-500" size={24} />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Completed</span>
            </div>
            <p className="text-sm font-bold text-white">
              {formatDate(currentAttempt.startedAt)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Detailed Analysis</h2>
            <span className="text-sm text-slate-400">
              Showing {startIndex + 1}-{Math.min(endIndex, currentAttempt.questions?.length || 0)} of {currentAttempt.questions?.length || 0}
            </span>
          </div>

          <div className="space-y-6">
            {currentQuestions.map((question, index) => {
              const globalIndex = startIndex + index;
              return (
                <motion.div
                  key={globalIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-slate-900/40 border rounded-2xl p-6 backdrop-blur-sm transition-all hover:shadow-lg ${
                    question.isCorrect
                      ? "border-emerald-500/20 hover:border-emerald-500/40"
                      : "border-red-500/20 hover:border-red-500/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4 mb-5">
                    <div className="flex-1">
                      <span className="text-emerald-500 font-mono text-sm mb-2 block">
                        QUESTION {String(globalIndex + 1).padStart(2, "0")}
                      </span>
                      <p className="text-slate-200 font-medium leading-relaxed text-lg">
                        {question.questionText}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full border text-sm font-semibold flex items-center gap-2 whitespace-nowrap ${
                        question.isCorrect
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {question.isCorrect ? (
                        <>
                          <CheckCircle size={16} /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle size={16} /> Wrong
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className={`p-4 rounded-xl border transition-all ${
                      question.isCorrect 
                        ? "bg-emerald-500/5 border-emerald-500/20" 
                        : "bg-red-500/5 border-red-500/20"
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                            Your Answer
                          </p>
                          <p className={`text-base font-medium ${
                            question.isCorrect ? "text-emerald-300" : "text-red-300"
                          }`}>
                            {question.selectedAnswer || "Not Answered"}
                          </p>
                        </div>
                        {!question.isCorrect && (
                          <XCircle size={20} className="text-red-400 mt-1" />
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs text-emerald-400/80 mb-2 uppercase tracking-wider font-semibold">
                            Correct Answer
                          </p>
                          <p className="text-base font-medium text-emerald-300">
                            {question.correctAnswer}
                          </p>
                        </div>
                        <CheckCircle size={20} className="text-emerald-400 mt-1" />
                      </div>
                    </div>
                  </div>

                  {question.explanation && (
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">
                        Explanation
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {question.explanation || "No explanation provided"}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="mt-8">
              <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={currentAttempt.questions?.length || 0}
                itemsPerPage={questionsPerPage}
                onPageChange={setCurrentPage}
                maxVisiblePages={5}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TestAnalysis;