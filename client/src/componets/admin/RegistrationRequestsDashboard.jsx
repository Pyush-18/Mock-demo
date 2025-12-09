import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from "../../slices/adminSlice";
import { CheckCircle, XCircle, Clock, Mail, User, Calendar, Loader2, Sparkles, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { formatDate } from "../../../utils/formatDate";
const RegistrationRequestsDashboard = () => {
  const dispatch = useDispatch();
  const { registrationRequests, loading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState("all");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [animatingRequests, setAnimatingRequests] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  useEffect(() => {
    const fetchRequests = async () => {
      if (user?.uid) {
        try {
          await dispatch(getRegistrationRequests(user.uid)).unwrap();
        } catch (error) {
          toast.error("Failed to load registration requests");
        } finally {
          setInitialLoading(false);
        }
      } else {
        setInitialLoading(false);
      }
    };
    fetchRequests();
  }, [dispatch, user?.uid]);
  const handleApprove = async (requestId) => {
    setAnimatingRequests(prev => ({ ...prev, [requestId]: 'approving' }));
    try {
      await dispatch(approveRegistrationRequest(requestId)).unwrap();
      setAnimatingRequests(prev => ({ ...prev, [requestId]: 'approved' }));
      toast.success("✨ Registration approved successfully!", {
        icon: "✅",
        style: {
          borderRadius: '12px',
          background: '#10b981',
          color: '#fff',
        },
      });
      setTimeout(() => {
        setAnimatingRequests(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
        dispatch(getRegistrationRequests(user.uid));
      }, 1000);
    } catch (error) {
      setAnimatingRequests(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
      const errorMessage = typeof error === 'string' ? error : error?.message || "Failed to approve request";
      toast.error(errorMessage);
    }
  };
  const handleReject = async () => {
    if (!selectedRequest) return;
    setAnimatingRequests(prev => ({ ...prev, [selectedRequest.id]: 'rejecting' }));
    try {
      await dispatch(
        rejectRegistrationRequest({
          requestId: selectedRequest.id,
          reason: rejectionReason,
        })
      ).unwrap();
      setAnimatingRequests(prev => ({ ...prev, [selectedRequest.id]: 'rejected' }));
      toast.success("Registration request rejected", {
        icon: "❌",
        style: {
          borderRadius: '12px',
          background: '#ef4444',
          color: '#fff',
        },
      });
      setRejectModalOpen(false);
      setRejectionReason("");
      setTimeout(() => {
        setAnimatingRequests(prev => {
          const newState = { ...prev };
          delete newState[selectedRequest.id];
          return newState;
        });
        setSelectedRequest(null);
        dispatch(getRegistrationRequests(user.uid));
      }, 1000);
    } catch (error) {
      setAnimatingRequests(prev => {
        const newState = { ...prev };
        delete newState[selectedRequest.id];
        return newState;
      });
      const errorMessage = typeof error === 'string' ? error : error?.message || "Failed to reject request";
      toast.error(errorMessage);
    }
  };
  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };
  const filteredRequests = registrationRequests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, itemsPerPage]);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, maxVisible);
    } else if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - maxVisible + 1);
    }
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("ellipsis-start");
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("ellipsis-end");
      pages.push(totalPages);
    }
    return pages;
  };
  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      approved: "bg-green-500/10 text-green-400 border-green-500/30",
      rejected: "bg-red-500/10 text-red-400 border-red-500/30",
    };
    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = {
    total: registrationRequests.length,
    pending: registrationRequests.filter((r) => r.status === "pending").length,
    approved: registrationRequests.filter((r) => r.status === "approved").length,
    rejected: registrationRequests.filter((r) => r.status === "rejected").length,
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };
  if (initialLoading) {
    return (
      <div className="min-h-screen rounded-2xl text-white bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505] to-[#050505] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading registration requests...</p>
        </div>
      </div>
    );
  }
  if (!user || !user.uid) {
    return (
      <div className="min-h-screen rounded-2xl text-white bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505] to-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: User not authenticated</p>
          <p className="text-gray-400">Please log in again</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen rounded-2xl text-white bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505] to-[#050505]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {}
        <motion.div variants={itemVariants} className="mb-10 relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400">
            Registration Requests
          </h2>
          <p className="text-gray-400 mt-2 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-500" />
            Manage student verification protocols
          </p>
        </motion.div>
        {}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { title: "Total Requests", value: stats.total, icon: <Mail className="text-blue-400" size={24} />, color: "from-blue-500/20 to-blue-500/5", border: "group-hover:border-blue-500/50" },
            { title: "Pending", value: stats.pending, icon: <Clock className="text-yellow-400" size={24} />, color: "from-yellow-500/20 to-yellow-500/5", border: "group-hover:border-yellow-500/50" },
            { title: "Approved", value: stats.approved, icon: <CheckCircle className="text-green-400" size={24} />, color: "from-green-500/20 to-green-500/5", border: "group-hover:border-green-500/50" },
            { title: "Rejected", value: stats.rejected, icon: <XCircle className="text-red-400" size={24} />, color: "from-red-500/20 to-red-500/5", border: "group-hover:border-red-500/50" },
          ].map((stat, index) => (
            <div
              key={index}
              className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl transition-all duration-300 hover:bg-white/[0.07] hover:transform hover:-translate-y-1 ${stat.border}`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${stat.color} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white mt-2 font-mono tracking-tight">
                    {stat.value}
                  </h3>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
        {}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === tab
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab !== "all" && (
                  <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                    {stats[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>
          {}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Filter size={16} />
              Per page:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </motion.div>
        {}
        <motion.div variants={itemVariants}>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10 text-center">
              <Mail className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-gray-400 text-lg mb-2">No {filter !== "all" ? filter : ""} requests found</p>
              <p className="text-gray-600 text-sm">
                Students will appear here once they submit registration requests
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                <AnimatePresence mode="popLayout">
                  {currentRequests.map((request) => {
                    const animationState = animatingRequests[request.id];
                    return (
                      <motion.div
                        key={request.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          scale: animationState ? 0.98 : 1,
                          backgroundColor: animationState === 'approved' ? 'rgba(16, 185, 129, 0.1)' :
                                          animationState === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                          'rgba(255, 255, 255, 0.05)'
                        }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/[0.07] transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                  <User className="text-emerald-400" size={20} />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-white">{request.name}</h3>
                                  <p className="text-gray-400 text-sm flex items-center gap-1.5">
                                    <Mail size={14} />
                                    {request.email}
                                  </p>
                                </div>
                              </div>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {formatDate(request.createdAt)}
                              </span>
                              <span className="px-3 py-1 bg-black/40 rounded-lg font-mono text-emerald-400 border border-emerald-500/20">
                                {request.registrationCode}
                              </span>
                            </div>
                            {request.status === "rejected" && request.rejectionReason && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                              >
                                <p className="text-sm text-red-400">
                                  <strong>Reason:</strong> {request.rejectionReason}
                                </p>
                              </motion.div>
                            )}
                            {request.status === "approved" && request.approvedAt && (
                              <div className="text-sm text-green-400">
                                ✓ Approved: {formatDate(request.approvedAt)}
                              </div>
                            )}
                          </div>
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleApprove(request.id)}
                                disabled={!!animatingRequests[request.id]}
                                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {animatingRequests[request.id] === 'approving' ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openRejectModal(request)}
                                disabled={!!animatingRequests[request.id]}
                                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {animatingRequests[request.id] === 'rejecting' ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <XCircle size={16} />
                                )}
                                Reject
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              {}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="text-gray-400 text-sm">
                    Showing <span className="text-emerald-400 font-semibold">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="text-emerald-400 font-semibold">{Math.min(indexOfLastItem, filteredRequests.length)}</span> of{" "}
                    <span className="text-white font-semibold">{filteredRequests.length}</span> requests
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === 1
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-white/5 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10"
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => {
                        if (typeof page === "string" && page.startsWith("ellipsis")) {
                          return (
                            <span key={page} className="px-3 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return (
                          <motion.button
                            key={`page-${page}-${index}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all ${
                              page === currentPage
                                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                            }`}
                          >
                            {page}
                          </motion.button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === totalPages
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-white/5 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
      {}
      <AnimatePresence>
        {rejectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={() => setRejectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-white">Reject Registration Request</h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to reject the request from{" "}
                <strong className="text-white">{selectedRequest?.name}</strong>?
              </p>
              <div className="mb-6">
                <label className="block text-gray-300 text-sm mb-2 font-medium">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Invalid credentials, not affiliated with institute..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectionReason("");
                    setSelectedRequest(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30"
                >
                  Reject Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default RegistrationRequestsDashboard;