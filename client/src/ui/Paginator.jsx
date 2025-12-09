import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const Paginator = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  maxVisiblePages = 5,
}) => {
  const validatedCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const validatedTotalPages = Math.max(1, totalPages);

  const getPageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, validatedCurrentPage - halfVisible);
    let endPage = Math.min(validatedTotalPages, validatedCurrentPage + halfVisible);

    if (validatedCurrentPage <= halfVisible) {
      endPage = Math.min(validatedTotalPages, maxVisiblePages);
    } else if (validatedCurrentPage + halfVisible >= validatedTotalPages) {
      startPage = Math.max(1, validatedTotalPages - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("ellipsis-start");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < validatedTotalPages) {
      if (endPage < validatedTotalPages - 1) pages.push("ellipsis-end");
      pages.push(validatedTotalPages);
    }

    return pages;
  };

  const handlePageChange = (newPage) => {
    if (!onPageChange) return;
    const validPage = Math.max(1, Math.min(newPage, validatedTotalPages));
    if (validPage !== validatedCurrentPage) {
      onPageChange(validPage);
    }
  };

  const getItemsRange = () => {
    const start = (validatedCurrentPage - 1) * itemsPerPage + 1;
    const end = Math.min(validatedCurrentPage * itemsPerPage, totalItems);
    return { start, end };
  };

  const itemsRange = getItemsRange();
  const isFirstPage = validatedCurrentPage === 1;
  const isLastPage = validatedCurrentPage === validatedTotalPages;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full px-4 py-6">
      <div className="text-slate-400 text-sm">
        Showing <span className="text-teal-400 font-semibold">{itemsRange.start}</span> to{" "}
        <span className="text-teal-400 font-semibold">{itemsRange.end}</span> of{" "}
        <span className="text-white font-semibold">{totalItems}</span> tests
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={isFirstPage}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
            ${isFirstPage
              ? "bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-slate-900/40 border-slate-700 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400"
            }`}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => handlePageChange(validatedCurrentPage - 1)}
          disabled={isFirstPage}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
            ${isFirstPage
              ? "bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-slate-900/40 border-slate-700 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400"
            }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (typeof page === "string" && page.startsWith("ellipsis")) {
              return (
                <span key={page} className="w-10 h-10 flex items-center justify-center text-slate-500">
                  ...
                </span>
              );
            }

            const isActive = page === validatedCurrentPage;

            return (
              <button
                key={`page-${page}-${index}`}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all
                  ${isActive
                    ? "bg-teal-500 text-black border-2 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                    : "bg-slate-900/40 border border-slate-700 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400"
                  }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(validatedCurrentPage + 1)}
          disabled={isLastPage}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
            ${isLastPage
              ? "bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-slate-900/40 border-slate-700 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400"
            }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => handlePageChange(validatedTotalPages)}
          disabled={isLastPage}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all
            ${isLastPage
              ? "bg-slate-900/30 border-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-slate-900/40 border-slate-700 text-slate-400 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-400"
            }`}
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};



export default Paginator