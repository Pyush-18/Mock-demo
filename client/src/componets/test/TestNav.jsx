import { ChevronRight } from "lucide-react";
import React from "react";

function TestNav({
  formatTime,
  handleSubmitTest,
  isSubmitting,
  currentTest,
  timeLeft,
  showPdfSidebar,
  setShowPdfSidebar,
}) {
  const testName = currentTest?.testName || "Chemistry Mock Test";

  const safeFormatTime = (seconds) => {
    if (typeof formatTime === "function") {
      return formatTime(seconds);
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <nav className="test-nav">
      <div className="nav-left">
        <h2 className="test-title">{testName}</h2>
      </div>

      <div className="nav-right">
        <div className="timer-container">
          <span className="timer-label">Time Remaining</span>
          <span className={`timer ${timeLeft < 300 ? "timer-warning" : ""}`}>
            {safeFormatTime(timeLeft)}
          </span>
        </div>

        <button
          className="submit-test-btn"
          onClick={handleSubmitTest}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Submit Test"}
        </button>

        <button
          onClick={() => setShowPdfSidebar(!showPdfSidebar)}
          className="pdf-toggle-btn"
          title="View Questions PDF"
        >
          <ChevronRight
            className="pdf-toggle-icon"
            style={{
              transform: showPdfSidebar ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </button>
      </div>
    </nav>
  );
}

export default TestNav;
