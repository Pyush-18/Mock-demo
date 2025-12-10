import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModel";
import ProfileDropdown from "./ProfileDropdown";
import { useSelector } from "react-redux";
import ForgotPasswordModal from "./ForgotPasswordModal";
import { getActiveSubscription } from "../../utils/subscriptionHelpers";
const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = [
    { name: "Home", id: "hero", path: "/hero" },
    { name: "Pricing", id: "pricing", path: "/pricing" },
    { name: "About Us", id: "about", path: "/about" },
    { name: "Contact", id: "contact", path: "/contact" },
  ];
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openLogin = params.get("openLogin");
    const openSignup = params.get("openSignup");

    if (openLogin) {
      setShowLogin(true);
      setShowSignup(false);
      setShowForgot(false);
    } else if (openSignup) {
      setShowSignup(true);
      setShowLogin(false);
    }
  }, [location.search]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  const activeSubscription = getActiveSubscription(user?.subscription);
  const hasActiveSubscription = !!activeSubscription;
  const handleNavClick = (e, id, path) => {
    e.preventDefault();
    setCurrentPath(path);
    if (id === "home") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/");
      }
      return;
    }
    if (location.pathname === "/") {
      const section = document.getElementById(id);
      if (section)
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section)
          section.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  };
  return (
    <>
      <nav className="sticky top-0 left-0 w-full  backdrop-blur-lg shadow-lg z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {" "}
            <div
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center transform group-hover:rotate-3 transition-transform duration-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                <span className="text-black font-bold text-xl">C</span>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-white tracking-wide">
                  Chem<span className="text-emerald-400">T</span>
                </span>
                {hasActiveSubscription && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider bg-linear-to-r from-amber-300 to-orange-500 text-black font-bold px-2 py-0.5 rounded-full shadow-sm">
                    PRO
                  </span>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center p-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.id, item.path)}
                  className={`relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    currentPath === item.path
                      ? "text-black bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowSignup(true)}
                    className="hidden sm:block group relative px-6 py-2.5 text-sm font-bold text-black rounded-full bg-linear-to-r from-emerald-400 to-teal-500 hover:to-emerald-400 transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_25px_rgba(52,211,153,0.5)]"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <ProfileDropdown />
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 py-4 px-4 space-y-2 shadow-2xl">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={(e) => {
                    handleNavClick(e, item.id, item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-all ${
                    currentPath === item.path
                      ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {!user && (
                <div className="pt-4 space-y-3 border-t border-white/10 mt-4">
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowSignup(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-base font-bold bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Get Started — It's Free
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      {showLogin && (
        <LoginModal
          setShowLogin={setShowLogin}
          setShowSignup={setShowSignup}
          setShowForgot={setShowForgot}
          onClose={() => setShowLogin(false)}
        />
      )}
      {showSignup && (
        <SignupModal
          setShowLogin={setShowLogin}
          setShowSignup={setShowSignup}
          onClose={() => setShowSignup(false)}
        />
      )}
      {showForgot && (
        <ForgotPasswordModal
          setShowForgot={setShowForgot}
          setShowLogin={setShowLogin}
        />
      )}
    </>
  );
};
export default Navbar;
