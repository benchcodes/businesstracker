export default function Sidebar({ activeView, onSelectView }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#4b3028] text-white">
      <div className="border-b border-[#6b4a3a] p-6">
        <h1 className="text-2xl font-bold">ChurroZi</h1>
        <p className="mt-1 text-sm text-gray-300">Tracker & Expenses</p>
      </div>

      <nav className="space-y-2 p-4">
        <button
          onClick={() => onSelectView("tracker")}
          className={`w-full rounded-lg px-4 py-3 text-left transition ${
            activeView === "tracker"
              ? "bg-[#d8a66b] text-white"
              : "hover:bg-[#5d3c32]"
          }`}
        >
          Tracker
        </button>

        <button
          onClick={() => onSelectView("expenses")}
          className={`w-full rounded-lg px-4 py-3 text-left transition ${
            activeView === "expenses"
              ? "bg-[#d8a66b] text-white"
              : "hover:bg-[#5d3c32]"
          }`}
        >
          Expenses
        </button>

        <button
          onClick={() => onSelectView("summary")}
          className={`w-full rounded-lg px-4 py-3 text-left transition ${
            activeView === "summary"
              ? "bg-[#d8a66b] text-white"
              : "hover:bg-[#5d3c32]"
          }`}
        >
          Summary
        </button>
      </nav>
    </aside>
  );
}