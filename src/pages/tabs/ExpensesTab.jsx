export default function ExpensesTab({ expenses, setExpenses, expensesTotal, isSubmitting, onSubmit }) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
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
  );
}
