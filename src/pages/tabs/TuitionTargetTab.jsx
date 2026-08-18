import { useEffect, useMemo, useState } from "react";
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
  // CHURROS PRICE
  // =========================
  const [churrosPrice, setChurrosPrice] = useState("");
  const [priceInput, setPriceInput] = useState("");

  // =========================
  // SAVINGS
  // =========================
  const [savingsDate, setSavingsDate] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");
  const [savingsNotes, setSavingsNotes] = useState("");

  const [savingsRows, setSavingsRows] = useState([]);

  // =========================
  // UI STATE
  // =========================
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =========================
  // LOAD TUITION SETTINGS
  // =========================
  const loadSettings = async () => {
    if (!supabase) {
      setErrorMessage("Supabase is not configured.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tuition_settings")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setTargetAmount(
          data.target_amount !== null &&
            data.target_amount !== undefined
            ? String(data.target_amount)
            : ""
        );

        setTargetDate(data.target_date || "");

        setChurrosPrice(
          data.churros_price !== null &&
            data.churros_price !== undefined
            ? String(data.churros_price)
            : ""
        );

        setPriceInput(
          data.churros_price !== null &&
            data.churros_price !== undefined
            ? String(data.churros_price)
            : ""
        );
      }
    } catch (error) {
      console.error("Unable to load tuition settings:", error);

      setErrorMessage(
        `Unable to load tuition settings: ${error.message}`
      );
    }
  };

  // =========================
  // LOAD SAVINGS
  // =========================
  const loadSavings = async () => {
    if (!supabase) {
      setErrorMessage("Supabase is not configured.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tuition_savings")
        .select("*")
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setSavingsRows(data || []);
    } catch (error) {
      console.error(
        "Unable to load tuition savings:",
        error
      );

      setErrorMessage(
        `Unable to load savings: ${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // LOAD EVERYTHING
  // =========================
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadSettings(),
        loadSavings(),
      ]);
    };

    loadData();
  }, []);

  // =========================
  // SAVE TUITION SETTINGS
  // =========================
  const saveSettings = async ({
    newTargetAmount = targetAmount,
    newTargetDate = targetDate,
    newChurrosPrice = churrosPrice,
  } = {}) => {
    if (!supabase) {
      setErrorMessage("Supabase is not configured.");
      return false;
    }

    try {
      const payload = {
        target_amount:
          newTargetAmount === ""
            ? 0
            : Number(newTargetAmount),

        target_date:
          newTargetDate || null,

        churros_price:
          newChurrosPrice === ""
            ? 0
            : Number(newChurrosPrice),
      };

      const { data, error } = await supabase
        .from("tuition_settings")
        .upsert(payload, {
          onConflict: "id",
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setTargetAmount(
          data.target_amount !== null &&
            data.target_amount !== undefined
            ? String(data.target_amount)
            : ""
        );

        setTargetDate(data.target_date || "");

        setChurrosPrice(
          data.churros_price !== null &&
            data.churros_price !== undefined
            ? String(data.churros_price)
            : ""
        );

        setPriceInput(
          data.churros_price !== null &&
            data.churros_price !== undefined
            ? String(data.churros_price)
            : ""
        );
      }

      return true;
    } catch (error) {
      console.error(
        "Unable to save tuition settings:",
        error
      );

      setErrorMessage(
        `Unable to save tuition settings: ${error.message}`
      );

      return false;
    }
  };

  // =========================
  // SAVE TUITION GOAL
  // =========================
  const saveGoal = async () => {
    if (
      targetAmount === "" &&
      targetDate === ""
    ) {
      setErrorMessage(
        "Enter a tuition target or target date first."
      );
      return;
    }

    setIsSavingSettings(true);
    setErrorMessage("");
    setSuccessMessage("");

    const success = await saveSettings({
      newTargetAmount: targetAmount,
      newTargetDate: targetDate,
      newChurrosPrice: churrosPrice,
    });

    if (success) {
      setSuccessMessage(
        "Tuition goal saved successfully."
      );
    }

    setIsSavingSettings(false);
  };

  // =========================
  // SAVE CHURROS PRICE
  // =========================
  const saveChurrosPrice = async () => {
    const price = Number(priceInput);

    if (!price || price <= 0) {
      setErrorMessage(
        "Enter a valid churros price greater than ₱0."
      );
      return;
    }

    setIsSavingSettings(true);
    setErrorMessage("");
    setSuccessMessage("");

    const success = await saveSettings({
      newTargetAmount: targetAmount,
      newTargetDate: targetDate,
      newChurrosPrice: price,
    });

    if (success) {
      setSuccessMessage(
        "Churros price saved successfully."
      );
    }

    setIsSavingSettings(false);
  };

  // =========================
  // TOTAL MANUAL SAVINGS
  // =========================
  const savingsHistoryTotal = useMemo(() => {
    return savingsRows.reduce(
      (total, row) =>
        total + Number(row.amount || 0),
      0
    );
  }, [savingsRows]);

  // =========================
  // AUTOMATIC PROFIT
  // =========================
  const automaticProfit = useMemo(() => {
    const sales = Number(
      summaryTrackerTotal || 0
    );

    const expenses = Number(
      summaryExpensesTotal || 0
    );

    return Math.max(
      sales - expenses,
      0
    );
  }, [
    summaryTrackerTotal,
    summaryExpensesTotal,
  ]);

  // =========================
  // TOTAL SAVED
  // =========================
  const totalSaved = useMemo(() => {
    return Math.max(
      automaticProfit +
        savingsHistoryTotal,
      0
    );
  }, [
    automaticProfit,
    savingsHistoryTotal,
  ]);

  // =========================
  // REMAINING TUITION
  // =========================
  const remainingTuition = useMemo(() => {
    const target = Number(
      targetAmount || 0
    );

    return Math.max(
      target - totalSaved,
      0
    );
  }, [
    targetAmount,
    totalSaved,
  ]);

  // =========================
  // PACKS NEEDED
  // =========================
  const packsNeeded = useMemo(() => {
    const price = Number(
      churrosPrice || 0
    );

    if (
      price <= 0 ||
      remainingTuition <= 0
    ) {
      return 0;
    }

    return Math.ceil(
      remainingTuition / price
    );
  }, [
    churrosPrice,
    remainingTuition,
  ]);

  // =========================
  // DAYS REMAINING
  // =========================
  const daysRemaining = useMemo(() => {
    if (!targetDate) {
      return 0;
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const deadline = new Date(
      `${targetDate}T00:00:00`
    );

    deadline.setHours(
      0,
      0,
      0,
      0
    );

    const difference =
      deadline.getTime() -
      today.getTime();

    if (difference < 0) {
      return 0;
    }

    return (
      Math.floor(
        difference /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  }, [targetDate]);

  // =========================
  // PACKS PER DAY
  // =========================
  const packsPerDay = useMemo(() => {
    if (
      packsNeeded <= 0 ||
      daysRemaining <= 0
    ) {
      return 0;
    }

    return Math.ceil(
      packsNeeded / daysRemaining
    );
  }, [
    packsNeeded,
    daysRemaining,
  ]);

  // =========================
  // PROGRESS
  // =========================
  const progress = useMemo(() => {
    const target = Number(
      targetAmount || 0
    );

    if (target <= 0) {
      return 0;
    }

    return Math.min(
      (totalSaved / target) * 100,
      100
    );
  }, [
    targetAmount,
    totalSaved,
  ]);

  // =========================
  // ADD MANUAL SAVING
  // =========================
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!supabase) {
      setErrorMessage(
        "Supabase is not configured."
      );
      return;
    }

    if (
      !savingsDate ||
      !savingsAmount
    ) {
      setErrorMessage(
        "Enter the date and amount."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = {
        date: savingsDate,
        amount: Number(
          savingsAmount
        ),
        notes:
          savingsNotes.trim() ||
          null,
      };

      const { error } =
        await supabase
          .from("tuition_savings")
          .insert([payload]);

      if (error) {
        throw error;
      }

      await loadSavings();

      setSavingsDate("");
      setSavingsAmount("");
      setSavingsNotes("");

      setSuccessMessage(
        "Savings saved successfully."
      );
    } catch (error) {
      console.error(
        "Unable to save tuition saving:",
        error
      );

      setErrorMessage(
        `Unable to save saving: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // DELETE SAVING
  // =========================
  const handleDelete = async (
    rowId
  ) => {
    if (!supabase) {
      setErrorMessage(
        "Supabase is not configured."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this saving?"
      );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } =
        await supabase
          .from("tuition_savings")
          .delete()
          .eq("id", rowId);

      if (error) {
        throw error;
      }

      await loadSavings();

      setSuccessMessage(
        "Saving deleted successfully."
      );
    } catch (error) {
      console.error(
        "Unable to delete saving:",
        error
      );

      setErrorMessage(
        `Unable to delete saving: ${error.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* =========================
          HEADER
      ========================= */}
      <div>
        <h2 className="text-2xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
          Tuition Fee Target
        </h2>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Track your tuition fee savings and
          monitor your progress.
        </p>
      </div>

      {/* =========================
          SUCCESS MESSAGE
      ========================= */}
      {successMessage && (
        <div className="rounded-xl border border-green-700 bg-green-950 p-3 text-sm text-green-300">
          {successMessage}
        </div>
      )}

      {/* =========================
          ERROR MESSAGE
      ========================= */}
      {errorMessage && (
        <div className="rounded-xl border border-red-700 bg-red-950 p-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* =========================
          TUITION TARGET
      ========================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">

        <h3 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Tuition Fee Target
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Set your tuition target and calculate
          how many packs of churros you need to sell.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">

          {/* TARGET */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Tuition Fee Target
            </label>

            <input
              type="number"
              min="0"
              value={targetAmount}
              onChange={(e) =>
                setTargetAmount(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="7160"
            />
          </div>

          {/* DATE */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Target Date
            </label>

            <input
              type="date"
              value={targetDate}
              onChange={(e) =>
                setTargetDate(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

        </div>

        <button
          type="button"
          onClick={saveGoal}
          disabled={isSavingSettings}
          className="mt-4 rounded-xl bg-[#d8a66b] px-5 py-3 font-semibold text-white transition hover:bg-[#c38f54] disabled:opacity-50"
        >
          {isSavingSettings
            ? "Saving..."
            : "💾 Save Tuition Goal"}
        </button>

      </div>

      {/* =========================
          CHURROS PRICE
      ========================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">

        <h3 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          🥨 Churros Sales Calculator
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Enter the selling price of one pack
          of churros.
        </p>

        <div className="mt-4">

          <label className="mb-2 block text-sm font-semibold">
            Churros Price per Pack
          </label>

          <div className="flex">

            <span className="flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 px-4 dark:border-gray-600 dark:bg-gray-800">
              ₱
            </span>

            <input
              type="number"
              min="1"
              value={priceInput}
              onChange={(e) =>
                setPriceInput(
                  e.target.value
                )
              }
              className="w-full rounded-r-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="69"
            />

          </div>

          <button
            type="button"
            onClick={saveChurrosPrice}
            disabled={isSavingSettings}
            className="mt-3 rounded-xl bg-[#d8a66b] px-5 py-2.5 font-semibold text-white transition hover:bg-[#c38f54] disabled:opacity-50"
          >
            {isSavingSettings
              ? "Saving..."
              : "💾 Save Churros Price"}
          </button>

        </div>

      </div>

      {/* =========================
          CALCULATOR RESULTS
      ========================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">

        <div className="grid gap-3 sm:grid-cols-3">

          {/* TARGET */}
          <div className="rounded-xl border border-gray-200 bg-[#f8f5f2] p-4 dark:border-gray-700 dark:bg-gray-800">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tuition Target
            </p>

            <p className="mt-2 text-2xl font-bold text-[#d8a66b]">
              ₱
              {Number(
                targetAmount || 0
              ).toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </p>

          </div>

          {/* SAVED */}
          <div className="rounded-xl border border-gray-200 bg-[#f8f5f2] p-4 dark:border-gray-700 dark:bg-gray-800">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Saved
            </p>

            <p className="mt-2 text-2xl font-bold text-green-500">
              ₱
              {totalSaved.toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </p>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Automatic profit + manual savings
            </p>

          </div>

          {/* REMAINING */}
          <div className="rounded-xl border border-gray-200 bg-[#f8f5f2] p-4 dark:border-gray-700 dark:bg-gray-800">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remaining Tuition
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              ₱
              {remainingTuition.toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </p>

          </div>

        </div>

        {/* =========================
            PACKS NEEDED
        ========================= */}
        <div className="mt-4 rounded-xl border border-green-700 bg-green-950 p-5">

          <p className="text-sm font-semibold text-green-400">
            Packs of Churros Needed
          </p>

          <div className="mt-2 flex items-baseline gap-2">

            <span className="text-4xl font-bold text-green-400">
              {packsNeeded}
            </span>

            <span className="text-lg text-green-300">
              packs
            </span>

          </div>

          <p className="mt-2 text-sm text-green-300">

            At ₱
            {Number(
              churrosPrice || 0
            ).toFixed(2)}
            {" "}per pack, you need to sell{" "}

            <strong>
              {packsNeeded} packs
            </strong>

            {" "}to cover the remaining{" "}

            <strong>
              ₱
              {remainingTuition.toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                }
              )}
            </strong>

            .

          </p>

        </div>

        {/* =========================
            DAYS + PACKS PER DAY
        ========================= */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">

          {/* DAYS */}
          <div className="rounded-xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-800">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Days Until Target
            </p>

            <p className="mt-2 text-3xl font-bold text-[#d8a66b]">
              {daysRemaining}

              <span className="ml-2 text-base font-medium">
                days
              </span>

            </p>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {targetDate
                ? `Target date: ${targetDate}`
                : "Set a target date first."}
            </p>

          </div>

          {/* PACKS PER DAY */}
          <div className="rounded-xl border border-blue-700 bg-blue-950 p-5">

            <p className="text-sm font-semibold text-blue-300">
              🥨 Packs Needed Per Day
            </p>

            <p className="mt-2 text-4xl font-bold text-blue-300">
              {packsPerDay}

              <span className="ml-2 text-lg font-medium">
                packs/day
              </span>

            </p>

            <p className="mt-2 text-sm text-blue-200">
              You need to sell at least{" "}

              <strong>
                {packsPerDay} packs per day
              </strong>

              {" "}to reach your tuition target
              before the target date.

            </p>

          </div>

        </div>

      </div>

      {/* =========================
          SAVINGS PROGRESS
      ========================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">

        <div className="flex items-center justify-between">

          <h3 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
            Savings Progress
          </h3>

          <span className="font-bold text-green-500">
            {progress.toFixed(0)}%
          </span>

        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">

          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

        <div className="mt-3 flex justify-between text-sm text-gray-500 dark:text-gray-400">

          <span>
            Saved: ₱
            {totalSaved.toLocaleString(
              "en-PH",
              {
                minimumFractionDigits: 2,
              }
            )}
          </span>

          <span>
            Target: ₱
            {Number(
              targetAmount || 0
            ).toLocaleString(
              "en-PH",
              {
                minimumFractionDigits: 2,
              }
            )}
          </span>

        </div>

        {targetDate && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Target date: {targetDate}
          </p>
        )}

      </div>

      {/* =========================
          ADD SAVINGS
      ========================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">

        <h3 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Add Savings
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Add a manual saving if you want to record
          money deposited directly toward tuition.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-5 space-y-4"
        >

          <div className="grid gap-4 sm:grid-cols-2">

            {/* DATE */}
            <div>

              <label className="mb-2 block text-sm font-semibold">
                Date
              </label>

              <input
                type="date"
                value={savingsDate}
                onChange={(e) =>
                  setSavingsDate(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />

            </div>

            {/* AMOUNT */}
            <div>

              <label className="mb-2 block text-sm font-semibold">
                Amount
              </label>

              <input
                type="number"
                min="0"
                value={savingsAmount}
                onChange={(e) =>
                  setSavingsAmount(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                placeholder="500"
              />

            </div>

          </div>

          {/* NOTES */}
          <div>

            <label className="mb-2 block text-sm font-semibold">
              Notes
            </label>

            <input
              type="text"
              value={savingsNotes}
              onChange={(e) =>
                setSavingsNotes(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Example: Savings from churros sales"
            />

          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#d8a66b] px-5 py-3 font-semibold text-white transition hover:bg-[#c38f54] disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : "💾 Save Savings"}
          </button>

        </form>

      </div>

      {/* =========================
          SAVINGS HISTORY
      ========================= */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">

        <h3 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Savings History
        </h3>

        <div className="mt-4 overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead className="bg-[#f8f5f2] dark:bg-gray-800">

              <tr>

                <th className="px-4 py-3 text-left">
                  Date
                </th>

                <th className="px-4 py-3 text-left">
                  Amount
                </th>

                <th className="px-4 py-3 text-left">
                  Notes
                </th>

                <th className="px-4 py-3 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {isLoading ? (

                <tr>

                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center"
                  >
                    Loading...
                  </td>

                </tr>

              ) : savingsRows.length === 0 ? (

                <tr>

                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No savings records yet.
                  </td>

                </tr>

              ) : (

                savingsRows.map(
                  (row) => (

                    <tr
                      key={row.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >

                      <td className="px-4 py-3">
                        {row.date}
                      </td>

                      <td className="px-4 py-3 font-semibold text-green-500">
                        ₱
                        {Number(
                          row.amount || 0
                        ).toLocaleString(
                          "en-PH",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {row.notes || "—"}
                      </td>

                      <td className="px-4 py-3">

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              row.id
                            )
                          }
                          disabled={
                            isSubmitting
                          }
                          className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400"
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}