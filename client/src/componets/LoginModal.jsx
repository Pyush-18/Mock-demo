import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError, clearMessage } from "../slices/authSlice";
import { X } from "lucide-react";

const LoginModal = ({
  setShowLogin,
  setShowSignup,
  setShowForgot,
  onClose,
}) => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Login successful!");
      onClose();
      setShowLogin(false);
      setShowSignup(false);
    }
  }, [isAuthenticated, onClose, setShowLogin, setShowSignup]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message && !isAuthenticated) {
      toast.success(message);
      dispatch(clearMessage());
    }
  }, [error, message, isAuthenticated, dispatch]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.email || !formData.password) {
        toast.error("All fields are required");
        return;
      }

      const res = await dispatch(login(formData)).unwrap(); 
      console.log("login response ", res);

      if (res?.message) {
        toast.success(res.message); 
      }
    } catch (err) {
      console.log("login error", err);
      toast.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl shadow-2xl w-[95%] sm:w-[900px] overflow-hidden relative animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-[#10b981] text-2xl font-bold transition-all z-10"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="hidden md:flex md:w-1/2 bg-linear-to-br from-[#10b981]/10 to-[#059669]/5 p-12 items-center justify-center relative overflow-hidden">
            <img
              src="/login.svg"
              alt="ChemT Learning"
              className="w-full max-w-md relative z-10 drop-shadow-2xl"
            />
          </div>

          <div className="w-full md:w-1/2 p-8 sm:p-12">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#10b981] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-white font-semibold text-xl">ChemT</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-gray-400 text-sm">
                Login to continue your ChemT learning journey
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-white placeholder-gray-500 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-white placeholder-gray-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="flex justify-end">
                <span
                  className="text-sm text-[#10b981] hover:text-[#059669] cursor-pointer transition-colors"
                  onClick={() => {
                    setShowLogin(false);
                    setShowForgot(true);
                  }}
                >
                  Forgot Password?
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-3.5 rounded-lg font-semibold text-base shadow-lg shadow-[#10b981]/20 hover:shadow-[#10b981]/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{" "}
                <span
                  onClick={() => {
                    setShowLogin(false);
                    setShowSignup(true);
                  }}
                  className="text-[#10b981] font-medium cursor-pointer hover:text-[#059669] transition-colors"
                >
                  Sign up
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
