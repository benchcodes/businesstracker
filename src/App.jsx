import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [activeView, setActiveView] = useState("tracker");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Mobile hamburger */}
      <button
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        className="md:hidden fixed top-4 left-4 z-50 rounded-md bg-white/90 p-2 shadow-sm"
        onClick={() => setSidebarOpen((s) => !s)}
      >
        {/* Animated hamburger -> X */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-[#4b3028]">
          <g className={`transform transition-all duration-200 ${sidebarOpen ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}>
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </g>
          <g className={`transform transition-all duration-200 ${sidebarOpen ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
          </g>
        </svg>
      </button>

      <Sidebar
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-h-screen bg-[#faf8f5] md:pl-64">
        <Dashboard activeView={activeView} />
      </main>
    </div>
  );
}