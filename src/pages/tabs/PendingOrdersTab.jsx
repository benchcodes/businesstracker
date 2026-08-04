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
        <h2 className="text-xl font-semibold text-[#5A3A2E]">
          Pending Orders
        </h2>

        <div className="mt-4 space-y-6">
  {isLoading ? (
    <p>Loading records...</p>
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
        className="rounded-xl border border-gray-200 bg-white overflow-hidden"
      >
        <div className="bg-[#d8a66b] px-5 py-3 text-white font-bold">
          📅 {date}
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-[#f8f5f2]">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Qty</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Notes</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">{row.name}</td>

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
                  {row.status}
                </td>

                <td className="px-4 py-3 space-x-2">
                  <button
                    onClick={() => onMarkComplete(row.id)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-green-300 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50"
                  >
                    Complete
                  </button>

                  <button
                    onClick={() => onDeleteTracker(row)}
                    disabled={isSubmitting}
                    className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            <tr className="bg-[#f8f5f2]">
              <td colSpan="7" className="px-4 py-3 font-semibold text-right">
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
    ))
  ) : (
    <p>No pending orders.</p>
  )}
</div>

      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
        <h2 className="text-xl font-semibold text-[#5A3A2E]">
          Pending Orders Total
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-lg font-semibold text-[#5A3A2E]">
          ₱{pendingTrackerTotal.toFixed(2)}
        </div>
      </div>
    </div>
  );
}