import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [activeView, setActiveView] = useState("tracker");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Apply dark mode to the whole application
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-[#111827] text-white"
          : "bg-[#faf8f5] text-gray-900"
      }`}
    >
      {/* Mobile Hamburger */}
      <button
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        className={`fixed top-4 left-4 z-50 rounded-md p-2 shadow-sm md:hidden ${
          darkMode
            ? "bg-gray-800 text-white"
            : "bg-white/90 text-gray-900"
        }`}
        onClick={() => setSidebarOpen((s) => !s)}
      >
        {/* Hamburger */}
        <div className="relative h-6 w-6">
          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-2 transform transition-all duration-200 ${
              sidebarOpen ? "rotate-45 translate-y-0" : ""
            } ${
              darkMode ? "bg-white" : "bg-gray-900"
            }`}
          />

          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 transform transition-all duration-200 ${
              sidebarOpen
                ? "opacity-0 scale-75"
                : "opacity-100 scale-100"
            } ${
              darkMode ? "bg-white" : "bg-gray-900"
            }`}
          />

          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 translate-y-2 transform transition-all duration-200 ${
              sidebarOpen ? "-rotate-45 -translate-y-0" : ""
            } ${
              darkMode ? "bg-white" : "bg-gray-900"
            }`}
          />
        </div>
      </button>

      <div className="flex min-h-screen">
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main
          className={`min-h-screen flex-1 md:pl-64 transition-colors duration-300 ${
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
