import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const INITIAL_FORM = {
  stock: "",
  minimum_stock: "5",
};

export default function InventoryTab({
  inventoryRows,
  setInventoryRows,
  isLoading,
  setErrorMessage,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // =====================================================
  // LOAD INVENTORY
  // =====================================================

  const loadInventory = useCallback(async () => {
    if (!supabase) {
      setErrorMessage(
        "Supabase is not configured yet.",
      );
      return;
    }

    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("id", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setInventoryRows(data || []);
      setErrorMessage("");
    } catch (error) {
      console.error("Inventory load error:", error);

      setErrorMessage(
        `Unable to load inventory: ${error.message}`,
      );
    }
  }, [setErrorMessage, setInventoryRows]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const handleEdit = (item) => {
    setSelectedItem(item);

    setForm({
      stock: String(item.stock ?? 0),
      minimum_stock: String(
        item.minimum_stock ?? 5,
      ),
    });

    setErrorMessage("");
  };

  // =====================================================
  // CLOSE EDIT
  // =====================================================

  const handleCancel = () => {
    setSelectedItem(null);
    setForm(INITIAL_FORM);
  };

  // =====================================================
  // SAVE STOCK
  // =====================================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (!selectedItem) {
      return;
    }

    const stock = Math.max(
      0,
      Number(form.stock) || 0,
    );

    const minimumStock = Math.max(
      0,
      Number(form.minimum_stock) || 0,
    );

    setIsSaving(true);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("inventory")
        .update({
          stock,
          minimum_stock: minimumStock,
        })
        .eq("id", selectedItem.id);

      if (error) {
        throw error;
      }

      await loadInventory();

      handleCancel();
    } catch (error) {
      console.error("Inventory update error:", error);

      setErrorMessage(
        `Unable to update inventory: ${error.message}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // QUICK STOCK UPDATE
  // =====================================================

  const handleQuickUpdate = async (
    item,
    amount,
  ) => {
    if (!supabase) {
      setErrorMessage(
        "Supabase is not configured yet.",
      );
      return;
    }

    const currentStock =
      Number(item.stock) || 0;

    const newStock = Math.max(
      0,
      currentStock + amount,
    );

    setIsSaving(true);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("inventory")
        .update({
          stock: newStock,
        })
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadInventory();
    } catch (error) {
      console.error(
        "Quick inventory update error:",
        error,
      );

      setErrorMessage(
        `Unable to update stock: ${error.message}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // STOCK STATUS
  // =====================================================

  const getStockStatus = (item) => {
    const stock = Number(item.stock) || 0;
    const minimum =
      Number(item.minimum_stock) || 0;

    if (stock <= 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
      };
    }

    if (stock <= minimum) {
      return {
        label: "Low Stock",
        className:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
      };
    }

    return {
      label: "Stock OK",
      className:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    };
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="rounded-2xl bg-gradient-to-r from-[#5A3A2E] via-[#8B5E3C] to-[#D8A66B] p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">
          Packaging Inventory
        </h1>

        <p className="mt-2 text-amber-100">
          Manage your packaging stocks and monitor
          which items need to be restocked.
        </p>
      </div>

      {/* =================================================
          INVENTORY CARDS
      ================================================= */}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          Loading inventory...
        </div>
      ) : inventoryRows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          No inventory items found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inventoryRows.map((item) => {
            const status = getStockStatus(item);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
              >
                {/* ITEM HEADER */}

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {item.category ||
                        "Packaging"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                {/* CURRENT STOCK */}

                <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current Stock
                  </p>

                  <p className="mt-1 text-4xl font-bold text-[#5A3A2E] dark:text-white">
                    {Number(item.stock) || 0}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Minimum stock:{" "}
                    {Number(
                      item.minimum_stock,
                    ) || 0}
                  </p>
                </div>

                {/* QUICK UPDATE */}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={
                      isSaving ||
                      Number(item.stock) <= 0
                    }
                    onClick={() =>
                      handleQuickUpdate(
                        item,
                        -1,
                      )
                    }
                    className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    − 1
                  </button>

                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      handleQuickUpdate(
                        item,
                        1,
                      )
                    }
                    className="rounded-lg border border-green-300 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950"
                  >
                    + 1
                  </button>
                </div>

                {/* EDIT BUTTON */}

                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  disabled={isSaving}
                  className="mt-3 w-full rounded-lg bg-[#d8a66b] px-4 py-2 font-semibold text-white transition hover:bg-[#c9944d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Edit Stock
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================
          EDIT FORM
      ================================================= */}

      {selectedItem && (
        <div className="rounded-2xl border border-[#d8a66b] bg-[#f8f5f2] p-6 dark:border-[#8B5E3C] dark:bg-gray-900">
          {/* FORM HEADER */}

          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
                Edit {selectedItem.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update the current stock and
                minimum stock alert level.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="text-2xl font-bold text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              aria-label="Close edit form"
            >
              ×
            </button>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSave}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            {/* CURRENT STOCK */}

            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Current Stock</span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    stock: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#d8a66b] focus:ring-2 focus:ring-[#d8a66b]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </label>

            {/* MINIMUM STOCK */}

            <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>
                Minimum Stock Alert
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.minimum_stock}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    minimum_stock:
                      event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-[#d8a66b] focus:ring-2 focus:ring-[#d8a66b]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </label>

            {/* BUTTONS */}

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-[#d8a66b] px-4 py-3 font-semibold text-white transition hover:bg-[#c9944d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}