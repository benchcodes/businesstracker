import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

import TrackerTab from "./tabs/TrackerTab";
import PendingOrdersTab from "./tabs/PendingOrdersTab";
import ExpensesTab from "./tabs/ExpensesTab";
import SummaryTab from "./tabs/SummaryTab";
import TuitionTargetTab from "./tabs/TuitionTargetTab";
import InventoryTab from "./tabs/InventoryTab";
import SavingsTab from "./tabs/SavingsTab";

// =====================================================
// CONSTANTS
// =====================================================

const ADDITIONAL_DIP_PRICE = 10;

// =====================================================
// DEFAULT VALUES
// =====================================================

const DEFAULT_TRACKER = {
  date: "",
  name: "",
  orderQuantity: "",
  price: "",
  notes: "",
  status: "Pending",

  product: "Regular Churros",
  variantPcs: 4,
  productPrice: 49,

  dip: "Matcha",
  additionalDips: "",
  additionalDipType: "Chocolate",
};

const DEFAULT_EXPENSES = {
  date: "",
  product: "",
  price: "",
};

const DEFAULT_SAVINGS = {
  date: "",
  amount: "",
  notes: "",
};

export default function Dashboard({ activeView }) {
  // =====================================================
  // FORM STATE
  // =====================================================

  const [tracker, setTracker] = useState(DEFAULT_TRACKER);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [savings, setSavings] = useState(DEFAULT_SAVINGS);

  // =====================================================
  // DATA STATE
  // =====================================================

  const [trackerRows, setTrackerRows] = useState([]);
  const [expenseRows, setExpenseRows] = useState([]);
  const [savingsRows, setSavingsRows] = useState([]);
  const [inventoryRows, setInventoryRows] = useState([]);

  // =====================================================
  // SUMMARY STATE
  // =====================================================

  const [summaryRange, setSummaryRange] = useState("overall");
  const [summaryDate, setSummaryDate] = useState("");

  // =====================================================
  // UI STATE
  // =====================================================

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =====================================================
  // DARK MODE
  // =====================================================

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem(
      "churrozi-dark-mode",
    );

    return savedMode === null
      ? true
      : savedMode === "true";
  });

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode,
    );

    localStorage.setItem(
      "churrozi-dark-mode",
      String(darkMode),
    );
  }, [darkMode]);

  // =====================================================
  // LOAD ALL DATA
  // =====================================================

  const loadData = useCallback(async () => {
    if (!supabase) {
      setErrorMessage(
        "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment first.",
      );

      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [
        trackerResult,
        expenseResult,
        inventoryResult,
        savingsResult,
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

        supabase
          .from("inventory")
          .select("*")
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("savings")
          .select("*")
          .order("date", {
            ascending: false,
          }),
      ]);

      const firstError = [
        trackerResult.error,
        expenseResult.error,
        inventoryResult.error,
        savingsResult.error,
      ].find(Boolean);

      if (firstError) {
        throw firstError;
      }

      setTrackerRows(trackerResult.data || []);
      setExpenseRows(expenseResult.data || []);
      setInventoryRows(inventoryResult.data || []);
      setSavingsRows(savingsResult.data || []);

      setErrorMessage("");
    } catch (error) {
      console.error(error);

      setErrorMessage(
        `Unable to load data from Supabase: ${error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // =====================================================
  // GET ORDER TOTAL
  //
  // SALES FORMULA:
  //
  // Product Sales =
  // order quantity × base product price
  //
  // Additional Dips =
  // additional dips × ₱10
  //
  // Final Order Total =
  // product sales + additional dip charges
  // =====================================================

  const getOrderTotal = useCallback((row) => {
  if (!row) {
    return 0;
  }

  const quantity = Number(
    row.order_quantity ??
      row.orderQuantity ??
      1,
  );

  const productPrice = Number(
    row.product_price ??
      row.productPrice ??
      0,
  );

  const price = Number(row.price || 0);

  const total = Number(row.total || 0);

  const orderTotal = Number(
    row.order_total || 0,
  );

  const orderTotalCamel = Number(
    row.orderTotal || 0,
  );

  const validQuantity =
    Number.isFinite(quantity) &&
    quantity > 0
      ? quantity
      : 1;

  // =====================================================
  // PRIORITY:
  // Quantity × Product Price
  //
  // Example:
  // 2 × ₱69 = ₱138
  // =====================================================

  if (
    Number.isFinite(productPrice) &&
    productPrice > 0
  ) {
    return (
      validQuantity * productPrice
    );
  }

  // =====================================================
  // LEGACY FALLBACK
  // =====================================================

  if (
    Number.isFinite(total) &&
    total > 0
  ) {
    return total;
  }

  if (
    Number.isFinite(orderTotal) &&
    orderTotal > 0
  ) {
    return orderTotal;
  }

  if (
    Number.isFinite(orderTotalCamel) &&
    orderTotalCamel > 0
  ) {
    return orderTotalCamel;
  }

  // Last fallback
  if (
    Number.isFinite(price) &&
    price > 0
  ) {
    return price;
  }

  return 0;
}, []);

  // =====================================================
  // NORMALIZE TRACKER ROWS
  // =====================================================

  const normalizeTrackerRow = useCallback(
    (row) => {
      const effectiveTotal =
        getOrderTotal(row);

      return {
        ...row,

        effectivePrice: effectiveTotal,
        effectiveTotal,

        originalPrice:
          row.price ?? 0,

        originalTotal:
          row.total ?? null,
      };
    },
    [getOrderTotal],
  );

  // =====================================================
  // FORM TOTALS
  // =====================================================

  const trackerTotal = useMemo(() => {
    const quantity = Number(
      tracker.orderQuantity || 0,
    );

    const basePrice = Number(
      tracker.productPrice ||
        tracker.price ||
        0,
    );

    const additionalDips = Number(
      tracker.additionalDips || 0,
    );

    const productSales =
      quantity * basePrice;

    const additionalDipSales =
      additionalDips *
      ADDITIONAL_DIP_PRICE;

    const total =
      productSales +
      additionalDipSales;

    return Number.isFinite(total)
      ? total
      : 0;
  }, [
    tracker.orderQuantity,
    tracker.productPrice,
    tracker.price,
    tracker.additionalDips,
  ]);

  const expensesTotal = useMemo(() => {
    const value = Number(
      expenses.price || 0,
    );

    return Number.isFinite(value)
      ? value
      : 0;
  }, [expenses.price]);

  const savingsTotal = useMemo(() => {
    const value = Number(
      savings.amount || 0,
    );

    return Number.isFinite(value)
      ? value
      : 0;
  }, [savings.amount]);

  // =====================================================
  // DATE FILTER
  // =====================================================

  const filterBySummaryDate = useCallback(
    (rows) => {
      if (
        summaryRange !== "date" ||
        !summaryDate
      ) {
        return rows;
      }

      return rows.filter(
        (row) =>
          String(
            row.date || "",
          ).slice(0, 10) ===
          summaryDate,
      );
    },
    [summaryRange, summaryDate],
  );

  // =====================================================
  // DISPLAYED TRACKER ROWS
  // =====================================================

  const displayedTrackerRows = useMemo(() => {
    const filtered =
      filterBySummaryDate(
        trackerRows,
      );

    return filtered.map(
      normalizeTrackerRow,
    );
  }, [
    filterBySummaryDate,
    normalizeTrackerRow,
    trackerRows,
  ]);

  // =====================================================
  // DISPLAYED EXPENSE ROWS
  // =====================================================

  const displayedExpenseRows =
    useMemo(() => {
      return filterBySummaryDate(
        expenseRows,
      );
    }, [
      filterBySummaryDate,
      expenseRows,
    ]);

  // =====================================================
  // DISPLAYED SAVINGS ROWS
  // =====================================================

  const displayedSavingsRows =
    useMemo(() => {
      return filterBySummaryDate(
        savingsRows,
      );
    }, [
      filterBySummaryDate,
      savingsRows,
    ]);

  // =====================================================
  // PENDING ORDERS
  // =====================================================

  const pendingTrackerRows =
    useMemo(() => {
      return trackerRows
        .filter(
          (row) =>
            (row.status ||
              "Pending") ===
            "Pending",
        )
        .map(normalizeTrackerRow);
    }, [
      normalizeTrackerRow,
      trackerRows,
    ]);

  // =====================================================
  // COMPLETED ORDERS
  // =====================================================

  const completedTrackerRows =
    useMemo(() => {
      return displayedTrackerRows.filter(
        (row) =>
          (row.status ||
            "Pending") ===
          "Completed",
      );
    }, [displayedTrackerRows]);

  // =====================================================
  // PENDING TOTAL
  // =====================================================

  const pendingTrackerTotal =
    useMemo(() => {
      return pendingTrackerRows.reduce(
        (total, row) =>
          total +
          row.effectiveTotal,
        0,
      );
    }, [pendingTrackerRows]);

  // =====================================================
  // TOTAL SALES
  // =====================================================

  const summaryTrackerTotal =
    useMemo(() => {
      return completedTrackerRows.reduce(
        (total, row) =>
          total +
          row.effectiveTotal,
        0,
      );
    }, [completedTrackerRows]);

  // =====================================================
  // TOTAL EXPENSES
  // =====================================================

  const summaryExpensesTotal =
    useMemo(() => {
      return displayedExpenseRows.reduce(
        (total, row) => {
          const amount = Number(
            row.price || 0,
          );

          return (
            total +
            (Number.isFinite(amount)
              ? amount
              : 0)
          );
        },
        0,
      );
    }, [displayedExpenseRows]);

  // =====================================================
  // TOTAL SAVINGS
  //
  // IMPORTANT:
  // Savings are actual records from
  // the savings table.
  //
  // Existing ₱464 stays ₱464.
  // =====================================================

  const summarySavingsTotal =
    useMemo(() => {
      return displayedSavingsRows.reduce(
        (total, row) => {
          const amount = Number(
            row.amount || 0,
          );

          return (
            total +
            (Number.isFinite(amount)
              ? amount
              : 0)
          );
        },
        0,
      );
    }, [displayedSavingsRows]);

  // =====================================================
  // NET PROFIT
  //
  // PROFIT = SALES - EXPENSES
  //
  // Savings are NOT expenses.
  // =====================================================

  const summaryProfit = useMemo(() => {
    const sales = Number(
      summaryTrackerTotal || 0,
    );

    const expenses = Number(
      summaryExpensesTotal || 0,
    );

    const profit =
      sales - expenses;

    return Number.isFinite(profit)
      ? profit
      : 0;
  }, [
    summaryTrackerTotal,
    summaryExpensesTotal,
  ]);

  // =====================================================
  // AVAILABLE MONEY
  //
  // AVAILABLE MONEY =
  // NET PROFIT - TOTAL SAVINGS
  // =====================================================

  const availableMoney = useMemo(() => {
      const profit = Number(
        summaryProfit || 0,
      );

      const savings = Number(
        summarySavingsTotal || 0,
      );

      return Math.max(
        0,
        profit - savings,
      );
    }, [
      summaryProfit,
      summarySavingsTotal,
    ]);

  // =====================================================
  // BUSINESS CAPITAL
  //
  // BUSINESS CAPITAL =
  // NET PROFIT
  //
  // Savings do NOT reduce profit.
  // =====================================================

  const availableCapital =
    useMemo(() => {
      const profit = Number(
        summaryProfit || 0,
      );

      return Number.isFinite(profit)
        ? Math.max(0, profit)
        : 0;
    }, [summaryProfit]);

  // =====================================================
  // COUNTS
  // =====================================================

  const pendingOrdersCount =
    pendingTrackerRows.length;

  const completedOrdersCount =
    completedTrackerRows.length;

  // =====================================================
  // INVENTORY HELPER
  // =====================================================

  const findInventoryItem =
    useCallback(
      (inventory, itemName) => {
        const normalizedName =
          String(itemName)
            .trim()
            .toLowerCase();

        return inventory.find(
          (item) =>
            String(item.name)
              .trim()
              .toLowerCase() ===
            normalizedName,
        );
      },
      [],
    );

  // =====================================================
  // INVENTORY DEDUCTIONS
  // =====================================================

  const getInventoryDeductions =
    useCallback((order) => {
      const quantity = Math.max(
        1,
        Number(
          order.orderQuantity ??
            order.order_quantity ??
            1,
        ),
      );

      const additionalDips =
        Math.max(
          0,
          Number(
            order.additionalDips ??
              order.additional_dips ??
              0,
          ),
        );

      const product =
        order.product || "";

      const deductions = [];

      if (
        product ===
        "Regular Churros"
      ) {
        deductions.push(
          {
            name: "Regular Size Pack",
            quantity,
          },
          {
            name: "Plastic",
            quantity,
          },
          {
            name: "Sticker",
            quantity,
          },
          {
            name: "Dip Pack",
            quantity,
          },
        );
      }

      if (
        product ===
        "Churros Bites"
      ) {
        deductions.push(
          {
            name: "Bites Pack",
            quantity,
          },
          {
            name: "Plastic",
            quantity,
          },
          {
            name: "Sticker",
            quantity,
          },
          {
            name: "Dip Pack",
            quantity,
          },
        );
      }

      if (
        product ===
        "Premium Churros w/ Alcapone"
      ) {
        deductions.push(
          {
            name: "Regular Size Pack",
            quantity,
          },
          {
            name: "Plastic",
            quantity,
          },
        );
      }

      if (
        additionalDips > 0
      ) {
        deductions.push({
          name: "Dip Pack",
          quantity:
            additionalDips,
        });
      }

      return deductions;
    }, []);

  // =====================================================
  // CHECK INVENTORY
  // =====================================================

  const checkInventoryAvailability =
    useCallback(
      (order) => {
        const deductions =
          getInventoryDeductions(
            order,
          );

        const errors = [];

        deductions.forEach(
          (deduction) => {
            const item =
              findInventoryItem(
                inventoryRows,
                deduction.name,
              );

            if (!item) {
              errors.push(
                `${deduction.name} is missing from inventory.`,
              );
              return;
            }

            const currentStock =
              Number(
                item.stock,
              ) || 0;

            if (
              currentStock <
              deduction.quantity
            ) {
              errors.push(
                `${deduction.name} only has ${currentStock} left, but this order needs ${deduction.quantity}.`,
              );
            }
          },
        );

        return {
          valid:
            errors.length === 0,
          errors,
        };
      },
      [
        findInventoryItem,
        getInventoryDeductions,
        inventoryRows,
      ],
    );

  // =====================================================
  // DEDUCT INVENTORY
  // =====================================================

  const deductInventory =
    useCallback(
      async (order) => {
        const deductions =
          getInventoryDeductions(
            order,
          );

        for (const deduction of deductions) {
          const item =
            findInventoryItem(
              inventoryRows,
              deduction.name,
            );

          if (!item) {
            throw new Error(
              `${deduction.name} was not found in inventory.`,
            );
          }

          const currentStock =
            Number(
              item.stock,
            ) || 0;

          const newStock =
            currentStock -
            deduction.quantity;

          if (newStock < 0) {
            throw new Error(
              `Not enough ${deduction.name} in stock.`,
            );
          }

          const { error } =
            await supabase
              .from("inventory")
              .update({
                stock: newStock,
              })
              .eq(
                "id",
                item.id,
              );

          if (error) {
            throw error;
          }
        }

        const {
          data,
          error,
        } = await supabase
          .from("inventory")
          .select("*")
          .order("id", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        setInventoryRows(
          data || [],
        );
      },
      [
        findInventoryItem,
        getInventoryDeductions,
        inventoryRows,
      ],
    );

  // =====================================================
  // TRACKER SUBMIT
  // =====================================================

  const handleTrackerSubmit =
    async (event) => {
      event.preventDefault();

      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured yet.",
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
          "Fill in all tracker fields before saving.",
        );
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const order = {
          ...tracker,

          additionalDips:
            tracker.additionalDips ===
            ""
              ? 0
              : Number(
                  tracker.additionalDips ||
                    0,
                ),
        };

        if (
          tracker.status ===
          "Completed"
        ) {
          const inventoryCheck =
            checkInventoryAvailability(
              order,
            );

          if (
            !inventoryCheck.valid
          ) {
            throw new Error(
              `Cannot complete this order:\n\n${inventoryCheck.errors.join(
                "\n",
              )}`,
            );
          }
        }

        // Base product price is stored in price.
        // Additional dips are stored separately.
        const baseProductPrice =
          Number(
            tracker.productPrice ||
              tracker.price ||
              0,
          );

        const payload = {
          date: tracker.date,

          name: tracker.name,

          order_quantity:
            Number(
              tracker.orderQuantity,
            ),

          price:
            baseProductPrice,

          notes:
            tracker.notes?.trim() ||
            null,

          status: tracker.status,

          product:
            tracker.product || null,

          variant_pcs:
            tracker.variantPcs
              ? Number(
                  tracker.variantPcs,
                )
              : null,

          product_price:
            tracker.productPrice
              ? Number(
                  tracker.productPrice,
                )
              : null,

          dip:
            tracker.dip || null,

          additional_dips:
            order.additionalDips,

          additional_dip_type:
            tracker.additionalDipType ||
            null,
        };

        const { error } =
          await supabase
            .from("tracker")
            .insert([
              payload,
            ]);

        if (error) {
          throw error;
        }

        if (
          tracker.status ===
          "Completed"
        ) {
          await deductInventory(
            order,
          );
        }

        setTracker(
          DEFAULT_TRACKER,
        );

        await loadData();
      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to save tracker entry: ${error.message}`,
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
          "Supabase is not configured yet.",
        );
        return;
      }

      if (
        !expenses.date ||
        !expenses.product ||
        !expenses.price
      ) {
        setErrorMessage(
          "Fill in all expense fields before saving.",
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
          price: Number(
            expenses.price || 0,
          ),
        };

        const { error } =
          await supabase
            .from("expenses")
            .insert([
              payload,
            ]);

        if (error) {
          throw error;
        }

        setExpenses(
          DEFAULT_EXPENSES,
        );

        await loadData();
      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to save expense entry: ${error.message}`,
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // SAVINGS SUBMIT
  // =====================================================

  const handleSavingsSubmit =
    async (event) => {
      event.preventDefault();

      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured yet.",
        );
        return;
      }

      if (
        !savings.date ||
        !savings.amount
      ) {
        setErrorMessage(
          "Enter a date and savings amount before saving.",
        );
        return;
      }

      const amount = Number(
        savings.amount,
      );

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        setErrorMessage(
          "Savings amount must be greater than 0.",
        );
        return;
      }

      if (
        amount >
        availableMoney
      ) {
        setErrorMessage(
          `You only have ₱${availableMoney.toFixed(
            2,
          )} available money.`,
        );
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const payload = {
          date: savings.date,
          amount,
          notes:
            savings.notes?.trim() ||
            null,
        };

        const { error } =
          await supabase
            .from("savings")
            .insert([
              payload,
            ]);

        if (error) {
          throw error;
        }

        setSavings(
          DEFAULT_SAVINGS,
        );

        await loadData();
      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to save savings: ${error.message}`,
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // DELETE GENERIC ROW
  // =====================================================

  const deleteRow = async (
    table,
    rowId,
    message,
  ) => {
    if (!supabase) {
      setErrorMessage(
        "Supabase is not configured yet.",
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error } =
        await supabase
          .from(table)
          .delete()
          .eq(
            "id",
            rowId,
          );

      if (error) {
        throw error;
      }

      await loadData();
    } catch (error) {
      console.error(error);

      setErrorMessage(
        `${message}: ${error.message}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // DELETE HANDLERS
  // =====================================================

  const handleDeleteTrackerRow =
    (rowId) =>
      deleteRow(
        "tracker",
        rowId,
        "Unable to delete tracker entry",
      );

  const handleDeleteExpenseRow =
    (rowId) =>
      deleteRow(
        "expenses",
        rowId,
        "Unable to delete expense entry",
      );

  const handleDeleteSavingsRow =
    (rowId) =>
      deleteRow(
        "savings",
        rowId,
        "Unable to delete savings entry",
      );

  // =====================================================
  // CHANGE TRACKER STATUS
  // =====================================================

  const handleTrackerStatusChange =
    async (
      rowId,
      status,
    ) => {
      if (!supabase) {
        setErrorMessage(
          "Supabase is not configured yet.",
        );
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const {
          data: row,
          error: findError,
        } = await supabase
          .from("tracker")
          .select("*")
          .eq(
            "id",
            rowId,
          )
          .single();

        if (findError) {
          throw findError;
        }

        if (
          status ===
            "Completed" &&
          row.status !==
            "Completed"
        ) {
          const inventoryCheck =
            checkInventoryAvailability(
              row,
            );

          if (
            !inventoryCheck.valid
          ) {
            throw new Error(
              `Cannot complete this order:\n\n${inventoryCheck.errors.join(
                "\n",
              )}`,
            );
          }

          await deductInventory(
            row,
          );
        }

        const { error } =
          await supabase
            .from("tracker")
            .update({
              status,
            })
            .eq(
              "id",
              rowId,
            );

        if (error) {
          throw error;
        }

        await loadData();
      } catch (error) {
        console.error(error);

        setErrorMessage(
          `Unable to update tracker status: ${error.message}`,
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const confirmDeleteTrackerRow =
    (row) => {
      const label = row?.name
        ? ` for ${row.name}`
        : "";

      const confirmed =
        window.confirm(
          `Are you sure you want to delete this tracker entry${label}?`,
        );

      if (confirmed) {
        handleDeleteTrackerRow(
          row.id,
        );
      }
    };

  const confirmDeleteExpenseRow =
    (row) => {
      const label = row?.product
        ? ` for ${row.product}`
        : "";

      const confirmed =
        window.confirm(
          `Are you sure you want to delete this expense entry${label}?`,
        );

      if (confirmed) {
        handleDeleteExpenseRow(
          row.id,
        );
      }
    };

  const confirmDeleteSavingsRow =
    (row) => {
      const label = row?.amount
        ? ` of ₱${Number(
            row.amount,
          ).toFixed(2)}`
        : "";

      const confirmed =
        window.confirm(
          `Are you sure you want to remove this savings entry${label}?`,
        );

      if (confirmed) {
        handleDeleteSavingsRow(
          row.id,
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
      title: "Pending Orders",
      description:
        "Review all pending orders and mark them completed when done.",
    },

    expenses: {
      title: "Expenses",
      description:
        "Record product expenses and keep your costs organized.",
    },

    savings: {
      title: "Savings",
      description:
        "Set aside part of your profit without recording it as an expense.",
    },

    summary: {
      title: "Summary",
      description:
        "Review your profit, expenses, savings, and available money.",
    },

    tuition: {
      title: "Tuition Fee Target",
      description:
        "Track your tuition fee savings and monitor your progress.",
    },

    inventory: {
      title: "Packaging Inventory",
      description:
        "Monitor your packaging stocks and automatically deduct supplies from completed orders.",
    },
  };

  const currentView =
    viewMeta[activeView] ||
    viewMeta.tracker;

  // =====================================================
  // RENDER ACTIVE TAB
  // =====================================================

  const renderActiveTab = () => {
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
          displayedSavingsRows={
            displayedSavingsRows
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
          onDeleteSavings={
            confirmDeleteSavingsRow
          }
          summaryTrackerTotal={
            summaryTrackerTotal
          }
          summaryExpensesTotal={
            summaryExpensesTotal
          }
          summarySavingsTotal={
            summarySavingsTotal
          }
          summaryProfit={
            summaryProfit
          }
          availableCapital={
            availableCapital
          }
          availableMoney={
            availableMoney
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

    if (
      activeView ===
      "savings"
    ) {
      return (
        <SavingsTab
          savings={savings}
          setSavings={setSavings}
          savingsRows={
            savingsRows
          }
          savingsTotal={
            summarySavingsTotal
          }
          summaryProfit={
            summaryProfit
          }
          availableMoney={
            availableMoney
          }
          isLoading={
            isLoading
          }
          isSubmitting={
            isSubmitting
          }
          onSubmit={
            handleSavingsSubmit
          }
          onDelete={
            confirmDeleteSavingsRow
          }
        />
      );
    }

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
            rowId,
          ) =>
            handleTrackerStatusChange(
              rowId,
              "Completed",
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
          summarySavingsTotal={
            summarySavingsTotal
          }
          summaryProfit={
            summaryProfit
          }
          availableMoney={
            availableMoney
          }
        />
      );
    }

    if (
      activeView ===
      "inventory"
    ) {
      return (
        <InventoryTab
          inventoryRows={
            inventoryRows
          }
          setInventoryRows={
            setInventoryRows
          }
          isLoading={
            isLoading
          }
          setErrorMessage={
            setErrorMessage
          }
        />
      );
    }

    return (
      <TrackerTab
        tracker={tracker}
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

          <button
            type="button"
            onClick={() =>
              setDarkMode(
                (previous) =>
                  !previous,
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

        {errorMessage ? (
          <div
            className={`mt-4 whitespace-pre-line rounded-xl border p-3 text-sm ${
              darkMode
                ? "border-amber-700 bg-amber-950 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}