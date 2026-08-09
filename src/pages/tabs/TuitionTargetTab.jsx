import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TuitionTargetTab({
  summaryTrackerTotal,
  summaryExpensesTotal,
}) {
  // =========================
  // TUITION GOAL
  // =========================
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // =========================
  // SAVINGS FORM
  // =========================
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // =========================
  // SAVINGS RECORDS
  // =========================
  const [rows, setRows] = useState([]);

  // =========================
  // LOADING / ERROR
  // =========================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // BUSINESS PROFIT
  // =========================
  const businessProfit = Math.max(
    Number(summaryTrackerTotal || 0) -
      Number(summaryExpensesTotal || 0),
    0
  );

  // =========================
  // LOAD SAVINGS DATA
  // =========================
  async function loadData() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("tuition_savings")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      setError("Failed to load savings data.");
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // LOAD TUITION GOAL
  // =========================
  useEffect(() => {
    const savedGoal = localStorage.getItem("tuitionGoal");

    if (savedGoal) {
      try {
        const goal = JSON.parse(savedGoal);

        setTargetAmount(goal.amount || "");
        setTargetDate(goal.date || "");
      } catch (error) {
        console.error("Invalid tuition goal:", error);
      }
    }
  }, []);

  // =========================
  // TOTAL SAVED
  // =========================
  const totalSaved = businessProfit;

  // =========================
  // GOAL COMPUTATION
  // =========================
  const target = Number(targetAmount || 0);

  const remaining = Math.max(
    target - totalSaved,
    0
  );

  const progress =
    target > 0
      ? Math.min((totalSaved / target) * 100, 100)
      : 0;

  // =========================
  // SAVE TUITION GOAL
  // =========================
  function saveGoal() {
    if (!targetAmount || !targetDate) {
      setError(
        "Please enter target amount and target date."
      );
      return;
    }

    setError("");

    localStorage.setItem(
      "tuitionGoal",
      JSON.stringify({
        amount: targetAmount,
        date: targetDate,
      })
    );

    alert("Tuition goal saved!");
  }

  // =========================
  // ADD SAVINGS RECORD
  // =========================
  async function handleSubmit(e) {
    e.preventDefault();

    if (!date || !amount) {
      setError(
        "Please complete the required fields."
      );
      return;
    }

    if (Number(amount) <= 0) {
      setError(
        "Amount must be greater than zero."
      );
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("tuition_savings")
      .insert([
        {
          date,
          amount: Number(amount),
          notes: notes.trim() || null,
        },
      ]);

    if (error) {
      console.error(error);
      setError("Failed to save savings record.");
      setLoading(false);
      return;
    }

    setDate("");
    setAmount("");
    setNotes("");

    await loadData();
  }

  // =========================
  // DELETE SAVINGS
  // =========================
  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Delete this savings record?"
    );

    if (!confirmDelete) return;

    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("tuition_savings")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setError("Failed to delete savings record.");
      setLoading(false);
      return;
    }

    await loadData();
  }

  return (
    <div className="space-y-6">

      {/* =========================
          ERROR MESSAGE
      ========================= */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-100 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* =========================
          TUITION GOAL
      ========================= */}
      <div className="space-y-4 rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 transition-colors dark:border-gray-700 dark:bg-gray-900">

        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Tuition Goal
        </h2>

        <input
          type="number"
          min="0"
          placeholder="Target Amount"
          value={targetAmount}
          onChange={(e) =>
            setTargetAmount(e.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
        />

        <input
          type="date"
          value={targetDate}
          onChange={(e) =>
            setTargetDate(e.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <button
          type="button"
          onClick={saveGoal}
          className="rounded-lg bg-[#5A3A2E] px-5 py-3 text-white transition hover:bg-[#6b4737]"
        >
          Save Goal
        </button>
      </div>

      {/* =========================
          TUITION SAVINGS
      ========================= */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 transition-colors dark:border-gray-700 dark:bg-gray-900"
      >

        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Tuition Savings
        </h2>

        <input
          type="date"
          value={date}
          onChange={(e) =>
            setDate(e.target.value)
          }
          required
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />

        <input
          type="number"
          min="0"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          required
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
        />

        <input
          type="text"
          placeholder="Notes"
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#5A3A2E] px-5 py-3 text-white transition hover:bg-[#6b4737] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Savings"}
        </button>
      </form>

      {/* =========================
          SAVINGS HISTORY
      ========================= */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-900">

        <div className="border-b border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
            Savings History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-gray-700 dark:text-gray-200">
                  Date
                </th>

                <th className="p-3 text-gray-700 dark:text-gray-200">
                  Amount
                </th>

                <th className="p-3 text-gray-700 dark:text-gray-200">
                  Notes
                </th>

                <th className="p-3 text-gray-700 dark:text-gray-200">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center text-gray-600 dark:text-gray-300"
                  >
                    Loading...
                  </td>
                </tr>
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-3 text-gray-700 dark:text-gray-200">
                      {row.date || "—"}
                    </td>

                    <td className="p-3 font-semibold text-green-700 dark:text-green-400">
                      ₱
                      {Number(
                        row.amount || 0
                      ).toFixed(2)}
                    </td>

                    <td className="p-3 text-gray-700 dark:text-gray-200">
                      {row.notes || "—"}
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(row.id)
                        }
                        className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No savings records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          TUITION PROGRESS
      ========================= */}
      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 transition-colors dark:border-gray-700 dark:bg-gray-900">

        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Tuition Progress
        </h2>

        {/* Progress Bar */}
        <div className="mt-5 h-6 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">

          <div
            className="h-full bg-green-600 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        {/* Progress Details */}
        <div className="mt-6 space-y-3">

          <div className="flex justify-between text-gray-700 dark:text-gray-200">
            <span>Target Amount</span>

            <span className="font-semibold">
              ₱{target.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-gray-700 dark:text-gray-200">
            <span>Target Date</span>

            <span className="font-semibold">
              {targetDate || "-"}
            </span>
          </div>

          <div className="flex justify-between text-gray-700 dark:text-gray-200">
            <span>Total Saved</span>

            <span className="font-semibold text-green-700 dark:text-green-400">
              ₱{totalSaved.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-gray-700 dark:text-gray-200">
            <span>Remaining</span>

            <span className="font-semibold text-red-600 dark:text-red-400">
              ₱{remaining.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-gray-700 dark:text-gray-200">
            <span>Progress</span>

            <span className="font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
              {progress.toFixed(1)}%
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}