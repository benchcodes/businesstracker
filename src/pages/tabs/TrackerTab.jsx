export default function TrackerTab({
tracker,
setTracker,
trackerTotal,
isSubmitting,
onSubmit,
}) {
return (
  <form onSubmit={onSubmit} className="space-y-6">

    {/* Welcome Banner */}
    <div className="rounded-2xl bg-gradient-to-r from-[#5A3A2E] via-[#8B5E3C] to-[#D8A66B] p-8 text-white shadow-lg">
      <h1 className="text-3xl font-bold">
        👋 Welcome to ChurroZi Tracker!
      </h1>

      <p className="mt-3 text-amber-100">
        Easily manage your daily orders, calculate sales, and keep track of
        your churros business—all in one place.
      </p>
    </div>

  <div className="grid gap-4 md:grid-cols-2">
    {/* Date */}
    <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <span>Date</span>

      <input
        type="date"
        value={tracker.date}
        onChange={(e) =>
          setTracker({
            ...tracker,
            date: e.target.value,
          })
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </label>

    {/* Name */}
    <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <span>Name</span>

      <input
        type="text"
        value={tracker.name}
        onChange={(e) =>
          setTracker({
            ...tracker,
            name: e.target.value,
          })
        }
        placeholder="Customer or order name"
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
      />
    </label>

    {/* Order Quantity */}
    <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <span>Order quantity</span>

      <input
        type="number"
        min="0"
        value={tracker.orderQuantity}
        onChange={(e) =>
          setTracker({
            ...tracker,
            orderQuantity: e.target.value,
          })
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </label>

    {/* Price */}
    <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <span>Price</span>

      <input
        type="number"
        min="0"
        value={tracker.price}
        onChange={(e) =>
          setTracker({
            ...tracker,
            price: e.target.value,
          })
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </label>

    {/* Notes */}
    <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300 md:col-span-2">
      <span>Notes</span>

      <textarea
        value={tracker.notes}
        onChange={(e) =>
          setTracker({
            ...tracker,
            notes: e.target.value,
          })
        }
        placeholder="Add special instructions or order notes"
        rows={3}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
      />
    </label>

    {/* Status */}
    <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      <span>Status</span>

      <select
        value={tracker.status}
        onChange={(e) =>
          setTracker({
            ...tracker,
            status: e.target.value,
          })
        }
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>
    </label>
  </div>

  {/* Total Price */}
  <div className="rounded-2xl bg-[#f8f5f2] p-5 dark:bg-gray-800">
    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
      Total price
    </p>

    <p className="mt-2 text-2xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
      ₱{trackerTotal.toFixed(2)}
    </p>
  </div>

  {/* Submit Button */}
      <button
      type="submit"
      disabled={isSubmitting}
      className="w-full rounded-xl bg-[#d8a66b] px-4 py-3 font-semibold text-white transition hover:bg-[#c9944d] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isSubmitting ? "Saving..." : "Submit Tracker"}
    </button>

  </form>
);
}