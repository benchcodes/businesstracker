export default function Sidebar({ activeView, onSelectView, isOpen = false, onClose }) {
  return (
    <>
      {/* overlay for mobile when open */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden transition-opacity duration-200"
            onClick={onClose}
            aria-hidden
          />
        )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#4b3028] text-white transform transition-transform duration-200 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        role="dialog"
        aria-modal={isOpen}
      >
        <div className="border-b border-[#6b4a3a] p-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">ChurroZi</h1>
            <p className="mt-1 text-sm text-gray-300">Tracker & Expenses</p>
          </div>

          {/* mobile close handled by hamburger and overlay; remove internal close button */}
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
    </>
  );
}