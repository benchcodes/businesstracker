export default function Sidebar({
  activeView,
  onSelectView,
  isOpen = false,
  onClose,
  brand,
  userEmail,
  onSignOut,
}) {
  const handleSelect = (view) => {
    onSelectView(view);

    // Close sidebar automatically on mobile
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 transition-opacity duration-200 md:hidden"
          onClick={onClose}
          aria-hidden="true"
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
            <h1 className="text-2xl font-bold">{brand?.name || "Benzi Tracker"}</h1>

            <p className="mt-1 text-sm text-gray-300">
              Tracker & Expenses
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 p-4">
          {/* SUMMARY */}
          <button
            type="button"
            onClick={() => handleSelect("summary")}
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
            type="button"
            onClick={() => handleSelect("tracker")}
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
            type="button"
            onClick={() => handleSelect("pending")}
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
            type="button"
            onClick={() => handleSelect("expenses")}
            className={`w-full rounded-lg px-4 py-3 text-left transition ${
              activeView === "expenses"
                ? "bg-[#d8a66b] text-white"
                : "hover:bg-[#5d3c32]"
            }`}
          >
            Expenses
          </button>

          {/* INVENTORY */}
          <button
            type="button"
            onClick={() => handleSelect("inventory")}
            className={`w-full rounded-lg px-4 py-3 text-left transition ${
              activeView === "inventory"
                ? "bg-[#d8a66b] text-white"
                : "hover:bg-[#5d3c32]"
            }`}
          >
            Inventory
          </button>
        </nav>

        <div className="absolute bottom-0 w-full border-t border-[#6b4a3a] p-4">
          <p className="truncate px-2 text-xs text-gray-300" title={userEmail}>
            {userEmail}
          </p>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[#5d3c32]"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}