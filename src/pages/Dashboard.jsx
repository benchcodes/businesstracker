import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import TrackerTab from "./tabs/TrackerTab";
import PendingOrdersTab from "./tabs/PendingOrdersTab";
import ExpensesTab from "./tabs/ExpensesTab";
import SummaryTab from "./tabs/SummaryTab";
import TuitionTargetTab from "./tabs/TuitionTargetTab";

export default function Dashboard({ activeView }) {
  const [tracker, setTracker] = useState({
    date: "",
    name: "",
    orderQuantity: "",
    price: "",
    notes: "",
    status: "Pending",
  });

  const [expenses, setExpenses] = useState({
    date: "",
    product: "",
    price: "",
  });

  const [submittedTracker, setSubmittedTracker] = useState(null);
  const [submittedExpenses, setSubmittedExpenses] = useState(null);
  const [trackerRows, setTrackerRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);
  const [summaryRange, setSummaryRange] = useState("overall");
  const [summaryDate, setSummaryDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    if (!supabase) {
      setErrorMessage("Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment first.");
      setIsLoading(false);
      return;
    }

    try {
      const [{ data: trackerData, error: trackerError }, { data: expenseData, error: expenseError }] = await Promise.all([
        supabase.from("tracker").select("*").order("created_at", { ascending: true }),
        supabase.from("expenses").select("*").order("date", { ascending: false }),
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
      setErrorMessage(`Unable to load data from Supabase: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeTracker = submittedTracker || tracker;
  const activeExpenses = submittedExpenses || expenses;
  const trackerTotal = useMemo(() => {
    const qty = Number(activeTracker.orderQuantity ?? activeTracker.order_quantity ?? 0);
    const price = Number(activeTracker.price ?? 0);
    return qty * price;
  }, [activeTracker.orderQuantity, activeTracker.order_quantity, activeTracker.price]);

  const expensesTotal = useMemo(() => {
    return Number(activeExpenses.price ?? 0);
  }, [activeExpenses.price]);

  const displayedTrackerRows = useMemo(() => {
    if (summaryRange === "date" && summaryDate) {
      return trackerRows.filter((r) => (r.date || "").slice(0, 10) === summaryDate);
    }

    return trackerRows;
  }, [trackerRows, summaryRange, summaryDate]);

  const displayedExpenseRows = useMemo(() => {
    if (summaryRange === "date" && summaryDate) {
      return expenseRows.filter((r) => (r.date || "").slice(0, 10) === summaryDate);
    }

    return expenseRows;
  }, [expenseRows, summaryRange, summaryDate]);

  const pendingTrackerRows = useMemo(() => {
    return trackerRows.filter((row) => (row.status || "Pending") === "Pending");
  }, [trackerRows]);

  const completedTrackerRows = useMemo(() => {
    return displayedTrackerRows.filter((row) => (row.status || "Pending") === "Completed");
  }, [displayedTrackerRows]);

  const pendingTrackerTotal = useMemo(
    () => pendingTrackerRows.reduce((total, row) => total + Number(row.order_quantity || 0) * Number(row.price || 0), 0),
    [pendingTrackerRows]
  );

  const summaryTrackerTotal = useMemo(
    () => completedTrackerRows.reduce((total, row) => total + Number(row.order_quantity || 0) * Number(row.price || 0), 0),
    [completedTrackerRows]
  );

  const summaryExpensesTotal = useMemo(
    () => displayedExpenseRows.reduce((total, row) => total + Number(row.price || 0), 0),
    [displayedExpenseRows]
  );

  const handleTrackerSubmit = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    if (!tracker.date || !tracker.name || !tracker.orderQuantity || !tracker.price) {
      setErrorMessage("Fill in all tracker fields before saving.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        date: tracker.date,
        name: tracker.name,
        order_quantity: Number(tracker.orderQuantity),
        price: Number(tracker.price || 0),
        notes: tracker.notes?.trim() || null,
        status: tracker.status,
      };

      const { error } = await supabase.from("tracker").insert([payload]).select();

      if (error) {
        throw error;
      }

      const { data, error: fetchError } = await supabase.from("tracker").select("*").order("date", { ascending: false });
      if (fetchError) {
        throw fetchError;
      }

      setTrackerRows(data || []);
      setSubmittedTracker(data?.[0] || payload);
      setTracker({ date: "", name: "", orderQuantity: "", price: "", notes: "", status: "Pending" });
    } catch (error) {
      console.error(error);
      setErrorMessage(`Unable to save tracker entry: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpensesSubmit = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    if (!expenses.date || !expenses.product || !expenses.price) {
      setErrorMessage("Fill in all expense fields before saving.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        date: expenses.date,
        product: expenses.product,
        price: Number(expenses.price || 0),
      };

      const { error } = await supabase.from("expenses").insert([payload]).select();

      if (error) {
        throw error;
      }

      const { data, error: fetchError } = await supabase.from("expenses").select("*").order("date", { ascending: false });
      if (fetchError) {
        throw fetchError;
      }

      setExpenseRows(data || []);
      setSubmittedExpenses(data?.[0] || payload);
      setExpenses({ date: "", product: "", price: "" });
    } catch (error) {
      console.error(error);
      setErrorMessage(`Unable to save expense entry: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrackerRow = async (rowId) => {
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.from("tracker").delete().eq("id", rowId);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage(`Unable to delete tracker entry: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackerStatusChange = async (rowId, status) => {
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.from("tracker").update({ status }).eq("id", rowId);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage(`Unable to update tracker status: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpenseRow = async (rowId) => {
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.from("expenses").delete().eq("id", rowId);

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      setErrorMessage(`Unable to delete expense entry: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteTrackerRow = (row) => {
    const label = row?.name ? ` for ${row.name}` : "";
    const isConfirmed = window.confirm(`Are you sure you want to delete this tracker entry${label}?`);

    if (isConfirmed) {
      handleDeleteTrackerRow(row.id);
    }
  };

  const confirmDeleteExpenseRow = (row) => {
    const label = row?.product ? ` for ${row.product}` : "";
    const isConfirmed = window.confirm(`Are you sure you want to delete this expense entry${label}?`);

    if (isConfirmed) {
      handleDeleteExpenseRow(row.id);
    }
  };

  const viewMeta = {
    tracker: {
      title: "Tracker",
      description: "Log daily orders and calculate the total price for each entry.",
    },
    pending: {
      title: "Pending Orders",
      description: "Review all pending orders and mark them completed when done.",
    },
    expenses: {
      title: "Expenses",
      description: "Record product expenses and keep your costs organized.",
    },
    summary: {
      title: "Summary",
      description: "Review completed orders and expense data in a spreadsheet-style summary.",
    },
    tuition: {
      title: "Tuition Fee Target",
      description: "Track your tuition fee savings and monitor your progress.",
},
  };

  const currentView = viewMeta[activeView] || viewMeta.tracker;

  const renderActiveTab = () => {
    if (activeView === "summary") {
      return (
        <SummaryTab
          summaryRange={summaryRange}
          setSummaryRange={setSummaryRange}
          summaryDate={summaryDate}
          setSummaryDate={setSummaryDate}
          isLoading={isLoading}
          completedTrackerRows={completedTrackerRows}
          displayedExpenseRows={displayedExpenseRows}
          isSubmitting={isSubmitting}
          onDeleteTracker={confirmDeleteTrackerRow}
          onDeleteExpense={confirmDeleteExpenseRow}
          summaryTrackerTotal={summaryTrackerTotal}
          summaryExpensesTotal={summaryExpensesTotal}
        />
      );
    }

    if (activeView === "pending") {
      return (
        <PendingOrdersTab
          isLoading={isLoading}
          pendingTrackerRows={pendingTrackerRows}
          isSubmitting={isSubmitting}
          onMarkComplete={(rowId) => handleTrackerStatusChange(rowId, "Completed")}
          onDeleteTracker={confirmDeleteTrackerRow}
          pendingTrackerTotal={pendingTrackerTotal}
        />
      );
    }

    if (activeView === "expenses") {
      return (
        <ExpensesTab
          expenses={expenses}
          setExpenses={setExpenses}
          expensesTotal={expensesTotal}
          isSubmitting={isSubmitting}
          onSubmit={handleExpensesSubmit}
        />
      );
}

if (activeView === "tuition") {
  return <TuitionTargetTab />;
}

    return (
      <TrackerTab
        tracker={tracker}
        setTracker={setTracker}
        trackerTotal={trackerTotal}
        isSubmitting={isSubmitting}
        onSubmit={handleTrackerSubmit}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] p-8">
      <div className="mx-4 md:mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[#5A3A2E]">{currentView.title}</h1>
        <p className="mt-3 text-lg text-gray-600">
          {currentView.description}
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        ) : null}

        {renderActiveTab()}
      </div>
    </div>
  );
}