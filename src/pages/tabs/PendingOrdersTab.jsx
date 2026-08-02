export default function PendingOrdersTab({
  isLoading,
  pendingTrackerRows,
  isSubmitting,
  onMarkComplete,
  onDeleteTracker,
  pendingTrackerTotal,
}) {
  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <h2 className="text-xl font-semibold text-[#5A3A2E]">Pending Orders</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f5f2]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Qty</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Notes</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-3" colSpan="8">
                    Loading records...
                  </td>
                </tr>
              ) : pendingTrackerRows.length > 0 ? (
                pendingTrackerRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.date || "—"}</td>
                    <td className="px-4 py-3">{row.name || "—"}</td>
                    <td className="px-4 py-3">{row.order_quantity ?? "—"}</td>
                    <td className="px-4 py-3">₱{Number(row.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold text-[#5A3A2E]">₱{(Number(row.order_quantity || 0) * Number(row.price || 0)).toFixed(2)}</td>
                    <td className="px-4 py-3">{row.notes || "—"}</td>
                    <td className="px-4 py-3">{row.status || "Pending"}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        type="button"
                        onClick={() => onMarkComplete(row.id)}
                        disabled={isSubmitting}
                        className="rounded-lg border border-green-300 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Mark Complete
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteTracker(row)}
                        disabled={isSubmitting}
                        className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-3" colSpan="8">
                    No pending orders.
                  </td>
                </tr>
              )}

              <tr className="bg-[#f8f5f2]">
                <td className="px-4 py-3 font-semibold text-[#5A3A2E]" colSpan="8">
                  Entries: {pendingTrackerRows.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <h2 className="text-xl font-semibold text-[#5A3A2E]">Pending Orders Total</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-lg font-semibold text-[#5A3A2E]">
          ₱{pendingTrackerTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
