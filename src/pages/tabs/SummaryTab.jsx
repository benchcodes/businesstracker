import { useMemo, useState } from "react";

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
  pendingOrdersCount,
  completedOrdersCount,
}) {
  const [showSales, setShowSales] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);

  // Show older records toggle
  const [showOlderSales, setShowOlderSales] = useState(false);
  const [showOlderExpenses, setShowOlderExpenses] =
    useState(false);

  const netProfit =
    summaryTrackerTotal - summaryExpensesTotal;

  // =====================================================
  // LAST 10 DAYS
  // =====================================================

  const { recentSales, olderSales } = useMemo(() => {
    // If filtering by a specific date,
    // show the selected date normally.
    if (summaryRange === "date" && summaryDate) {
      return {
        recentSales: completedTrackerRows,
        olderSales: [],
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const cutoffDate = new Date(today);

    // LAST 10 DAYS
    cutoffDate.setDate(
      cutoffDate.getDate() - 9
    );

    const recent = [];
    const older = [];

    completedTrackerRows.forEach((row) => {
      if (!row.date) {
        recent.push(row);
        return;
      }

      const rowDate = new Date(
        `${row.date.slice(0, 10)}T00:00:00`
      );

      if (rowDate >= cutoffDate) {
        recent.push(row);
      } else {
        older.push(row);
      }
    });

    return {
      recentSales: recent,
      olderSales: older,
    };
  }, [
    completedTrackerRows,
    summaryRange,
    summaryDate,
  ]);

  // =====================================================
  // DISPLAYED SALES
  // =====================================================

  const displayedSalesRows = showOlderSales
    ? [...recentSales, ...olderSales]
    : recentSales;

  // =====================================================
  // RECENT / OLDER EXPENSES
  // =====================================================

  const { recentExpenses, olderExpenses } = useMemo(() => {
    // If filtering by a specific date,
    // show the selected date normally.
    if (summaryRange === "date" && summaryDate) {
      return {
        recentExpenses: displayedExpenseRows,
        olderExpenses: [],
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const cutoffDate = new Date(today);

    // LAST 10 DAYS
    cutoffDate.setDate(
      cutoffDate.getDate() - 9
    );

    const recent = [];
    const older = [];

    displayedExpenseRows.forEach((row) => {
      if (!row.date) {
        recent.push(row);
        return;
      }

      const rowDate = new Date(
        `${row.date.slice(0, 10)}T00:00:00`
      );

      if (rowDate >= cutoffDate) {
        recent.push(row);
      } else {
        older.push(row);
      }
    });

    return {
      recentExpenses: recent,
      olderExpenses: older,
    };
  }, [
    displayedExpenseRows,
    summaryRange,
    summaryDate,
  ]);

  // =====================================================
  // DISPLAYED EXPENSES
  // =====================================================

  const displayedExpenses = showOlderExpenses
    ? [...recentExpenses, ...olderExpenses]
    : recentExpenses;

  return (
    <div className="space-y-6">

      {/* ================= DASHBOARD CARDS ================= */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {/* Total Sales */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm dark:border-green-800 dark:bg-green-950">

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Total Sales
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-700 dark:text-green-400">
            ₱{summaryTrackerTotal.toFixed(2)}
          </h2>

        </div>

        {/* Total Expenses */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm dark:border-red-800 dark:bg-red-950">

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Total Expenses
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-700 dark:text-red-400">
            ₱{summaryExpensesTotal.toFixed(2)}
          </h2>

        </div>

        {/* Net Profit */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-blue-800 dark:bg-blue-950">

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Net Profit
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-400">
            ₱{netProfit.toFixed(2)}
          </h2>

        </div>

        {/* Pending Orders */}
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm dark:border-yellow-800 dark:bg-yellow-950">

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Pending Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold text-yellow-700 dark:text-yellow-400">
            {pendingOrdersCount}
          </h2>

        </div>

        {/* Completed Orders */}
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 shadow-sm dark:border-purple-800 dark:bg-purple-950">

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Completed Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold text-purple-700 dark:text-purple-400">
            {completedOrdersCount}
          </h2>

        </div>

        {/* Business Capital */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm dark:border-cyan-800 dark:bg-cyan-950">

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Business Capital
          </p>

          <h2 className="mt-2 text-3xl font-bold text-cyan-700 dark:text-cyan-400">
            ₱{availableCapital.toFixed(2)}
          </h2>

        </div>

      </div>

      {/* ================= FILTER ================= */}

      <div className="flex flex-wrap items-center justify-end gap-3">

        <div className="inline-flex rounded-lg bg-[#f3efe9] p-1 dark:bg-gray-800">

          <button
            type="button"
            onClick={() => {
              setSummaryRange("overall");
              setSummaryDate("");
            }}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              summaryRange === "overall"
                ? "bg-[#d8a66b] text-white"
                : "text-[#5A3A2E] hover:bg-white dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Overall
          </button>

          <button
            type="button"
            onClick={() =>
              setSummaryRange("date")
            }
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              summaryRange === "date"
                ? "bg-[#d8a66b] text-white"
                : "text-[#5A3A2E] hover:bg-white dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            By Date
          </button>

        </div>

        {summaryRange === "date" && (
          <input
            type="date"
            value={summaryDate}
            onChange={(e) =>
              setSummaryDate(e.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        )}

        {summaryRange === "date" &&
          summaryDate && (
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

      {/* ================= COMPLETED ORDERS ================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">

        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() =>
            setShowSales(!showSales)
          }
        >

          <div>

            <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
              Completed Orders
            </h2>

            {summaryRange === "overall" && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Showing sales from the last 10 days
              </p>
            )}

          </div>

          <button
            type="button"
            className="text-2xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]"
          >
            {showSales ? "−" : "+"}
          </button>

        </div>

        {showSales && (
          <div className="mt-4">

            {/* OLD SALES */}

            {summaryRange === "overall" &&
              olderSales.length > 0 && (

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">

                  <div>

                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Older Sales Hidden
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {olderSales.length} older{" "}
                      {olderSales.length === 1
                        ? "sale"
                        : "sales"}{" "}
                      are hidden from the list.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowOlderSales(
                        (previous) => !previous
                      )
                    }
                    className="rounded-lg bg-[#d8a66b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c38f54]"
                  >
                    {showOlderSales
                      ? "Hide Older Sales"
                      : "Show Older Sales"}
                  </button>

                </div>

              )}

            {/* SALES TABLE */}

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">

              <table className="min-w-full text-sm">

                <thead className="bg-[#f3efe9] dark:bg-gray-800">

                  <tr>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Name
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Qty
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Price
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Total
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="bg-white dark:bg-gray-900">

                  {isLoading ? (

                    <tr>
                      <td
                        className="px-4 py-3 text-gray-600 dark:text-gray-300"
                        colSpan="7"
                      >
                        Loading records...
                      </td>
                    </tr>

                  ) : displayedSalesRows.length > 0 ? (

                    displayedSalesRows.map((row) => (

                      <tr
                        key={row.id}
                        className="border-t border-gray-100 dark:border-gray-700"
                      >

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.date || "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.name || "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.order_quantity ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          ₱{Number(row.price || 0).toFixed(2)}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
                          ₱
                          {(
                            Number(row.order_quantity || 0) *
                            Number(row.price || 0)
                          ).toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.status || "Completed"}
                        </td>

                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              onDeleteTracker(row)
                            }
                            disabled={isSubmitting}
                            className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>
                      <td
                        className="px-4 py-3 text-gray-600 dark:text-gray-300"
                        colSpan="7"
                      >
                        No completed orders yet.
                      </td>
                    </tr>

                  )}

                  <tr className="bg-[#f8f5f2] dark:bg-gray-800">

                    <td
                      colSpan="7"
                      className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300"
                    >

                      <div className="flex justify-between">

                        <span>
                          Showing:{" "}
                          {displayedSalesRows.length} entries
                        </span>

                        <span className="text-green-700 dark:text-green-400">
                          Sales Total: ₱
                          {summaryTrackerTotal.toFixed(2)}
                        </span>

                      </div>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

      {/* ================= EXPENSES ================= */}

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">

        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() =>
            setShowExpenses(!showExpenses)
          }
        >

          <div>

            <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
              Expenses
            </h2>

            {summaryRange === "overall" && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Showing expenses from the last 10 days
              </p>
            )}

          </div>

          <button
            type="button"
            className="text-2xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]"
          >
            {showExpenses ? "−" : "+"}
          </button>

        </div>

        {showExpenses && (
          <div className="mt-4">

            {/* OLD EXPENSES */}

            {summaryRange === "overall" &&
              olderExpenses.length > 0 && (

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">

                  <div>

                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Older Expenses Hidden
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {olderExpenses.length} older{" "}
                      {olderExpenses.length === 1
                        ? "expense"
                        : "expenses"}{" "}
                      are hidden from the list.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowOlderExpenses(
                        (previous) => !previous
                      )
                    }
                    className="rounded-lg bg-[#d8a66b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c38f54]"
                  >
                    {showOlderExpenses
                      ? "Hide Older Expenses"
                      : "Show Older Expenses"}
                  </button>

                </div>

              )}

            {/* EXPENSE TABLE */}

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">

              <table className="min-w-full text-sm">

                <thead className="bg-[#f3efe9] dark:bg-gray-800">

                  <tr>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Product
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Price
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Total
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E] dark:text-gray-200">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="bg-white dark:bg-gray-900">

                  {isLoading ? (

                    <tr>
                      <td
                        className="px-4 py-3 text-gray-600 dark:text-gray-300"
                        colSpan="5"
                      >
                        Loading records...
                      </td>
                    </tr>

                  ) : displayedExpenses.length > 0 ? (

                    displayedExpenses.map((row) => (

                      <tr
                        key={row.id}
                        className="border-t border-gray-100 dark:border-gray-700"
                      >

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.date || "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {row.product || "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          ₱{Number(row.price || 0).toFixed(2)}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
                          ₱{Number(row.price || 0).toFixed(2)}
                        </td>

                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              onDeleteExpense(row)
                            }
                            disabled={isSubmitting}
                            className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>
                      <td
                        className="px-4 py-3 text-gray-600 dark:text-gray-300"
                        colSpan="5"
                      >
                        No expense rows yet.
                      </td>
                    </tr>

                  )}

                  <tr className="bg-[#f8f5f2] dark:bg-gray-800">

                    <td
                      colSpan="5"
                      className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300"
                    >

                      <div className="flex justify-between">

                        <span>
                          Showing:{" "}
                          {displayedExpenses.length} entries
                        </span>

                        <span className="text-red-600 dark:text-red-400">
                          Expenses Total: ₱
                          {summaryExpensesTotal.toFixed(2)}
                        </span>

                      </div>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </div>
        )}

      </div>

      {/* ================= TOTAL EXPENSES ================= */}

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">

        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Total Expenses
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">

          <div className="flex items-center justify-between">

            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Total Expenses
            </span>

            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              ₱{summaryExpensesTotal.toFixed(2)}
            </span>

          </div>

        </div>

      </div>

      {/* ================= PROFIT ================= */}

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">

        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Net Business Profit
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">

          <div className="flex items-center justify-between">

            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Business Profit
            </span>

            <span className="text-2xl font-bold text-green-700 dark:text-green-400">
              ₱{netProfit.toFixed(2)}
            </span>

          </div>

        </div>

      </div>

      {/* ================= BUSINESS CAPITAL ================= */}

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">

        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Business Capital
        </h2>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">

          <div className="flex items-center justify-between">

            <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Available Capital
            </span>

            <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              ₱{availableCapital.toFixed(2)}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}