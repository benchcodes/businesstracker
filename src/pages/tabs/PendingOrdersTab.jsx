export default function PendingOrdersTab({
  isLoading,
  pendingTrackerRows,
  isSubmitting,
  onMarkComplete,
  onDeleteTracker,
  pendingTrackerTotal,
}) {
  return (
    <div className="space-y-6">
      {/* Pending Orders */}
      <div>
        <h2 className="text-2xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
          Pending Orders
        </h2>

        <div className="mt-4 space-y-6">
          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Loading records...
            </div>
          ) : pendingTrackerRows.length > 0 ? (
            Object.entries(
              pendingTrackerRows.reduce((groups, row) => {
                const date = row.date || "No Date";

                if (!groups[date]) groups[date] = [];
                groups[date].push(row);

                return groups;
              }, {})
            ).map(([date, orders]) => (
              <div
                key={date}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Date Header */}
                <div className="bg-[#d8a66b] px-5 py-3 font-bold text-white">
                  📅 {date}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#f8f5f2] dark:bg-gray-800">
                      <tr className="text-gray-700 dark:text-gray-200">
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Qty</th>
                        <th className="px-4 py-3 text-left">Price</th>
                        <th className="px-4 py-3 text-left">Total</th>
                        <th className="px-4 py-3 text-left">Notes</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {orders.map((row) => (
                        <tr
                          key={row.id}
                          className="text-gray-800 dark:text-gray-200"
                        >
                          <td className="px-4 py-3">
                            {row.name}
                          </td>

                          <td className="px-4 py-3">
                            {row.order_quantity}
                          </td>

                          <td className="px-4 py-3">
                            ₱{Number(row.price).toFixed(2)}
                          </td>

                          <td className="px-4 py-3 font-semibold">
                            ₱
                            {(
                              Number(row.order_quantity) *
                              Number(row.price)
                            ).toFixed(2)}
                          </td>

                          <td className="px-4 py-3">
                            {row.notes || "—"}
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                              {row.status}
                            </span>
                          </td>

                          <td className="space-x-2 px-4 py-3">
                            {/* Complete */}
                            <button
                              onClick={() => onMarkComplete(row.id)}
                              disabled={isSubmitting}
                              className="rounded-lg border border-green-300 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950"
                            >
                              Complete
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => onDeleteTracker(row)}
                              disabled={isSubmitting}
                              className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Date Total */}
                      <tr className="bg-[#f8f5f2] dark:bg-gray-800">
                        <td
                          colSpan="7"
                          className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200"
                        >
                          Date Total: ₱
                          {orders
                            .reduce(
                              (sum, row) =>
                                sum +
                                Number(row.order_quantity) *
                                  Number(row.price),
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              No pending orders.
            </div>
          )}
        </div>
      </div>

      {/* Pending Orders Total */}
      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Pending Orders Total
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-lg font-semibold text-[#5A3A2E] dark:border-gray-700 dark:bg-gray-800 dark:text-[#e8bd85]">
          ₱{pendingTrackerTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
}