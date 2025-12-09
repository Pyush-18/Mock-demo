import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  Home,
  UploadCloud,
  FileText,
  Users,
  LogOut,
  ChevronRight,
  Zap,
  FolderPlus,
  CloudCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../slices/authSlice";
import toast from "react-hot-toast";
import { motion } from "motion/react";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await dispatch(logout()).unwrap();
      navigate("/");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed. Please try again.");
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
    },
    {
      path: "/admin/upload",
      label: "Upload Questions",
      icon: <UploadCloud size={20} />,
    },
    {
      path: "/admin/papers",
      label: "Question Papers",
      icon: <FileText size={20} />,
    },
    {
      path: "/admin/attempts",
      label: "Test Attempts",
      icon: <Users size={20} />,
    },
    {
      path: "/admin/categories",
      label: "Categories",
      icon: < FolderPlus size={20} />, 
    },
    {
      path: "/admin/student-approval",
      label: "Approve/Reject Students",
      icon: < CloudCheck size={20} />, 
    }
  ];

  const sidebarVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className=" left-0 top-0 h-full w-72 text-gray-300 flex flex-col justify-between border-r border-white/5 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-64 bg-[#4FFFB0] opacity-[0.03] blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 opacity-[0.03] blur-[80px] pointer-events-none" />

      <div className="relative z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#4FFFB0] to-teal-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,255,176,0.3)]">
              <Zap size={18} className="text-black fill-black" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              ADMIN<span className="text-[#4FFFB0]">.PANEL</span>
            </h1>
          </div>

          {user && (
            <motion.div
              variants={itemVariants}
              className="mt-2 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md flex items-center gap-3 group transition-all duration-300 hover:bg-white/10 hover:border-white/10 hover:shadow-[0_0_20px_rgba(79,255,176,0.1)]"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gray-800 to-gray-700 flex items-center justify-center border border-white/10">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-[#4FFFB0] font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4FFFB0] rounded-full border border-[#020403] shadow-[0_0_8px_#4FFFB0]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:text-[#4FFFB0] transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                  {user.role === "superadmin" ? "Super Admin" : user.role}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <nav className="mt-2 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative group flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "text-[#020403] font-semibold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-linear-to-r from-[#4FFFB0] to-teal-400 rounded-xl"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-3">
                    <span
                      className={`transition-transform duration-300 ${
                        isActive ? "scale-110" : "group-hover:scale-110"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.label}</span>
                  </span>

                  {!isActive && (
                    <ChevronRight
                      size={16}
                      className="ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#4FFFB0]"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5 relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={loggingOut || loading}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut
            size={18}
            className="group-hover:text-red-400 transition-colors"
          />
          <span className="font-medium tracking-wide">
            {loggingOut ? "Disconnecting..." : "Disconnect"}
          </span>
        </motion.button>

        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
            System v2.4.0
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
