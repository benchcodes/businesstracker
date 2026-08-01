import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard({ activeView }) {
  const [tracker, setTracker] = useState({
    date: "",
    name: "",
    orderQuantity: "",
    price: "",
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
        supabase.from("tracker").select("*").order("date", { ascending: false }),
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
  const summaryTracker = trackerRows[0] || submittedTracker || tracker;
  const summaryExpenses = expenseRows[0] || submittedExpenses || expenses;
  const trackerTotal = useMemo(
    () => Number(activeTracker.orderQuantity || 0) * Number(activeTracker.price || 0),
    [activeTracker.orderQuantity, activeTracker.price]
  );
  const expensesTotal = useMemo(() => Number(activeExpenses.price || 0), [activeExpenses.price]);
  const summaryTrackerTotal = useMemo(
    () => trackerRows.reduce((total, row) => total + Number(row.order_quantity || 0) * Number(row.price || 0), 0),
    [trackerRows]
  );
  const summaryExpensesTotal = useMemo(
    () => expenseRows.reduce((total, row) => total + Number(row.price || 0), 0),
    [expenseRows]
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
      setTracker({ date: "", name: "", orderQuantity: "", price: "", status: "Pending" });
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

  return (
    <div className="min-h-screen bg-[#f8f5f2] p-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-[#5A3A2E]">
          {activeView === "expenses"
            ? "Expenses"
            : activeView === "summary"
            ? "Summary"
            : "Tracker"}
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          {activeView === "expenses"
            ? "Record product expenses and keep your costs organized."
            : activeView === "summary"
            ? "Review the tracker and expense data in a spreadsheet-style summary."
            : "Log daily orders and calculate the total price for each entry."}
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {errorMessage}
          </div>
        ) : null}

        {activeView === "summary" ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
              <h2 className="text-xl font-semibold text-[#5A3A2E]">Tracker</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#f8f5f2]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Qty</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Total</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-4 py-3" colSpan="7">
                          Loading records...
                        </td>
                      </tr>
                    ) : trackerRows.length > 0 ? (
                      trackerRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-3">{row.date || "—"}</td>
                          <td className="px-4 py-3">{row.name || "—"}</td>
                          <td className="px-4 py-3">{row.order_quantity ?? "—"}</td>
                          <td className="px-4 py-3">₱{Number(row.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 font-semibold text-[#5A3A2E]">₱{(Number(row.order_quantity || 0) * Number(row.price || 0)).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <select
                              value={row.status || "Pending"}
                              onChange={(e) => handleTrackerStatusChange(row.id, e.target.value)}
                              disabled={isSubmitting}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none focus:border-[#d8a66b] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteTrackerRow(row.id)}
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
                        <td className="px-4 py-3" colSpan="7">
                          No tracker rows yet.
                        </td>
                      </tr>
                    )}
                    <tr className="bg-[#f8f5f2]">
                      <td className="px-4 py-3 font-semibold text-[#5A3A2E]" colSpan="7">
                        Status: {summaryTracker.status || "Pending"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
              <h2 className="text-xl font-semibold text-[#5A3A2E]">Expenses</h2>
              <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#f8f5f2]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Total</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#5A3A2E]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-4 py-3" colSpan="5">
                          Loading records...
                        </td>
                      </tr>
                    ) : expenseRows.length > 0 ? (
                      expenseRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-3">{row.date || "—"}</td>
                          <td className="px-4 py-3">{row.product || "—"}</td>
                          <td className="px-4 py-3">₱{Number(row.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 font-semibold text-[#5A3A2E]">₱{Number(row.price || 0).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteExpenseRow(row.id)}
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
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">
              <h2 className="text-xl font-semibold text-[#5A3A2E]">Profit</h2>
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-lg font-semibold text-[#5A3A2E]">
                ₱{(summaryTrackerTotal - summaryExpensesTotal).toFixed(2)}
              </div>
            </div>
          </div>
        ) : activeView === "expenses" ? (
          <form className="mt-8 space-y-6" onSubmit={handleExpensesSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Date</span>
                <input
                  type="date"
                  value={expenses.date}
                  onChange={(e) => setExpenses({ ...expenses, date: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d8a66b]"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Product</span>
                <input
                  type="text"
                  value={expenses.product}
                  onChange={(e) => setExpenses({ ...expenses, product: e.target.value })}
                  placeholder="Enter product"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d8a66b]"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Price</span>
                <input
                  type="number"
                  min="0"
                  value={expenses.price}
                  onChange={(e) => setExpenses({ ...expenses, price: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d8a66b]"
                />
              </label>
            </div>

            <div className="rounded-2xl bg-[#f8f5f2] p-5">
              <p className="text-sm font-medium text-gray-600">Total expenses</p>
              <p className="mt-2 text-2xl font-bold text-[#5A3A2E]">₱{expensesTotal.toFixed(2)}</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#d8a66b] px-4 py-3 font-semibold text-white transition hover:bg-[#c9944d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Submit Expense"}
            </button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleTrackerSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Date</span>
                <input
                  type="date"
                  value={tracker.date}
                  onChange={(e) => setTracker({ ...tracker, date: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d8a66b]"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Name</span>
                <input
                  type="text"
                  value={tracker.name}
                  onChange={(e) => setTracker({ ...tracker, name: e.target.value })}
                  placeholder="Customer or order name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d8a66b]"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Order quantity</span>
                <input
                  type="number"
                  min="0"
                  value={tracker.orderQuantity}
                  onChange={(e) => setTracker({ ...tracker, orderQuantity: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d8a66b]"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Price</span>
                <input
                  type="number"
                  min="0"
                  value={tracker.price}
                  onChange={(e) => setTracker({ ...tracker, price: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d8a66b]"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Status</span>
                <select
                  value={tracker.status}
                  onChange={(e) => setTracker({ ...tracker, status: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#d8a66b]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>

            <div className="rounded-2xl bg-[#f8f5f2] p-5">
              <p className="text-sm font-medium text-gray-600">Total price</p>
              <p className="mt-2 text-2xl font-bold text-[#5A3A2E]">₱{trackerTotal.toFixed(2)}</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#d8a66b] px-4 py-3 font-semibold text-white transition hover:bg-[#c9944d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Submit Tracker"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}