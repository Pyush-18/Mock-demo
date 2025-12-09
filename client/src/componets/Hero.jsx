import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModel";

const Hero = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  const authUser = false;
  const navigate = useNavigate();

  const fullText = "Prepare Smarter for NTA Chemistry";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        setIsTypingDone(true);
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (!authUser) setShowLogin(true);
    else navigate("/");
  };

  const floatVariant = {
    animate: {
      y: [0, -12, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const floatDelayedVariant = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5,
      },
    },
  };

  const floatDelayed2Variant = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      },
    },
  };

  return (
    <section id="hero" className="relative w-full min-h-screen flex items-center bg-transparent overflow-hidden ">
      <div className="relative max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 pb-20 md:pb-24 z-10">
        {" "}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            className="space-y-8 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Premium Chemistry Prep Platform
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white tracking-tight">
              {typedText}
              <span
                className={`ml-1 inline-block h-12 w-1 align-middle ${
                  isTypingDone ? "animate-caret-blink" : "bg-emerald-400"
                }`}
                aria-hidden="true"
              />
            </h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Boost your exam performance with AI-powered question analysis,
              instant results, and adaptive review paths tailored for NTA
              aspirants.
            </motion.p>

            <motion.div
              className="grid grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { val: "12k+", label: "Questions" },
                { val: "+23%", label: "Score Boost" },
                { val: "98%", label: "Satisfaction" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-emerald-500/30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl font-bold text-white">
                    {stat.val}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full max-w-lg lg:max-w-md">
              <motion.div
                className="relative bg-[#0A0A0A]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 z-20"
                variants={floatVariant}
                animate="animate"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shrink-0 shadow-lg">
                        <span className="text-black font-bold text-lg">C</span>
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          ChemT Dashboard
                        </div>
                        <div className="text-xs text-emerald-400">
                          ● Active Session
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 text-yellow-400">
                      ⚡
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-200 text-base">
                        Today's Progress
                      </h3>
                      <span className="text-sm text-gray-500">Nov 23</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                          Questions Solved
                        </span>
                        <span className="font-semibold text-emerald-400">
                          45/50
                        </span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <motion.div
                          className="bg-linear-to-r from-emerald-400 to-teal-500 h-2 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: "90%" }}
                          transition={{ duration: 1, delay: 1 }}
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/study')}
                  >
                    Continue Learning →
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                className="hidden sm:block absolute -top-12 -right-8 lg:-right-12 bg-[#0F0F0F] border border-emerald-500/30 text-white rounded-2xl p-4 shadow-xl z-20 w-40 backdrop-blur-md"
                variants={floatDelayedVariant}
                animate="animate"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="text-2xl font-bold text-emerald-400">1.4M</div>
                <div className="text-xs mt-1 text-gray-400">Active Users</div>
              </motion.div>

              <motion.div
                className="hidden sm:block absolute -bottom-8 -left-8 lg:-left-12 bg-[#0F0F0F] border border-amber-500/30 text-white rounded-2xl p-4 shadow-xl z-30 w-36 backdrop-blur-md"
                variants={floatDelayed2Variant}
                animate="animate"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
              >
                <div className="text-4xl font-bold text-amber-400">95%</div>
                <div className="text-xs mt-1 font-medium text-gray-400">
                  Avg Success Rate
                </div>
              </motion.div>

              <motion.div
                className="hidden sm:block absolute -top-12 -left-12 lg:-left-16 bg-[#0F0F0F]/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/10 z-20 w-48"
                variants={floatVariant}
                animate="animate"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 shrink-0 shadow-lg"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-white">
                      New Chapter
                    </div>
                    <div className="text-xs text-gray-500">
                      Organic Chemistry
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
      <style>
        {`
          @keyframes caret {
            0%, 40% { background: #34d399; }
            50%, 90% { background: transparent; }
            100% { background: #34d399; }
          }
          .animate-caret-blink { 
            animation: caret 1.2s infinite; 
          }
        `}
      </style>
    </section>
  );
};

export default Hero;
