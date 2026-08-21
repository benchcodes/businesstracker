import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

import TrackerTab from "./tabs/TrackerTab";
import PendingOrdersTab from "./tabs/PendingOrdersTab";
import ExpensesTab from "./tabs/ExpensesTab";
import SummaryTab from "./tabs/SummaryTab";
import TuitionTargetTab from "./tabs/TuitionTargetTab";

export default function Dashboard({ activeView }) {
  // =====================================================
  // TRACKER STATE
  // =====================================================

  const [tracker, setTracker] = useState({
    date: "",
    name: "",

    product: "Regular Churros",
    variantPcs: 4,
    productPrice: 49,

    orderQuantity: "",

    // Effective price saved to database
    price: "",

    // Additional dip
    additionalDips: "",
    additionalDipType: "Chocolate",

    // Free dip
    dip: "Matcha",

    notes: "",
    status: "Pending",
  });

  // =====================================================
  // EXPENSE STATE
  // =====================================================

  const [expenses, setExpenses] = useState({
    date: "",
    product: "",
    price: "",
  });

  // =====================================================
  // DATA STATE
  // =====================================================

  const [submittedTracker, setSubmittedTracker] =
    useState(null);

  const [submittedExpenses, setSubmittedExpenses] =
    useState(null);

  const [trackerRows, setTrackerRows] =
    useState([]);

  const [expenseRows, setExpenseRows] =
    useState([]);

  // =====================================================
  // SUMMARY STATE
  // =====================================================

  const [summaryRange, setSummaryRange] =
    useState("overall");

  const [summaryDate, setSummaryDate] =
    useState("");

  // =====================================================
  // UI STATE
  // =====================================================

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode =
      localStorage.getItem("churrozi-dark-mode");

    // Dark mode by default
    if (savedMode === null) {
      return true;
    }

    return savedMode === "true";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem(
      "churrozi-dark-mode",
      String(darkMode)
    );
  }, [darkMode]);

  // =====================================================
  // LOAD DATA
  // =====================================================

  async function loadData() {
    if (!supabase) {
      setErrorMessage(
        "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment first."
      );

      setIsLoading(false);
      return;
    }

    try {
      const [
        {
          data: trackerData,
          error: trackerError,
        },
        {
          data: expenseData,
          error: expenseError,
        },
      ] = await Promise.all([
        supabase
          .from("tracker")
          .select("*")
          .order("date", {
            ascending: false,
          }),

        supabase
          .from("expenses")
          .select("*")
          .order("date", {
            ascending: false,
          }),
      ]);

      if (trackerError) {
        throw trackerError;
      }

      if (expenseError) {
        throw expenseError;
      }

      setTrackerRows(
        trackerData || []
      );

      setExpenseRows(
        expenseData || []
      );

      setErrorMessage("");
    } catch (error) {
      console.error(error);

      setErrorMessage(
        `Unable to load data from Supabase: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // =====================================================
  // ACTIVE FORM DATA
  // =====================================================

  const activeTracker =
    submittedTracker || tracker;

  const activeExpenses =
    submittedExpenses || expenses;

  // =====================================================
  // TRACKER TOTAL
  // =====================================================

  const trackerTotal = useMemo(() => {
    const quantity =
      Number(
        activeTracker.orderQuantity ??
          activeTracker.order_quantity ??
          0
      ) || 0;

    const productPrice =
      Number(
        activeTracker.productPrice ??
          activeTracker.product_price ??
          0
      ) || 0;

    const additionalDips =
      Number(
        activeTracker.additionalDips ??
          activeTracker.additional_dips ??
          0
      ) || 0;

    const productTotal =
      productPrice * quantity;

    const dipTotal =
      additionalDips * 10;

    return productTotal + dipTotal;
  }, [
    activeTracker.orderQuantity,
    activeTracker.order_quantity,
    activeTracker.productPrice,
    activeTracker.product_price,
    activeTracker.additionalDips,
    activeTracker.additional_dips,
  ]);

  // =====================================================
  // EXPENSE TOTAL
  // =====================================================

  const expensesTotal = useMemo(() => {
    return Number(
      activeExpenses.price ?? 0
    );
  }, [
    activeExpenses.price,
  ]);

  // =====================================================
  // DISPLAYED TRACKER ROWS
  // =====================================================

  const displayedTrackerRows =
    useMemo(() => {
      if (
        summaryRange === "date" &&
        summaryDate
      ) {
        return trackerRows.filter(
          (row) =>
            (row.date || "").slice(0, 10) ===
            summaryDate
        );
      }

      return trackerRows;
    }, [
      trackerRows,
      summaryRange,
      summaryDate,
    ]);

  // =====================================================
  // DISPLAYED EXPENSE ROWS
  // =====================================================

  const displayedExpenseRows =
    useMemo(() => {
      if (
        summaryRange === "date" &&
        summaryDate
      ) {
        return expenseRows.filter(
          (row) =>
            (row.date || "").slice(0, 10) ===
            summaryDate
        );
      }

      return expenseRows;
    }, [
      expenseRows,
      summaryRange,
      summaryDate,
    ]);

  // =====================================================
  // PENDING ORDERS
  // =====================================================

  const pendingTrackerRows =
    useMemo(() => {
      return trackerRows.filter(
        (row) =>
          (row.status || "Pending") ===
          "Pending"
      );
    }, [trackerRows]);

  // =====================================================
  // COMPLETED ORDERS
  // =====================================================

  const completedTrackerRows =
    useMemo(() => {
      return displayedTrackerRows.filter(
        (row) =>
          (row.status || "Pending") ===
          "Completed"
      );
    }, [displayedTrackerRows]);

  // =====================================================
  // ROW TOTAL HELPER
  // =====================================================

  /*
    IMPORTANT:

    Older rows may not have product_price
    or additional_dips.

    Therefore:

    If product_price exists:
      calculate from product price + dips.

    Otherwise:
      use old order_quantity × price.

    This keeps old Supabase records working.
  */

  const getTrackerRowTotal = (row) => {
    const quantity =
      Number(
        row.order_quantity || 0
      );

    const productPrice =
      Number(
        row.product_price
      );

    const additionalDips =
      Number(
        row.additional_dips || 0
      );

    // New records
    if (
      Number.isFinite(productPrice) &&
      productPrice > 0
    ) {
      return (
        productPrice * quantity +
        additionalDips * 10
      );
    }

    // Old records
    return (
      quantity *
      Number(row.price || 0)
    );
  };

  // =====================================================
  // PENDING TOTAL
  // =====================================================

  const pendingTrackerTotal =
    useMemo(() => {
      return pendingTrackerRows.reduce(
        (total, row) =>
          total +
          getTrackerRowTotal(row),
        0
      );
    }, [pendingTrackerRows]);

  // =====================================================
  // SUMMARY SALES TOTAL
  // =====================================================

  const summaryTrackerTotal =
    useMemo(() => {
      return completedTrackerRows.reduce(
        (total, row) =>
          total +
          getTrackerRowTotal(row),
        0
      );
    }, [completedTrackerRows]);

  // =====================================================
  // SUMMARY EXPENSE TOTAL
  // =====================================================

  const summaryExpensesTotal =
    useMemo(() => {
      return displayedExpenseRows.reduce(
        (total, row) =>
          total +
          Number(row.price || 0),
        0
      );
    }, [displayedExpenseRows]);

  // =====================================================
  // AVAILABLE CAPITAL
  // =====================================================

  const availableCapital =
    useMemo(() => {
      // Overall capital
      if (!summaryDate) {
        const totalSales =
          trackerRows
            .filter(
              (row) =>
                row.status ===
                "Completed"
            )
            .reduce(
              (total, row) =>
                total +
                getTrackerRowTotal(row),
              0
            );

        const totalExpenses =
          expenseRows.reduce(
            (total, row) =>
              total +
              Number(row.price || 0),
            0
          );

        return (
          totalSales -
          totalExpenses
        );
      }

      // Capital before selected date
      const selectedDate =
        new Date(summaryDate);

      const previousSales =
        trackerRows
          .filter(
            (row) =>
              row.status ===
                "Completed" &&
              new Date(row.date) <
                selectedDate
          )
          .reduce(
            (total, row) =>
              total +
              getTrackerRowTotal(row),
            0
          );

      const previousExpenses =
        expenseRows
          .filter(
            (row) =>
              new Date(row.date) <
              selectedDate
          )
          .reduce(
            (total, row) =>
              total +
              Number(row.price || 0),
            0
          );

      return (
        previousSales -
        previousExpenses
      );
    }, [
      summaryDate,
      trackerRows,
      expenseRows,
    ]);

  // =====================================================
  // COUNTS
  // =====================================================

  const pendingOrdersCount =
    pendingTrackerRows.length;

  const completedOrdersCount =
    completedTrackerRows.length;

  // =====================================================
  // TRACKER SUBMIT
  // =====================================================

  const handleTrackerSubmit =
    async (event) => {
      event.preventDefault();

      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured yet."
        );
        return;
      }

      if (
        !tracker.date ||
        !tracker.name ||
        !tracker.orderQuantity ||
        !tracker.productPrice
      ) {
        setErrorMessage(
          "Fill in all required tracker fields before saving."
        );
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const quantity =
          Number(
            tracker.orderQuantity
          ) || 0;

        const productPrice =
          Number(
            tracker.productPrice
          ) || 0;

        const additionalDips =
          Number(
            tracker.additionalDips
          ) || 0;

        // =================================================
        // CALCULATE ORDER TOTAL
        // =================================================

        const productTotal =
          productPrice *
          quantity;

        const dipTotal =
          additionalDips * 10;

        const totalOrderPrice =
          productTotal +
          dipTotal;

        // =================================================
        // EFFECTIVE PRICE
        // =================================================

        /*
          Summary currently works with:

          order_quantity × price

          Therefore we save an effective
          per-quantity price.

          Example:

          2 orders
          Product = ₱49
          2 extra dips = ₱20

          Total = ₱118

          Effective price:
          ₱118 / 2 = ₱59

          Summary:
          2 × ₱59 = ₱118
        */

        const effectivePrice =
          quantity > 0
            ? totalOrderPrice /
              quantity
            : 0;

        // =================================================
        // SUPABASE PAYLOAD
        // =================================================

        const payload = {
          date: tracker.date,

          name: tracker.name,

          product:
            tracker.product ||
            "Regular Churros",

          variant_pcs:
            Number(
              tracker.variantPcs
            ) || null,

          product_price:
            productPrice,

          order_quantity:
            quantity,

          // Effective price
          price:
            effectivePrice,

          additional_dips:
            additionalDips,

          additional_dip_type:
            additionalDips > 0
              ? tracker.additionalDipType ||
                "Chocolate"
              : null,

          dip:
            tracker.dip ||
            "Matcha",

          notes:
            tracker.notes?.trim() ||
            null,

          status:
            tracker.status ||
            "Pending",
        };

        // =================================================
        // INSERT
        // =================================================

        const {
          data,
          error,
        } = await supabase
          .from("tracker")
          .insert([payload])
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Add new row immediately
        if (data) {
          setTrackerRows(
            (previous) => [
              data,
              ...previous,
            ]
          );

          setSubmittedTracker(
            data
          );
        }

        // =================================================
        // RESET FORM
        // =================================================

        setTracker({
          date: "",
          name: "",

          product:
            "Regular Churros",

          variantPcs: 4,

          productPrice: 49,

          orderQuantity: "",

          price: "",

          additionalDips: "",

          additionalDipType:
            "Chocolate",

          dip: "Matcha",

          notes: "",

          status: "Pending",
        });

        setErrorMessage("");

      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to save tracker entry: ${error.message}`
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // EXPENSE SUBMIT
  // =====================================================

  const handleExpensesSubmit =
    async (event) => {
      event.preventDefault();

      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured yet."
        );
        return;
      }

      if (
        !expenses.date ||
        !expenses.product ||
        !expenses.price
      ) {
        setErrorMessage(
          "Fill in all expense fields before saving."
        );
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const payload = {
          date: expenses.date,

          product:
            expenses.product,

          price:
            Number(
              expenses.price || 0
            ),
        };

        const {
          data,
          error,
        } = await supabase
          .from("expenses")
          .insert([payload])
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setExpenseRows(
            (previous) => [
              data,
              ...previous,
            ]
          );

          setSubmittedExpenses(
            data
          );
        }

        setExpenses({
          date: "",
          product: "",
          price: "",
        });

        setErrorMessage("");

      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to save expense entry: ${error.message}`
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // DELETE TRACKER
  // =====================================================

  const handleDeleteTrackerRow =
    async (rowId) => {
      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured yet."
        );
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const {
          error,
        } = await supabase
          .from("tracker")
          .delete()
          .eq("id", rowId);

        if (error) {
          throw error;
        }

        setTrackerRows(
          (previous) =>
            previous.filter(
              (row) =>
                row.id !== rowId
            )
        );

      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to delete tracker entry: ${error.message}`
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // CHANGE TRACKER STATUS
  // =====================================================

  const handleTrackerStatusChange =
    async (
      rowId,
      status
    ) => {
      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured yet."
        );
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const {
          data,
          error,
        } = await supabase
          .from("tracker")
          .update({
            status,
          })
          .eq("id", rowId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setTrackerRows(
            (previous) =>
              previous.map(
                (row) =>
                  row.id === rowId
                    ? data
                    : row
              )
          );
        }

      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to update tracker status: ${error.message}`
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // DELETE EXPENSE
  // =====================================================

  const handleDeleteExpenseRow =
    async (rowId) => {
      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured yet."
        );
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const {
          error,
        } = await supabase
          .from("expenses")
          .delete()
          .eq("id", rowId);

        if (error) {
          throw error;
        }

        setExpenseRows(
          (previous) =>
            previous.filter(
              (row) =>
                row.id !== rowId
            )
        );

      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to delete expense entry: ${error.message}`
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // CONFIRM DELETE TRACKER
  // =====================================================

  const confirmDeleteTrackerRow =
    (row) => {
      const label = row?.name
        ? ` for ${row.name}`
        : "";

      const isConfirmed =
        window.confirm(
          `Are you sure you want to delete this tracker entry${label}?`
        );

      if (isConfirmed) {
        handleDeleteTrackerRow(
          row.id
        );
      }
    };

  // =====================================================
  // CONFIRM DELETE EXPENSE
  // =====================================================

  const confirmDeleteExpenseRow =
    (row) => {
      const label =
        row?.product
          ? ` for ${row.product}`
          : "";

      const isConfirmed =
        window.confirm(
          `Are you sure you want to delete this expense entry${label}?`
        );

      if (isConfirmed) {
        handleDeleteExpenseRow(
          row.id
        );
      }
    };

  // =====================================================
  // VIEW META
  // =====================================================

  const viewMeta = {
    tracker: {
      title: "Tracker",

      description:
        "Log daily orders and calculate the total price for each entry.",
    },

    pending: {
      title:
        "Pending Orders",

      description:
        "Review all pending orders and mark them completed when done.",
    },

    expenses: {
      title:
        "Expenses",

      description:
        "Record product expenses and keep your costs organized.",
    },

    summary: {
      title:
        "Summary",

      description:
        "Review completed orders and expense data in a spreadsheet-style summary.",
    },

    tuition: {
      title:
        "Tuition Fee Target",

      description:
        "Track your tuition fee savings and monitor your progress.",
    },
  };

  const currentView =
    viewMeta[activeView] ||
    viewMeta.summary;

  // =====================================================
  // RENDER ACTIVE TAB
  // =====================================================

  const renderActiveTab = () => {
    // ===================================================
    // SUMMARY
    // ===================================================

    if (
      activeView ===
      "summary"
    ) {
      return (
        <SummaryTab
          summaryRange={
            summaryRange
          }

          setSummaryRange={
            setSummaryRange
          }

          summaryDate={
            summaryDate
          }

          setSummaryDate={
            setSummaryDate
          }

          isLoading={
            isLoading
          }

          completedTrackerRows={
            completedTrackerRows
          }

          displayedExpenseRows={
            displayedExpenseRows
          }

          isSubmitting={
            isSubmitting
          }

          onDeleteTracker={
            confirmDeleteTrackerRow
          }

          onDeleteExpense={
            confirmDeleteExpenseRow
          }

          summaryTrackerTotal={
            summaryTrackerTotal
          }

          summaryExpensesTotal={
            summaryExpensesTotal
          }

          availableCapital={
            availableCapital
          }

          pendingOrdersCount={
            pendingOrdersCount
          }

          completedOrdersCount={
            completedOrdersCount
          }
        />
      );
    }

    // ===================================================
    // PENDING ORDERS
    // ===================================================

    if (
      activeView ===
      "pending"
    ) {
      return (
        <PendingOrdersTab
          isLoading={
            isLoading
          }

          pendingTrackerRows={
            pendingTrackerRows
          }

          isSubmitting={
            isSubmitting
          }

          onMarkComplete={(
            rowId
          ) =>
            handleTrackerStatusChange(
              rowId,
              "Completed"
            )
          }

          onDeleteTracker={
            confirmDeleteTrackerRow
          }

          pendingTrackerTotal={
            pendingTrackerTotal
          }
        />
      );
    }

    // ===================================================
    // EXPENSES
    // ===================================================

    if (
      activeView ===
      "expenses"
    ) {
      return (
        <ExpensesTab
          expenses={
            expenses
          }

          setExpenses={
            setExpenses
          }

          expensesTotal={
            expensesTotal
          }

          isSubmitting={
            isSubmitting
          }

          onSubmit={
            handleExpensesSubmit
          }
        />
      );
    }

    // ===================================================
    // TUITION
    // ===================================================

    if (
      activeView ===
      "tuition"
    ) {
      return (
        <TuitionTargetTab
          summaryTrackerTotal={
            summaryTrackerTotal
          }

          summaryExpensesTotal={
            summaryExpensesTotal
          }
        />
      );
    }

    // ===================================================
    // TRACKER
    // ===================================================

    return (
      <TrackerTab
        tracker={
          tracker
        }

        setTracker={
          setTracker
        }

        trackerTotal={
          trackerTotal
        }

        isSubmitting={
          isSubmitting
        }

        onSubmit={
          handleTrackerSubmit
        }
      />
    );
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div
      className={`min-h-screen p-4 transition-colors duration-300 sm:p-6 md:p-8 ${
        darkMode
          ? "bg-gray-950 text-white"
          : "bg-[#f8f5f2] text-gray-900"
      }`}
    >
      <div
        className={`mx-auto max-w-4xl rounded-3xl border p-5 shadow-sm transition-colors duration-300 sm:p-6 md:p-8 ${
          darkMode
            ? "border-gray-700 bg-gray-900"
            : "border-gray-200 bg-white"
        }`}
      >
        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className={`text-2xl font-bold sm:text-3xl ${
                darkMode
                  ? "text-[#e8bd85]"
                  : "text-[#5A3A2E]"
              }`}
            >
              {currentView.title}
            </h1>

            <p
              className={`mt-2 text-base sm:mt-3 sm:text-lg ${
                darkMode
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              {
                currentView.description
              }
            </p>
          </div>

          {/* DARK / LIGHT MODE */}

          <button
            type="button"
            onClick={() =>
              setDarkMode(
                (previous) =>
                  !previous
              )
            }
            className={`w-fit shrink-0 rounded-lg px-4 py-2 font-medium text-white transition ${
              darkMode
                ? "bg-[#d8a66b] hover:bg-[#c38f54]"
                : "bg-[#5A3A2E] hover:bg-[#43291f]"
            }`}
          >
            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>
        </div>

        {/* ERROR MESSAGE */}

        {errorMessage ? (
          <div
            className={`mt-4 rounded-xl border p-3 text-sm ${
              darkMode
                ? "border-amber-700 bg-amber-950 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {
              errorMessage
            }
          </div>
        ) : null}

        {/* ACTIVE COMPONENT */}

        <div className="mt-6">
          {
            renderActiveTab()
          }
        </div>
      </div>
    </div>
  );
}