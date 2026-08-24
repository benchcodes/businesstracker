export default function SavingsTab({
  savings,
  setSavings,
  savingsRows,
  savingsTotal,
  summaryProfit,
  isLoading,
  isSubmitting,
  onSubmit,
  onDelete,
}) {
  // =====================================================
  // AVAILABLE MONEY
  //
  // Available Money = Net Profit - Total Savings
  //
  // Example:
  // Net Profit = ₱3,921
  // Total Savings = ₱1,000
  //
  // Available Money = ₱2,921
  // =====================================================

  const profit = Number(summaryProfit || 0);
  const totalSavings = Number(savingsTotal || 0);

  const availableMoney = Math.max(
    0,
    profit - totalSavings,
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="rounded-2xl bg-gradient-to-r from-[#5A3A2E] via-[#8B5E3C] to-[#D8A66B] p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">
          💰 Savings
        </h1>

        <p className="mt-2 text-amber-100">
          Set aside money from your profit without recording
          it as an expense.
        </p>
      </div>

      {/* =====================================================
          TOTAL SAVINGS
      ===================================================== */}

      <div className="rounded-2xl border border-[#d8a66b] bg-[#f8f5f2] p-6 dark:border-[#8B5E3C] dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total Savings
        </p>

        <p className="mt-2 text-4xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
          ₱{totalSavings.toFixed(2)}
        </p>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This is the total amount you have set aside for
          savings.
        </p>
      </div>

      {/* =====================================================
          AVAILABLE MONEY
      ===================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Available Money
        </p>

        <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
          ₱{availableMoney.toFixed(2)}
        </p>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Net Profit − Total Savings.
        </p>
      </div>

      {/* =====================================================
          ADD SAVINGS
      ===================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
          Add Savings
        </h2>

        <form
          onSubmit={onSubmit}
          className="mt-5 grid gap-4 md:grid-cols-2"
        >
          {/* DATE */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Date</span>

            <input
              type="date"
              value={savings.date}
              onChange={(event) =>
                setSavings((previous) => ({
                  ...previous,
                  date: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </label>

          {/* AMOUNT */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Amount to Save</span>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={savings.amount}
              onChange={(event) =>
                setSavings((previous) => ({
                  ...previous,
                  amount: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </label>

          {/* NOTES */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-2">
            <span>Notes</span>

            <textarea
              rows={3}
              placeholder="What are you saving for?"
              value={savings.notes}
              onChange={(event) =>
                setSavings((previous) => ({
                  ...previous,
                  notes: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </label>

          {/* SAVE BUTTON */}

          <button
            type="submit"
            disabled={
              isSubmitting ||
              availableMoney <= 0
            }
            className="rounded-xl bg-[#d8a66b] px-4 py-3 font-semibold text-white transition hover:bg-[#c9944d] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            {isSubmitting
              ? "Saving..."
              : availableMoney <= 0
                ? "No Available Money"
                : "Save Money"}
          </button>
        </form>
      </div>

      {/* =====================================================
          SAVINGS HISTORY
      ===================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
          Savings History
        </h2>

        {isLoading ? (
          <p className="mt-5 text-gray-500 dark:text-gray-400">
            Loading...
          </p>
        ) : savingsRows.length === 0 ? (
          <p className="mt-5 text-gray-500 dark:text-gray-400">
            No savings recorded yet.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {savingsRows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700"
              >
                {/* SAVINGS DETAILS */}

                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {row.date}
                  </p>

                  {row.notes && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {row.notes}
                    </p>
                  )}
                </div>

                {/* AMOUNT + DELETE */}

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="font-bold text-green-600 dark:text-green-400">
                    +₱
                    {Number(
                      row.amount || 0,
                    ).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onDelete(row)}
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}