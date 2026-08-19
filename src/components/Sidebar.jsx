export default function Sidebar({
  activeView,
  onSelectView,
  isOpen = false,
  onClose,
}) {
  return (
    <>
      {/* Overlay for mobile when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-[#4b3028] text-white transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        role="dialog"
        aria-modal={isOpen}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#6b4a3a] p-6">
          <div>
            <h1 className="text-2xl font-bold">ChurroZi</h1>
            <p className="mt-1 text-sm text-gray-300">Tracker & Expenses</p>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {/* SUMMARY - TOP */}
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

          {/* TRACKER */}
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

          {/* PENDING ORDERS */}
          <button
            onClick={() => onSelectView("pending")}
            className={`w-full rounded-lg px-4 py-3 text-left transition ${
              activeView === "pending"
                ? "bg-[#d8a66b] text-white"
                : "hover:bg-[#5d3c32]"
            }`}
          >
            Pending Orders
          </button>

          {/* EXPENSES */}
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

          {/* TUITION */}
          <button
            onClick={() => onSelectView("tuition")}
            className={`w-full rounded-lg px-4 py-3 text-left transition ${
              activeView === "tuition"
                ? "bg-[#d8a66b] text-white"
                : "hover:bg-[#5d3c32]"
            }`}
          >
            Tuition Fee Target
          </button>
        </nav>
      </aside>
    </>
  );
}
