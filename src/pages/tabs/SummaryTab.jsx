import { useCallback, useMemo, useState } from "react";
import { FileText } from "lucide-react";

const ADDITIONAL_DIP_PRICE = 10;

function escapeReportText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
  pendingOrdersCount,
  completedOrdersCount,
}) {
  const [showSales, setShowSales] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);

  const [showOlderSales, setShowOlderSales] =
    useState(false);

  const [showOlderExpenses, setShowOlderExpenses] =
    useState(false);

  const [reportRange, setReportRange] =
    useState("14days");

  const [reportDate, setReportDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

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
  // ADDITIONAL DIPS
  // =====================================================

  const getAdditionalDips = useCallback(
    (row) => {
      if (!row) {
        return 0;
      }

      const additionalDips = toNumber(
        row.additional_dips ??
          row.additionalDips ??
          0,
      );

      return additionalDips > 0
        ? additionalDips
        : 0;
    },
    [toNumber],
  );

  // =====================================================
  // ORDER TOTAL
  //
  // PRODUCT TOTAL
  // =
  // Quantity × Product Price
  //
  // EXTRA DIP TOTAL
  // =
  // Additional Dips × ₱10
  //
  // FINAL TOTAL
  // =
  // Product Total + Extra Dip Total
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

      // -------------------------------------------------
      // PRODUCT SALES
      // -------------------------------------------------

      const productTotal =
        unitPrice > 0
          ? quantity * unitPrice
          : 0;

      // -------------------------------------------------
      // ADDITIONAL DIP SALES
      // -------------------------------------------------

      const additionalDips =
        getAdditionalDips(row);

      const additionalDipTotal =
        additionalDips *
        ADDITIONAL_DIP_PRICE;

      // -------------------------------------------------
      // FINAL TOTAL
      // -------------------------------------------------

      const calculatedTotal =
        productTotal +
        additionalDipTotal;

      if (
        Number.isFinite(calculatedTotal) &&
        calculatedTotal > 0
      ) {
        return calculatedTotal;
      }

      // -------------------------------------------------
      // LEGACY FALLBACK
      // -------------------------------------------------

      const oldTotal =
        toNumber(row.total);

      return oldTotal > 0
        ? oldTotal
        : 0;
    },
    [
      getOrderQuantity,
      getAdditionalDips,
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
  //
  // IMPORTANT:
  // Includes additional dips.
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
          total +
          getOrderTotal(row),
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

  const generateSummaryReport = useCallback(() => {
    const selectedDate = reportDate ||
      new Date().toISOString().slice(0, 10);
    const rangeStart = new Date(
      `${selectedDate}T00:00:00`,
    );

    if (reportRange === "14days") {
      rangeStart.setDate(rangeStart.getDate() - 13);
    }

    const isInReportRange = (row) => {
      if (reportRange === "overall") {
        return true;
      }

      if (!row?.date) {
        return false;
      }

      const rowDate = new Date(
        `${String(row.date).slice(0, 10)}T00:00:00`,
      );

      if (reportRange === "date") {
        return (
          String(row.date).slice(0, 10) ===
          selectedDate
        );
      }

      return rowDate >= rangeStart && rowDate <=
        new Date(`${selectedDate}T23:59:59`);
    };

    const reportSalesRows =
      completedTrackerRows.filter(isInReportRange);
    const reportExpenseRows =
      displayedExpenseRows.filter(isInReportRange);
    const reportSavingsRows =
      (displayedSavingsRows || []).filter(isInReportRange);
    const reportSalesTotal = reportSalesRows.reduce(
      (total, row) => total + getOrderTotal(row),
      0,
    );
    const reportExpensesTotal = reportExpenseRows.reduce(
      (total, row) => total + toNumber(row.price),
      0,
    );
    const reportSavingsTotal = reportSavingsRows.reduce(
      (total, row) => total + toNumber(row.amount),
      0,
    );
    const reportProfit =
      reportSalesTotal - reportExpensesTotal;
    const reportAvailableMoney = Math.max(
      0,
      reportProfit - reportSavingsTotal,
    );
    const reportPeriod = reportRange === "overall"
      ? "Overall"
      : reportRange === "date"
        ? selectedDate
        : `14 days ending ${selectedDate}`;
    const salesDetails = reportSalesRows.length > 0
      ? reportSalesRows.map((row) => `
              <tr>
                <td>${escapeReportText(row.date)}</td>
                <td>${escapeReportText(row.name || row.product || "—")}</td>
                <td>${getOrderQuantity(row)}</td>
                <td>₱${getDisplayUnitPrice(row).toFixed(2)}</td>
                <td>₱${getOrderTotal(row).toFixed(2)}</td>
              </tr>
            `).join("")
      : '<tr><td colspan="5">No sales for this period.</td></tr>';
    const expenseDetails = reportExpenseRows.length > 0
      ? reportExpenseRows.map((row) => `
              <tr>
                <td>${escapeReportText(row.date)}</td>
                <td>${escapeReportText(row.product || "—")}</td>
                <td>₱${toNumber(row.price).toFixed(2)}</td>
              </tr>
            `).join("")
      : '<tr><td colspan="3">No expenses for this period.</td></tr>';
    const printWindow = window.open(
      "",
      "_blank",
      "width=850,height=900",
    );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Churros Tracker Report</title>
          <style>
            body { color: #202020; font-family: Arial, sans-serif; margin: 40px; }
            h1 { margin-bottom: 4px; }
            .period { color: #555; margin-bottom: 28px; }
            .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; }
            .item { border: 1px solid #ddd; padding: 14px; }
            .label { color: #555; font-size: 13px; }
            .value { font-size: 22px; font-weight: 700; margin-top: 5px; }
            table { border-collapse: collapse; margin-top: 24px; width: 100%; }
            th, td { border-bottom: 1px solid #ddd; padding: 9px 6px; text-align: left; }
            th { background: #f3f3f3; }
            h2 { border-bottom: 2px solid #202020; margin-top: 32px; padding-bottom: 6px; }
            .profit { color: ${reportProfit < 0 ? "#b42318" : "#18794e"}; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <h1>Churros Tracker Financial Report</h1>
          <div class="period">Report period: ${reportPeriod}<br />Generated: ${new Date().toLocaleString()}</div>
          <div class="summary">
            <div class="item"><div class="label">Total Sales</div><div class="value">₱${reportSalesTotal.toFixed(2)}</div></div>
            <div class="item"><div class="label">Total Expenses</div><div class="value">₱${reportExpensesTotal.toFixed(2)}</div></div>
            <div class="item"><div class="label">Net Profit</div><div class="value profit">₱${reportProfit.toFixed(2)}</div></div>
            <div class="item"><div class="label">Total Savings</div><div class="value">₱${reportSavingsTotal.toFixed(2)}</div></div>
            <div class="item"><div class="label">Available Money</div><div class="value">₱${reportAvailableMoney.toFixed(2)}</div></div>
            <div class="item"><div class="label">Completed Orders</div><div class="value">${reportSalesRows.length}</div></div>
          </div>
          <table>
            <thead><tr><th>Metric</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td>Total Sales</td><td>₱${reportSalesTotal.toFixed(2)}</td></tr>
              <tr><td>Total Expenses</td><td>₱${reportExpensesTotal.toFixed(2)}</td></tr>
              <tr><td>Net Profit</td><td>₱${reportProfit.toFixed(2)}</td></tr>
            </tbody>
          </table>
          <h2>Sales Products</h2>
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead>
            <tbody>${salesDetails}</tbody>
          </table>
          <h2>Expense Products</h2>
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Amount</th></tr></thead>
            <tbody>${expenseDetails}</tbody>
          </table>
          <p>Net Profit = Total Sales - Total Expenses</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [
    reportRange,
    reportDate,
    completedTrackerRows,
    displayedExpenseRows,
    displayedSavingsRows,
    getOrderTotal,
    getOrderQuantity,
    getDisplayUnitPrice,
    toNumber,
  ]);

  return (
    <div className="min-w-0 space-y-6">
      {/* =====================================================
          DASHBOARD CARDS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* TOTAL SALES */}

        <div className="rounded-xl border border-green-800 bg-green-950 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-300">
            Total Sales
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-400 sm:text-3xl">
            ₱
            {finalSalesTotal.toFixed(2)}
          </h2>

          <p className="mt-2 text-xs text-gray-400">
            Includes additional dips
          </p>
        </div>

        {/* TOTAL EXPENSES */}

        <div className="rounded-xl border border-red-800 bg-red-950 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-300">
            Total Expenses
          </p>

          <h2 className="mt-2 text-2xl font-bold text-red-400 sm:text-3xl">
            ₱
            {finalExpensesTotal.toFixed(2)}
          </h2>
        </div>

        {/* NET PROFIT */}

        <div className="rounded-xl border border-blue-800 bg-blue-950 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-300">
            Net Profit
          </p>

          <h2
            className={`mt-2 text-2xl font-bold sm:text-3xl ${
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

        <div className="rounded-xl border border-yellow-800 bg-yellow-950 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-300">
            Pending Orders
          </p>

          <h2 className="mt-2 text-2xl font-bold text-yellow-400 sm:text-3xl">
            {pendingOrdersCount}
          </h2>
        </div>

        {/* COMPLETED ORDERS */}

        <div className="rounded-xl border border-purple-800 bg-purple-950 p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-300">
            Completed Orders
          </p>

          <h2 className="mt-2 text-2xl font-bold text-purple-400 sm:text-3xl">
            {completedOrdersCount}
          </h2>
        </div>

      </div>

      {/* =====================================================
          FILTER
      ===================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg bg-gray-800 p-1">
            <button
              type="button"
              onClick={() => setReportRange("date")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                reportRange === "date"
                  ? "bg-[#d8a66b] text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Report by Date
            </button>

            <button
              type="button"
              onClick={() => setReportRange("14days")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                reportRange === "14days"
                  ? "bg-[#d8a66b] text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Last 14 Days
            </button>

            <button
              type="button"
              onClick={() => setReportRange("overall")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                reportRange === "overall"
                  ? "bg-[#d8a66b] text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              Overall
            </button>
          </div>

          {reportRange !== "overall" && (
            <input
              type="date"
              value={reportDate}
              onChange={(event) =>
                setReportDate(event.target.value)
              }
              className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white outline-none focus:border-[#d8a66b]"
            />
          )}

          <button
            type="button"
            onClick={generateSummaryReport}
            className="inline-flex items-center gap-2 rounded-lg bg-[#d8a66b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c38f54]"
          >
            <FileText size={16} aria-hidden="true" />
            Generate PDF
          </button>
        </div>

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
      </div>

      {/* =====================================================
          COMPLETED ORDERS
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-5">
        <button
          type="button"
          aria-expanded={showSales}
          aria-controls="summary-sales-content"
          className="flex w-full cursor-pointer items-center justify-between rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a66b]"
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
        </button>

        {showSales && (
          <div id="summary-sales-content" className="mt-4">
            {summaryRange ===
              "overall" &&
              olderSales.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-700 bg-gray-800 p-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-200">
                      Older Sales Hidden
                    </p>

                    <p className="text-xs text-gray-400">
                      {olderSales.length}{" "}
                      older{" "}
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

            <div className="hidden overflow-x-auto rounded-xl border border-gray-700 sm:block">
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
                              {row.date ||
                                "—"}
                            </td>

                            <td className="px-4 py-3 text-gray-300">
                              {row.name ||
                                "—"}
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
                        No completed
                        orders yet.
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

            <div className="space-y-3 sm:hidden">
              {isLoading ? (
                <p className="rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
                  Loading records...
                </p>
              ) : displayedSalesRows.length > 0 ? (
                displayedSalesRows.map((row) => {
                  const quantity = getOrderQuantity(row);
                  const unitPrice = getDisplayUnitPrice(row);
                  const orderTotal = getOrderTotal(row);

                  return (
                    <article
                      key={row.id}
                      className="rounded-xl border border-gray-700 bg-gray-800 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-100">
                            {row.name || "—"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {row.date || "—"} · {row.status || "Completed"}
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold text-[#e8bd85]">
                          ₱{orderTotal.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Quantity</p>
                          <p className="mt-1 text-gray-200">{quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Unit price</p>
                          <p className="mt-1 text-gray-200">₱{unitPrice.toFixed(2)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteTracker(row)}
                        disabled={isSubmitting}
                        className="mt-4 w-full rounded-lg border border-red-700 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
                  No completed orders yet.
                </p>
              )}

              <div className="flex justify-between rounded-xl bg-gray-800 p-4 text-sm font-semibold">
                <span className="text-gray-300">
                  Showing: {displayedSalesRows.length} entries
                </span>
                <span className="text-green-400">
                  ₱{finalSalesTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          EXPENSES
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 p-5">
        <button
          type="button"
          aria-expanded={showExpenses}
          aria-controls="summary-expenses-content"
          className="flex w-full cursor-pointer items-center justify-between rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8a66b]"
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
        </button>

        {showExpenses && (
          <div id="summary-expenses-content" className="mt-4">
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

            <div className="hidden overflow-x-auto rounded-xl border border-gray-700 sm:block">
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
                              {row.date ||
                                "—"}
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

            <div className="space-y-3 sm:hidden">
              {isLoading ? (
                <p className="rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
                  Loading records...
                </p>
              ) : displayedExpenses.length > 0 ? (
                displayedExpenses.map((row) => {
                  const expensePrice = toNumber(row.price);

                  return (
                    <article
                      key={row.id}
                      className="rounded-xl border border-gray-700 bg-gray-800 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-100">
                            {row.product || "—"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {row.date || "—"}
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold text-[#e8bd85]">
                          ₱{expensePrice.toFixed(2)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteExpense(row)}
                        disabled={isSubmitting}
                        className="mt-4 w-full rounded-lg border border-red-700 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </article>
                  );
                })
              ) : (
                <p className="rounded-xl border border-gray-700 bg-gray-800 p-4 text-sm text-gray-300">
                  No expense rows yet.
                </p>
              )}

              <div className="flex justify-between rounded-xl bg-gray-800 p-4 text-sm font-semibold">
                <span className="text-gray-300">
                  Showing: {displayedExpenses.length} entries
                </span>
                <span className="text-red-400">
                  ₱{finalExpensesTotal.toFixed(2)}
                </span>
              </div>
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
              {finalExpensesTotal.toFixed(
                2,
              )}
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

    </div>
  );
}