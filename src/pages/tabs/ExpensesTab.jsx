export default function ExpensesTab({
  expenses,
  setExpenses,
  expensesTotal,
  isSubmitting,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Expense Form */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Date */}
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Date</span>

          <input
            type="date"
            value={expenses.date}
            onChange={(e) =>
              setExpenses({
                ...expenses,
                date: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </label>

        {/* Product */}
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Product</span>

          <input
            type="text"
            value={expenses.product}
            onChange={(e) =>
              setExpenses({
                ...expenses,
                product: e.target.value,
              })
            }
            placeholder="Enter product"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </label>

        {/* Price */}
        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Price</span>

          <input
            type="number"
            min="0"
            value={expenses.price}
            onChange={(e) =>
              setExpenses({
                ...expenses,
                price: e.target.value,
              })
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </label>
      </div>

      {/* Total Expenses */}
      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Total expenses
        </p>

        <p className="mt-2 text-2xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
          ₱{expensesTotal.toFixed(2)}
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#d8a66b] px-4 py-3 font-semibold text-white transition hover:bg-[#c9944d] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Submit Expense"}
      </button>
    </form>
  );
}