import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";

export default function App() {
  const [activeView, setActiveView] = useState("tracker");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================
  // WELCOME PAGE
  // =========================
  const [started, setStarted] = useState(false);

  // =========================
  // DARK MODE
  // =========================
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // =========================
  // APPLY DARK MODE
  // =========================
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem(
      "darkMode",
      String(darkMode)
    );
  }, [darkMode]);

  // =========================
  // START APPLICATION
  // =========================
  const handleStart = () => {
  setStarted(true);
};

  // =========================
  // WELCOME PAGE
  // =========================
  if (!started) {
    return (
      <Welcome
        onStart={handleStart}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================
  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-[#111827] text-white"
          : "bg-[#faf8f5] text-gray-900"
      }`}
    >
      {/* =========================
          MOBILE HAMBURGER
      ========================= */}
      <button
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        className={`fixed left-4 top-4 z-50 rounded-md p-2 shadow-sm md:hidden ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white/90 text-gray-900"
        }`}
        onClick={() =>
          setSidebarOpen((s) => !s)
        }
      >
        <div className="relative h-6 w-6">
          {/* Top */}
          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-2 transform transition-all duration-200 ${
              sidebarOpen
                ? "rotate-45 translate-y-0"
                : ""
            } ${
              darkMode
                ? "bg-white"
                : "bg-gray-900"
            }`}
          />

          {/* Middle */}
          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 transform transition-all duration-200 ${
              sidebarOpen
                ? "scale-75 opacity-0"
                : "scale-100 opacity-100"
            } ${
              darkMode
                ? "bg-white"
                : "bg-gray-900"
            }`}
          />

          {/* Bottom */}
          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 translate-y-2 transform transition-all duration-200 ${
              sidebarOpen
                ? "-rotate-45 -translate-y-0"
                : ""
            } ${
              darkMode
                ? "bg-white"
                : "bg-gray-900"
            }`}
          />
        </div>
      </button>

      {/* =========================
          APP LAYOUT
      ========================= */}
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />

        {/* MAIN CONTENT */}
        <main
          className={`min-h-screen flex-1 transition-colors duration-300 md:pl-64 ${
            darkMode
              ? "bg-[#111827]"
              : "bg-[#faf8f5]"
          }`}
        >
          <Dashboard
            activeView={activeView}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </main>
      </div>
    </div>
  );
}