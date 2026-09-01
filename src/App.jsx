import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";

const DEFAULT_BRAND = {
  name: "ChurroZi",
  logo: "/churrozi-logo.jpg",
};

const DEFAULT_MENU = {
  "Regular Churros": [
    { label: "4 pcs - ₱49", pcs: 4, price: 49 },
    { label: "8 pcs - ₱69", pcs: 8, price: 69 },
  ],
  "Churros Bites": [{ label: "25 pcs - ₱89", pcs: 25, price: 89 }],
  "Premium Churros w/ Alcapone": [
    { label: "5 pcs - ₱69", pcs: 5, price: 69 },
    { label: "8 pcs - ₱99", pcs: 8, price: 99 },
  ],
};

const readStoredJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [activeView, setActiveView] = useState("summary");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================
  // WELCOME PAGE
  // =========================
  const [started, setStarted] = useState(false);

  // =========================
  // DARK MODE
  // Dark is DEFAULT
  // =========================
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");

    // If no preference has been saved,
    // default to dark mode.
    return savedMode === null ? true : savedMode === "true";
  });

  const [brand, setBrand] = useState(() => readStoredJson("churrozi-brand", DEFAULT_BRAND));
  const [menuConfig, setMenuConfig] = useState(() =>
    readStoredJson("churrozi-menu", DEFAULT_MENU),
  );

  // =========================
  // APPLY DARK MODE
  // TO ENTIRE WEBSITE
  // =========================
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("darkMode", String(darkMode));
    localStorage.setItem("churrozi-brand", JSON.stringify(brand));
    localStorage.setItem("churrozi-menu", JSON.stringify(menuConfig));
  }, [brand, darkMode, menuConfig]);

  // =========================
  // START WEBSITE
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
        brand={brand}
      />
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#080d18] text-white" : "bg-[#faf8f5] text-gray-900"
      }`}
    >
      {/* MOBILE HAMBURGER */}
      <button
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        className={`fixed left-4 top-4 z-50 rounded-md p-2 shadow-sm md:hidden ${
          darkMode ? "bg-gray-800 text-white" : "bg-white/90 text-gray-900"
        }`}
        onClick={() => setSidebarOpen((s) => !s)}
      >
        <div className="relative h-6 w-6">
          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-2 transform transition-all duration-200 ${
              sidebarOpen ? "rotate-45 translate-y-0" : ""
            } ${darkMode ? "bg-white" : "bg-gray-900"}`}
          />

          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 transform transition-all duration-200 ${
              sidebarOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"
            } ${darkMode ? "bg-white" : "bg-gray-900"}`}
          />

          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 translate-y-2 transform transition-all duration-200 ${
              sidebarOpen ? "-rotate-45 -translate-y-0" : ""
            } ${darkMode ? "bg-white" : "bg-gray-900"}`}
          />
        </div>
      </button>

      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          brand={brand}
        />

        {/* MAIN */}
        <main
          className={`min-h-screen flex-1 transition-colors duration-300 md:pl-64 ${
            darkMode ? "bg-[#080d18]" : "bg-[#faf8f5]"
          }`}
        >
          <Dashboard
            activeView={activeView}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            brand={brand}
            setBrand={setBrand}
            menuConfig={menuConfig}
            setMenuConfig={setMenuConfig}
          />
        </main>
      </div>
    </div>
  );
}
