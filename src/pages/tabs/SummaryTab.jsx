import { useCallback, useMemo, useState } from "react";

export default function SummaryTab({
summaryRange,
setSummaryRange,
summaryDate,
setSummaryDate,
isLoading,
completedTrackerRows,
displayedExpenseRows,
displayedSavingsRows,
isSubmitting,
onDeleteTracker,
onDeleteExpense,
onDeleteSavings,
summaryTrackerTotal,
summaryExpensesTotal,
summarySavingsTotal,
summaryProfit,
availableCapital,
availableMoney,
pendingOrdersCount,
completedOrdersCount,
}) {
const [showSales, setShowSales] = useState(true);
const [showExpenses, setShowExpenses] = useState(true);
const [showSavings, setShowSavings] = useState(true);

const [showOlderSales, setShowOlderSales] =
useState(false);

const [showOlderExpenses, setShowOlderExpenses] =
useState(false);

// =====================================================
// NUMBER HELPER
// =====================================================

const toNumber = useCallback((value) => {
const number = Number(value);

return Number.isFinite(number) ? number : 0;

}, []);

// =====================================================
// ORDER QUANTITY
// =====================================================

const getOrderQuantity = useCallback(
(row) => {
if (!row) {
return 1;
}

  const quantity = toNumber(
    row.order_quantity ??
      row.orderQuantity ??
      1,
  );

  return quantity > 0 ? quantity : 1;
},
[toNumber],

);

// =====================================================
// UNIT PRICE
// =====================================================

const getDisplayUnitPrice = useCallback(
(row) => {
if (!row) {
return 0;
}

  const productPrice = toNumber(
    row.product_price,
  );

  if (productPrice > 0) {
    return productPrice;
  }

  const price = toNumber(row.price);

  if (price > 0) {
    return price;
  }

  return 0;
},
[toNumber],

);

// =====================================================
// ORDER TOTAL
// =====================================================

const getOrderTotal = useCallback(
(row) => {
if (!row) {
return 0;
}

  const quantity =
    getOrderQuantity(row);

  const productPrice =
    toNumber(row.product_price);

  const price =
    toNumber(row.price);

  let unitPrice = 0;

  if (productPrice > 0) {
    unitPrice = productPrice;
  } else if (price > 0) {
    unitPrice = price;
  }

  if (unitPrice > 0) {
    return quantity * unitPrice;
  }

  // Legacy fallback
  const oldTotal =
    toNumber(row.total);

  return oldTotal > 0
    ? oldTotal
    : 0;
},
[
  getOrderQuantity,
  toNumber,
],

);

// =====================================================
// LAST 10 DAYS SALES
// =====================================================

const {
recentSales,
olderSales,
} = useMemo(() => {
if (
summaryRange === "date" &&
summaryDate
) {
return {
recentSales:
completedTrackerRows.filter(
(row) =>
String(row.date).slice(
0,
10,
) === summaryDate,
),
olderSales: [],
};
}

const today = new Date();

today.setHours(
  0,
  0,
  0,
  0,
);

const cutoffDate =
  new Date(today);

cutoffDate.setDate(
  cutoffDate.getDate() - 9,
);

const recent = [];
const older = [];

completedTrackerRows.forEach(
  (row) => {
    if (!row.date) {
      recent.push(row);
      return;
    }

    const rowDate =
      new Date(
        `${String(
          row.date,
        ).slice(
          0,
          10,
        )}T00:00:00`,
      );

    if (
      rowDate >=
      cutoffDate
    ) {
      recent.push(row);
    } else {
      older.push(row);
    }
  },
);

return {
  recentSales: recent,
  olderSales: older,
};

}, [
completedTrackerRows,
summaryRange,
summaryDate,
]);

const displayedSalesRows =
showOlderSales
? [
...recentSales,
...olderSales,
]
: recentSales;

// =====================================================
// LAST 10 DAYS EXPENSES
// =====================================================

const {
recentExpenses,
olderExpenses,
} = useMemo(() => {
if (
summaryRange === "date" &&
summaryDate
) {
return {
recentExpenses:
displayedExpenseRows.filter(
(row) =>
String(row.date).slice(
0,
10,
) === summaryDate,
),
olderExpenses: [],
};
}

const today = new Date();

today.setHours(
  0,
  0,
  0,
  0,
);

const cutoffDate =
  new Date(today);

cutoffDate.setDate(
  cutoffDate.getDate() - 9,
);

const recent = [];
const older = [];

displayedExpenseRows.forEach(
  (row) => {
    if (!row.date) {
      recent.push(row);
      return;
    }

    const rowDate =
      new Date(
        `${String(
          row.date,
        ).slice(
          0,
          10,
        )}T00:00:00`,
      );

    if (
      rowDate >=
      cutoffDate
    ) {
      recent.push(row);
    } else {
      older.push(row);
    }
  },
);

return {
  recentExpenses: recent,
  olderExpenses: older,
};

}, [
displayedExpenseRows,
summaryRange,
summaryDate,
]);

const displayedExpenses =
showOlderExpenses
? [
...recentExpenses,
...olderExpenses,
]
: recentExpenses;

// =====================================================
// SALES TOTAL
// =====================================================

const salesRowsForTotal =
useMemo(() => {
if (
summaryRange === "date" &&
summaryDate
) {
return completedTrackerRows.filter(
(row) =>
String(row.date).slice(
0,
10,
) === summaryDate,
);
}

  return completedTrackerRows;
}, [
  completedTrackerRows,
  summaryRange,
  summaryDate,
]);

const finalSalesTotal =
useMemo(() => {
return salesRowsForTotal.reduce(
(total, row) =>
total + getOrderTotal(row),
0,
);
}, [
salesRowsForTotal,
getOrderTotal,
]);

// =====================================================
// EXPENSE TOTAL
// =====================================================

const expensesRowsForTotal =
useMemo(() => {
if (
summaryRange === "date" &&
summaryDate
) {
return displayedExpenseRows.filter(
(row) =>
String(row.date).slice(
0,
10,
) === summaryDate,
);
}

  return displayedExpenseRows;
}, [
  displayedExpenseRows,
  summaryRange,
  summaryDate,
]);

const finalExpensesTotal =
useMemo(() => {
return expensesRowsForTotal.reduce(
(total, row) =>
total +
toNumber(row.price),
0,
);
}, [
expensesRowsForTotal,
toNumber,
]);

// =====================================================
// SAVINGS TOTAL
// =====================================================

const finalSavingsTotal =
useMemo(() => {
return (
displayedSavingsRows || []
).reduce(
(total, row) =>
total +
toNumber(row.amount),
0,
);
}, [
displayedSavingsRows,
toNumber,
]);

// =====================================================
// NET PROFIT
//
// SALES - EXPENSES
//
// SAVINGS DOES NOT REDUCE PROFIT.
// =====================================================

const netProfit = useMemo(() => {
const profit =
finalSalesTotal -
finalExpensesTotal;

return Number.isFinite(profit)
  ? profit
  : 0;

}, [
finalSalesTotal,
finalExpensesTotal,
]);

// =====================================================
// BUSINESS CAPITAL
//
// Business Capital represents the actual
// business profit.
//
// Savings DO NOT reduce Business Capital.
// =====================================================

const businessCapital =
useMemo(() => {
return Math.max(
0,
netProfit,
);
}, [netProfit]);

// =====================================================
// AVAILABLE MONEY
//
// Available Money is the money that has NOT
// been placed into savings.
//
// Available Money =
// Net Profit - Total Savings
// =====================================================

const calculatedAvailableMoney =
useMemo(() => {
const value =
businessCapital -
finalSavingsTotal;

  return Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}, [
  businessCapital,
  finalSavingsTotal,
]);

return (
<div className="space-y-6">
{/* =====================================================
DASHBOARD CARDS
===================================================== */}

  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
    {/* TOTAL SALES */}

    <div className="rounded-xl border border-green-800 bg-green-950 p-5 shadow-sm">
      <p className="text-sm text-gray-300">
        Total Sales
      </p>

      <h2 className="mt-2 text-3xl font-bold text-green-400">
        ₱
        {finalSalesTotal.toFixed(2)}
      </h2>
    </div>

    {/* TOTAL EXPENSES */}

    <div className="rounded-xl border border-red-800 bg-red-950 p-5 shadow-sm">
      <p className="text-sm text-gray-300">
        Total Expenses
      </p>

      <h2 className="mt-2 text-3xl font-bold text-red-400">
        ₱
        {finalExpensesTotal.toFixed(2)}
      </h2>
    </div>

    {/* NET PROFIT */}

    <div className="rounded-xl border border-blue-800 bg-blue-950 p-5 shadow-sm">
      <p className="text-sm text-gray-300">
        Net Profit
      </p>

      <h2
        className={`mt-2 text-3xl font-bold ${
          netProfit < 0
            ? "text-red-400"
            : "text-blue-400"
        }`}
      >
        ₱
        {netProfit.toFixed(2)}
      </h2>
    </div>

    {/* PENDING ORDERS */}

    <div className="rounded-xl border border-yellow-800 bg-yellow-950 p-5 shadow-sm">
      <p className="text-sm text-gray-300">
        Pending Orders
      </p>

      <h2 className="mt-2 text-3xl font-bold text-yellow-400">
        {pendingOrdersCount}
      </h2>
    </div>

    {/* COMPLETED ORDERS */}

    <div className="rounded-xl border border-purple-800 bg-purple-950 p-5 shadow-sm">
      <p className="text-sm text-gray-300">
        Completed Orders
      </p>

      <h2 className="mt-2 text-3xl font-bold text-purple-400">
        {completedOrdersCount}
      </h2>
    </div>

    {/* BUSINESS CAPITAL */}

    <div className="rounded-xl border border-cyan-800 bg-cyan-950 p-5 shadow-sm">
      <p className="text-sm text-gray-300">
        Business Capital
      </p>

      <h2
        className={`mt-2 text-3xl font-bold ${
          businessCapital < 0
            ? "text-red-400"
            : "text-cyan-400"
        }`}
      >
        ₱
        {businessCapital.toFixed(2)}
      </h2>

      <p className="mt-2 text-xs text-gray-400">
        Business Capital = Net Profit
      </p>
    </div>
  </div>

  {/* =====================================================
      FILTER
  ===================================================== */}

  <div className="flex flex-wrap items-center justify-end gap-3">
    <div className="inline-flex rounded-lg bg-gray-800 p-1">
      <button
        type="button"
        onClick={() => {
          setSummaryRange("overall");
          setSummaryDate("");
        }}
        className={`rounded-md px-3 py-1 text-sm font-medium transition ${
          summaryRange === "overall"
            ? "bg-[#d8a66b] text-white"
            : "text-gray-300 hover:bg-gray-700"
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
            : "text-gray-300 hover:bg-gray-700"
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
          setSummaryDate(
            e.target.value,
          )
        }
        className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-[#d8a66b]"
      />
    )}

    {summaryRange === "date" &&
      summaryDate && (
        <button
          type="button"
          onClick={() => {
            setSummaryDate("");
            setSummaryRange(
              "overall",
            );
          }}
          className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
        >
          Clear
        </button>
      )}
  </div>

  {/* =====================================================
      COMPLETED ORDERS
  ===================================================== */}

  <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-5">
    <div
      className="flex cursor-pointer items-center justify-between"
      onClick={() =>
        setShowSales(
          (previous) =>
            !previous,
        )
      }
    >
      <div>
        <h2 className="text-xl font-semibold text-[#e8bd85]">
          Completed Orders
        </h2>

        {summaryRange ===
          "overall" && (
          <p className="mt-1 text-xs text-gray-400">
            Showing sales from
            the last 10 days
          </p>
        )}
      </div>

      <span className="text-2xl font-bold text-[#e8bd85]">
        {showSales ? "−" : "+"}
      </span>
    </div>

    {showSales && (
      <div className="mt-4">
        {summaryRange ===
          "overall" &&
          olderSales.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3">
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  Older Sales Hidden
                </p>

                <p className="text-xs text-gray-400">
                  {olderSales.length} older{" "}
                  {olderSales.length ===
                  1
                    ? "sale"
                    : "sales"}{" "}
                  are hidden from
                  the list.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowOlderSales(
                    (previous) =>
                      !previous,
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

        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Date
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Name
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Qty
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Price
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Total
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Status
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-gray-900">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-3 text-gray-300"
                  >
                    Loading records...
                  </td>
                </tr>
              ) : displayedSalesRows.length >
                0 ? (
                displayedSalesRows.map(
                  (row) => {
                    const quantity =
                      getOrderQuantity(
                        row,
                      );

                    const unitPrice =
                      getDisplayUnitPrice(
                        row,
                      );

                    const orderTotal =
                      getOrderTotal(
                        row,
                      );

                    return (
                      <tr
                        key={row.id}
                        className="border-t border-gray-700"
                      >
                        <td className="px-4 py-3 text-gray-300">
                          {row.date || "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          {row.name || "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          {quantity}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          ₱
                          {unitPrice.toFixed(
                            2,
                          )}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#e8bd85]">
                          ₱
                          {orderTotal.toFixed(
                            2,
                          )}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          {row.status ||
                            "Completed"}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              onDeleteTracker(
                                row,
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            className="rounded-lg border border-red-700 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-3 text-gray-300"
                  >
                    No completed orders
                    yet.
                  </td>
                </tr>
              )}

              <tr className="bg-gray-800">
                <td
                  colSpan="7"
                  className="px-4 py-3 font-semibold text-gray-300"
                >
                  <div className="flex justify-between">
                    <span>
                      Showing:{" "}
                      {
                        displayedSalesRows.length
                      }{" "}
                      entries
                    </span>

                    <span className="text-green-400">
                      Sales Total: ₱
                      {finalSalesTotal.toFixed(
                        2,
                      )}
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

  {/* =====================================================
      EXPENSES
  ===================================================== */}

  <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-5">
    <div
      className="flex cursor-pointer items-center justify-between"
      onClick={() =>
        setShowExpenses(
          (previous) =>
            !previous,
        )
      }
    >
      <div>
        <h2 className="text-xl font-semibold text-[#e8bd85]">
          Expenses
        </h2>

        {summaryRange ===
          "overall" && (
          <p className="mt-1 text-xs text-gray-400">
            Showing expenses from
            the last 10 days
          </p>
        )}
      </div>

      <span className="text-2xl font-bold text-[#e8bd85]">
        {showExpenses ? "−" : "+"}
      </span>
    </div>

    {showExpenses && (
      <div className="mt-4">
        {summaryRange ===
          "overall" &&
          olderExpenses.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3">
              <div>
                <p className="text-sm font-semibold text-gray-200">
                  Older Expenses Hidden
                </p>

                <p className="text-xs text-gray-400">
                  {olderExpenses.length}{" "}
                  older{" "}
                  {olderExpenses.length ===
                  1
                    ? "expense"
                    : "expenses"}{" "}
                  are hidden from
                  the list.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowOlderExpenses(
                    (previous) =>
                      !previous,
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

        <div className="overflow-x-auto rounded-xl border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Date
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Product
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Price
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Total
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-gray-900">
              {isLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-3 text-gray-300"
                  >
                    Loading records...
                  </td>
                </tr>
              ) : displayedExpenses.length >
                0 ? (
                displayedExpenses.map(
                  (row) => {
                    const expensePrice =
                      toNumber(
                        row.price,
                      );

                    return (
                      <tr
                        key={row.id}
                        className="border-t border-gray-700"
                      >
                        <td className="px-4 py-3 text-gray-300">
                          {row.date || "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          {row.product ||
                            "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-300">
                          ₱
                          {expensePrice.toFixed(
                            2,
                          )}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#e8bd85]">
                          ₱
                          {expensePrice.toFixed(
                            2,
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              onDeleteExpense(
                                row,
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            className="rounded-lg border border-red-700 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  },
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-3 text-gray-300"
                  >
                    No expense rows
                    yet.
                  </td>
                </tr>
              )}

              <tr className="bg-gray-800">
                <td
                  colSpan="5"
                  className="px-4 py-3 font-semibold text-gray-300"
                >
                  <div className="flex justify-between">
                    <span>
                      Showing:{" "}
                      {
                        displayedExpenses.length
                      }{" "}
                      entries
                    </span>

                    <span className="text-red-400">
                      Expenses Total: ₱
                      {finalExpensesTotal.toFixed(
                        2,
                      )}
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

  {/* =====================================================
      TOTAL EXPENSES
  ===================================================== */}

  <div className="rounded-2xl border border-gray-700 bg-gray-900 p-5">
    <h2 className="text-xl font-semibold text-[#e8bd85]">
      Total Expenses
    </h2>

    <div className="mt-4 rounded-xl border border-gray-700 bg-gray-800 p-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium text-gray-300">
          Total Expenses
        </span>

        <span className="text-2xl font-bold text-red-400">
          ₱
          {finalExpensesTotal.toFixed(2)}
        </span>
      </div>
    </div>
  </div>

  {/* =====================================================
      PROFIT
  ===================================================== */}

  <div className="rounded-2xl border border-gray-700 bg-gray-900 p-5">
    <h2 className="text-xl font-semibold text-[#e8bd85]">
      Net Business Profit
    </h2>

    <div className="mt-4 rounded-xl border border-gray-700 bg-gray-800 p-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium text-gray-300">
          Business Profit
        </span>

        <span
          className={`text-2xl font-bold ${
            netProfit < 0
              ? "text-red-400"
              : "text-green-400"
          }`}
        >
          ₱
          {netProfit.toFixed(2)}
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        Net Profit = Total Sales −
        Total Expenses
      </p>
    </div>
  </div>

  {/* =====================================================
      SAVINGS
  ===================================================== */}

  <div className="rounded-2xl border border-gray-700 bg-gray-900 p-5">
    <div
      className="flex cursor-pointer items-center justify-between"
      onClick={() =>
        setShowSavings(
          (previous) =>
            !previous,
        )
      }
    >
      <h2 className="text-xl font-semibold text-[#e8bd85]">
        Savings
      </h2>

      <span className="text-2xl font-bold text-[#e8bd85]">
        {showSavings ? "−" : "+"}
      </span>
    </div>

    {showSavings && (
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-200">
                Date
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-200">
                Amount
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-200">
                Notes
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-200">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-900">
            {displayedSavingsRows?.length >
            0 ? (
              displayedSavingsRows.map(
                (row) => (
                  <tr
                    key={row.id}
                    className="border-t border-gray-700"
                  >
                    <td className="px-4 py-3 text-gray-300">
                      {row.date || "—"}
                    </td>

                    <td className="px-4 py-3 font-semibold text-cyan-400">
                      ₱
                      {toNumber(
                        row.amount,
                      ).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-gray-300">
                      {row.notes || "—"}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          onDeleteSavings(
                            row,
                          )
                        }
                        disabled={
                          isSubmitting
                        }
                        className="rounded-lg border border-red-700 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-3 text-gray-300"
                >
                  No savings records
                  yet.
                </td>
              </tr>
            )}

            <tr className="bg-gray-800">
              <td
                colSpan="4"
                className="px-4 py-3"
              >
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-300">
                    Total Savings
                  </span>

                  <span className="text-cyan-400">
                    ₱
                    {finalSavingsTotal.toFixed(
                      2,
                    )}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )}
  </div>

  {/* =====================================================
      BUSINESS CAPITAL
  ===================================================== */}

  <div className="rounded-2xl border border-cyan-800 bg-gray-900 p-5">
    <h2 className="text-xl font-semibold text-[#e8bd85]">
      Business Capital
    </h2>

    <div className="mt-4 space-y-4">
      {/* BUSINESS CAPITAL */}

      <div className="rounded-xl border border-cyan-800 bg-cyan-950 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-300">
            Business Capital
          </span>

          <span
            className={`text-2xl font-bold ${
              businessCapital < 0
                ? "text-red-400"
                : "text-cyan-400"
            }`}
          >
            ₱
            {businessCapital.toFixed(2)}
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Business Capital = Net Profit
        </p>
      </div>

      {/* SAVINGS DEDUCTION */}

      <div className="rounded-xl border border-purple-800 bg-purple-950 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-300">
            Less: Total Savings
          </span>

          <span className="text-2xl font-bold text-purple-400">
            −₱
            {finalSavingsTotal.toFixed(
              2,
            )}
          </span>
        </div>
      </div>

      {/* AVAILABLE MONEY */}

      <div className="rounded-xl border border-green-800 bg-green-950 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-300">
            Available Money
          </span>

          <span
            className={`text-2xl font-bold ${
              calculatedAvailableMoney <
              0
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            ₱
            {calculatedAvailableMoney.toFixed(
              2,
            )}
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Available Money = Business
          Capital − Total Savings
        </p>
      </div>
    </div>
  </div>
</div>
);
}