export default function SummaryTab({
  summaryRange,
  setSummaryRange,
  summaryDate,
  setSummaryDate,
  isLoading,
  completedTrackerRows,
  displayedExpenseRows,
  isSubmitting,
  onDeleteTracker,
  onDeleteExpense,
  summaryTrackerTotal,
  summaryExpensesTotal,
}) {
  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-end space-x-3">
        <div className="inline-flex rounded-lg bg-[#f3efe9] p-1">
          <button
            onClick={() => {
              setSummaryRange("overall");
              setSummaryDate("");
            }}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              summaryRange === "overall" ? "bg-[#d8a66b] text-white" : "text-[#5A3A2E]"
            }`}
          >
            Overall
          </button>
        </div>

        <div className="inline-flex items-center space-x-2">
          <input
            type="date"
            value={summaryDate}
            onChange={(e) => {
              setSummaryDate(e.target.value);
              setSummaryRange("date");
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm outline-none focus:border-[#d8a66b]"
          />
          {summaryRange === "date" && summaryDate ? (
            <button
              type="button"
              onClick={() => {
                setSummaryDate("");
                setSummaryRange("overall");
              }}
              className="text-sm text-[#5A3A2E] underline"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <h2 className="text-xl font-semibold text-[#5A3A2E]">Completed Orders</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f5f2]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Qty</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-3" colSpan="7">
                    Loading records...
                  </td>
                </tr>
              ) : completedTrackerRows.length > 0 ? (
                completedTrackerRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.date || "—"}</td>
                    <td className="px-4 py-3">{row.name || "—"}</td>
                    <td className="px-4 py-3">{row.order_quantity ?? "—"}</td>
                    <td className="px-4 py-3">₱{Number(row.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold text-[#5A3A2E]">₱{(Number(row.order_quantity || 0) * Number(row.price || 0)).toFixed(2)}</td>
                    <td className="px-4 py-3">{row.status || "Completed"}</td>
                    <td className="px-4 py-3">
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
                  <td className="px-4 py-3" colSpan="7">
                    No completed orders yet.
                  </td>
                </tr>
              )}

              <tr className="bg-[#f8f5f2]">
                <td className="px-4 py-3 font-semibold text-[#5A3A2E]" colSpan="7">
                  Entries: {completedTrackerRows.length}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <h2 className="text-xl font-semibold text-[#5A3A2E]">Expenses</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f5f2]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Price</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-3" colSpan="5">
                    Loading records...
                  </td>
                </tr>
              ) : displayedExpenseRows.length > 0 ? (
                displayedExpenseRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.date || "—"}</td>
                    <td className="px-4 py-3">{row.product || "—"}</td>
                    <td className="px-4 py-3">₱{Number(row.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 font-semibold text-[#5A3A2E]">₱{Number(row.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(row)}
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
                  <td className="px-4 py-3" colSpan="5">
                    No expense rows yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <h2 className="text-xl font-semibold text-[#5A3A2E]">Profit</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-lg font-semibold text-[#5A3A2E]">
          ₱{(summaryTrackerTotal - summaryExpensesTotal).toFixed(2)}
        </div>
      </div>
    </div>
  );
}
