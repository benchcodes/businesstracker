import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

import TrackerTab from "./tabs/TrackerTab";
import PendingOrdersTab from "./tabs/PendingOrdersTab";
import ExpensesTab from "./tabs/ExpensesTab";
import SummaryTab from "./tabs/SummaryTab";
import TuitionTargetTab from "./tabs/TuitionTargetTab";

export default function Dashboard({ activeView }) {
  // =========================
  // TRACKER STATE
  // =========================
  const [tracker, setTracker] = useState({
    date: "",
    name: "",
    orderQuantity: "",
    price: "",
    notes: "",
    status: "Pending",
  });

  // =========================
  // EXPENSE STATE
  // =========================
  const [expenses, setExpenses] = useState({
    date: "",
    product: "",
    price: "",
  });

  // =========================
  // DATA STATE
  // =========================
  const [submittedTracker, setSubmittedTracker] = useState(null);
  const [submittedExpenses, setSubmittedExpenses] = useState(null);

  const [trackerRows, setTrackerRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);

  // =========================
  // SUMMARY STATE
  // =========================
  const [summaryRange, setSummaryRange] = useState("overall");
  const [summaryDate, setSummaryDate] = useState("");

  // =========================
  // UI STATE
  // =========================
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================
  // DARK MODE
  // =========================
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("churrozi-dark-mode");

    // Dark mode by default
    if (savedMode === null) {
      return true;
    }

    return savedMode === "true";
  });

  // Apply dark mode to entire application
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

  // =========================
  // LOAD DATA
  // =========================
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
        { data: trackerData, error: trackerError },
        { data: expenseData, error: expenseError },
      ] = await Promise.all([
        supabase
          .from("tracker")
          .select("*")
          .order("created_at", {
            ascending: true,
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

      setTrackerRows(trackerData || []);
      setExpenseRows(expenseData || []);
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

  // =========================
  // ACTIVE FORM DATA
  // =========================
  const activeTracker =
    submittedTracker || tracker;

  const activeExpenses =
    submittedExpenses || expenses;

  // =========================
  // TRACKER TOTAL
  // =========================
  const trackerTotal = useMemo(() => {
    const quantity = Number(
      activeTracker.orderQuantity ??
        activeTracker.order_quantity ??
        0
    );

    const price = Number(
      activeTracker.price ?? 0
    );

    return quantity * price;
  }, [
    activeTracker.orderQuantity,
    activeTracker.order_quantity,
    activeTracker.price,
  ]);

  // =========================
  // EXPENSE TOTAL
  // =========================
  const expensesTotal = useMemo(() => {
    return Number(
      activeExpenses.price ?? 0
    );
  }, [activeExpenses.price]);

  // =========================
  // DISPLAYED TRACKER ROWS
  // =========================
  const displayedTrackerRows = useMemo(() => {
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

  // =========================
  // DISPLAYED EXPENSE ROWS
  // =========================
  const displayedExpenseRows = useMemo(() => {
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

  // =========================
  // PENDING ORDERS
  // =========================
  const pendingTrackerRows = useMemo(() => {
    return trackerRows.filter(
      (row) =>
        (row.status || "Pending") ===
        "Pending"
    );
  }, [trackerRows]);

  // =========================
  // COMPLETED ORDERS
  // =========================
  const completedTrackerRows = useMemo(() => {
    return displayedTrackerRows.filter(
      (row) =>
        (row.status || "Pending") ===
        "Completed"
    );
  }, [displayedTrackerRows]);

  // =========================
  // PENDING TOTAL
  // =========================
  const pendingTrackerTotal = useMemo(() => {
    return pendingTrackerRows.reduce(
      (total, row) =>
        total +
        Number(
          row.order_quantity || 0
        ) *
          Number(row.price || 0),
      0
    );
  }, [pendingTrackerRows]);

  // =========================
  // SUMMARY SALES TOTAL
  // =========================
  const summaryTrackerTotal = useMemo(() => {
    return completedTrackerRows.reduce(
      (total, row) =>
        total +
        Number(
          row.order_quantity || 0
        ) *
          Number(row.price || 0),
      0
    );
  }, [completedTrackerRows]);

  // =========================
  // SUMMARY EXPENSE TOTAL
  // =========================
  const summaryExpensesTotal = useMemo(() => {
    return displayedExpenseRows.reduce(
      (total, row) =>
        total +
        Number(row.price || 0),
      0
    );
  }, [displayedExpenseRows]);

  // =========================
  // AVAILABLE CAPITAL
  // =========================
  const availableCapital = useMemo(() => {
    // Overall capital
    if (!summaryDate) {
      const totalSales = trackerRows
        .filter(
          (row) =>
            row.status === "Completed"
        )
        .reduce(
          (total, row) =>
            total +
            Number(
              row.order_quantity || 0
            ) *
              Number(row.price || 0),
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
            row.status === "Completed" &&
            new Date(row.date) <
              selectedDate
        )
        .reduce(
          (total, row) =>
            total +
            Number(
              row.order_quantity || 0
            ) *
              Number(row.price || 0),
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

  // =========================
  // COUNTS
  // =========================
  const pendingOrdersCount =
    pendingTrackerRows.length;

  const completedOrdersCount =
    completedTrackerRows.length;

  // =========================
  // TRACKER SUBMIT
  // =========================
  const handleTrackerSubmit = async (
    event
  ) => {
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
      !tracker.price
    ) {
      setErrorMessage(
        "Fill in all tracker fields before saving."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        date: tracker.date,
        name: tracker.name,
        order_quantity: Number(
          tracker.orderQuantity
        ),
        price: Number(
          tracker.price || 0
        ),
        notes:
          tracker.notes?.trim() || null,
        status: tracker.status,
      };

      const { error } =
        await supabase
          .from("tracker")
          .insert([payload])
          .select();

      if (error) {
        throw error;
      }

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("tracker")
        .select("*")
        .order("date", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setTrackerRows(data || []);

      setSubmittedTracker(
        data?.[0] || payload
      );

      setTracker({
        date: "",
        name: "",
        orderQuantity: "",
        price: "",
        notes: "",
        status: "Pending",
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(
        `Unable to save tracker entry: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // EXPENSE SUBMIT
  // =========================
  const handleExpensesSubmit = async (
    event
  ) => {
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
        product: expenses.product,
        price: Number(
          expenses.price || 0
        ),
      };

      const { error } =
        await supabase
          .from("expenses")
          .insert([payload])
          .select();

      if (error) {
        throw error;
      }

      const {
        data,
        error: fetchError,
      } = await supabase
        .from("expenses")
        .select("*")
        .order("date", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setExpenseRows(data || []);

      setSubmittedExpenses(
        data?.[0] || payload
      );

      setExpenses({
        date: "",
        product: "",
        price: "",
      });
    } catch (error) {
      console.error(error);

      setErrorMessage(
        `Unable to save expense entry: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // DELETE TRACKER
  // =========================
  const handleDeleteTrackerRow = async (
    rowId
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
      const { error } =
        await supabase
          .from("tracker")
          .delete()
          .eq("id", rowId);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        `Unable to delete tracker entry: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // CHANGE TRACKER STATUS
  // =========================
  const handleTrackerStatusChange = async (
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
      const { error } =
        await supabase
          .from("tracker")
          .update({ status })
          .eq("id", rowId);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        `Unable to update tracker status: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // DELETE EXPENSE
  // =========================
  const handleDeleteExpenseRow = async (
    rowId
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
      const { error } =
        await supabase
          .from("expenses")
          .delete()
          .eq("id", rowId);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        `Unable to delete expense entry: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // CONFIRM DELETE TRACKER
  // =========================
  const confirmDeleteTrackerRow = (
    row
  ) => {
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

  // =========================
  // CONFIRM DELETE EXPENSE
  // =========================
  const confirmDeleteExpenseRow = (
    row
  ) => {
    const label = row?.product
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

  // =========================
  // VIEW META
  // =========================
  const viewMeta = {
    tracker: {
      title: "Tracker",
      description:
        "Log daily orders and calculate the total price for each entry.",
    },

    pending: {
      title: "Pending Orders",
      description:
        "Review all pending orders and mark them completed when done.",
    },

    expenses: {
      title: "Expenses",
      description:
        "Record product expenses and keep your costs organized.",
    },

    summary: {
      title: "Summary",
      description:
        "Review completed orders and expense data in a spreadsheet-style summary.",
    },

    tuition: {
      title: "Tuition Fee Target",
      description:
        "Track your tuition fee savings and monitor your progress.",
    },
  };

  const currentView =
    viewMeta[activeView] ||
    viewMeta.tracker;

  // =========================
  // RENDER ACTIVE TAB
  // =========================
  const renderActiveTab = () => {
    // SUMMARY
    if (activeView === "summary") {
      return (
        <SummaryTab
          summaryRange={summaryRange}
          setSummaryRange={
            setSummaryRange
          }
          summaryDate={summaryDate}
          setSummaryDate={
            setSummaryDate
          }
          isLoading={isLoading}
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

    // PENDING ORDERS
    if (activeView === "pending") {
      return (
        <PendingOrdersTab
          isLoading={isLoading}
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

    // EXPENSES
    if (activeView === "expenses") {
      return (
        <ExpensesTab
          expenses={expenses}
          setExpenses={setExpenses}
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

    // TUITION
    if (activeView === "tuition") {
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

    // TRACKER
    return (
      <TrackerTab
        tracker={tracker}
        setTracker={setTracker}
        trackerTotal={trackerTotal}
        isSubmitting={
          isSubmitting
        }
        onSubmit={
          handleTrackerSubmit
        }
      />
    );
  };

  // =========================
  // MAIN UI
  // =========================
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
              {currentView.description}
            </p>
          </div>

          {/* DARK / LIGHT MODE BUTTON */}
          <button
            type="button"
            onClick={() =>
              setDarkMode(
                (previous) => !previous
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
            {errorMessage}
          </div>
        ) : null}

        {/* ACTIVE COMPONENT */}
        <div className="mt-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}