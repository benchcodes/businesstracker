import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [activeView, setActiveView] = useState("tracker");

  return (
    <div className="flex">
      <Sidebar activeView={activeView} onSelectView={setActiveView} />

      <main className="ml-64 flex-1 min-h-screen bg-[#faf8f5]">
        <Dashboard activeView={activeView} />
      </main>
    </div>
  );
}