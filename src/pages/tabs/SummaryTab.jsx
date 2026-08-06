import { useState } from "react";


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
  availableCapital,
}) {

  const [showSales, setShowSales] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);

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
              summaryRange === "overall"
                ? "bg-[#d8a66b] text-white"
                : "text-[#5A3A2E]"
            }`}
          >
            Overall
          </button>
        </div>
      </div>

      {/* Date Picker */}
  <div className="flex items-center gap-2">
    <input
      type="date"
      value={summaryDate}
      onChange={(e) => {
        setSummaryDate(e.target.value);
        setSummaryRange("date");
      }}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#d8a66b]"
    />

    {summaryRange === "date" && summaryDate && (
      <button
        type="button"
        onClick={() => {
          setSummaryDate("");
          setSummaryRange("overall");
        }}
        className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
      >
        Clear
      </button>
    )}
  </div>

        {/* Completed Orders */}
        <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowSales(!showSales)}
          >
            <h2 className="text-xl font-semibold text-[#5A3A2E]">
              Completed Orders
            </h2>

            <button
              type="button"
              className="text-2xl font-bold text-[#5A3A2E]"
            >
              {showSales ? "−" : "+"}
            </button>
          </div>

  {showSales && (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-[#f8f5f2]">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
              Date
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
              Name
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
              Qty
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
              Price
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
              Total
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
              Status
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
              Action
            </th>
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
                <td className="px-4 py-3">
                  {row.order_quantity ?? "—"}
                </td>

                <td className="px-4 py-3">
                  ₱{Number(row.price || 0).toFixed(2)}
                </td>

                <td className="px-4 py-3 font-semibold text-[#5A3A2E]">
                  ₱
                  {(
                    Number(row.order_quantity || 0) *
                    Number(row.price || 0)
                  ).toFixed(2)}
                </td>

                <td className="px-4 py-3">
                  {row.status || "Completed"}
                </td>

                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onDeleteTracker(row)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
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
            <td colSpan="7" className="px-4 py-3 font-semibold">
              <div className="flex justify-between">
                <span>Entries: {completedTrackerRows.length}</span>

                <span className="text-green-700">
                  Sales Total: ₱{summaryTrackerTotal.toFixed(2)}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )}
</div>

            {/* Expenses */}
      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowExpenses(!showExpenses)}
          >
            <h2 className="text-xl font-semibold text-[#5A3A2E]">
              Expenses
            </h2>

            <button
              type="button"
              className="text-2xl font-bold text-[#5A3A2E]"
            >
              {showExpenses ? "−" : "+"}
            </button>
          </div>

        {showExpenses && (
         <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8f5f2]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">
                  Action
                </th>
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

                    <td className="px-4 py-3">
                      {row.product || "—"}
                    </td>

                    <td className="px-4 py-3">
                      ₱{Number(row.price || 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 font-semibold text-[#5A3A2E]">
                      ₱{Number(row.price || 0).toFixed(2)}
                    </td>

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

              {/* Footer */}
              <tr className="bg-[#f8f5f2]">
                <td colSpan="5" className="px-4 py-3 font-semibold">
                  <div className="flex justify-between">
                    <span>
                      Entries: {displayedExpenseRows.length}
                    </span>

                    <span className="text-red-600">
                      Expenses Total: ₱
                      {summaryExpensesTotal.toFixed(2)}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Total Expenses */}
      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <h2 className="text-xl font-semibold text-[#5A3A2E]">
          Total Expenses
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-600">
              Total Expenses
            </span>

            <span className="text-2xl font-bold text-red-600">
              ₱{summaryExpensesTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>


      {/* Profit */}
      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <h2 className="text-xl font-semibold text-[#5A3A2E]">
          Net Business Profit
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-600">
              Business Profit
            </span>

            <span className="text-2xl font-bold text-green-700">
              ₱{(summaryTrackerTotal - summaryExpensesTotal).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
          <h2 className="text-xl font-semibold text-[#5A3A2E]">
            Business Capital
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-600">
                Available Capital
              </span>

              <span className="text-2xl font-bold text-blue-700">
                ₱{availableCapital.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

    </div>
  );

  
}