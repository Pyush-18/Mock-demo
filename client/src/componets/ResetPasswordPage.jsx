import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearError, clearMessage } from "../slices/authSlice";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode"); 
  const mode = searchParams.get("mode"); 

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });

  
  useEffect(() => {
    if (!oobCode || mode !== "resetPassword") {
      toast.error("Invalid or expired reset link");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [oobCode, mode, navigate]);

  
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (message && message.includes("Password reset successful")) {
      toast.success(message);
      dispatch(clearMessage());
      setTimeout(() => navigate("/"), 2000);
    }
  }, [error, message, dispatch, navigate]);

  const handleChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.password !== passwords.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (passwords.password.length < 6) {
      return toast.error("Password should be at least 6 characters");
    }

    dispatch(
      resetPassword({
        oobCode,
        newPassword: passwords.password,
      })
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 via-violet-100 to-white">
      <div className="bg-white/70 backdrop-blur-lg border border-gray-200/40 shadow-2xl rounded-3xl w-[90%] sm:w-[420px] p-8 animate-fadeIn">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center bg-linear-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text mb-4">
          Reset Password
        </h2>
        <p className="text-gray-600 text-center mb-6 text-sm">
          Enter your new password below and confirm to continue.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={passwords.password}
              onChange={handleChange}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-300/60 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border border-gray-300/60 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} ChemT | All rights reserved
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
