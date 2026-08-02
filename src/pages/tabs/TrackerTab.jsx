export default function TrackerTab({ tracker, setTracker, trackerTotal, isSubmitting, onSubmit }) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        
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

        <label className="space-y-2 text-sm font-medium text-gray-700 md:col-span-2">
          <span>Notes</span>
          <textarea
            value={tracker.notes}
            onChange={(e) => setTracker({ ...tracker, notes: e.target.value })}
            placeholder="Add special instructions or order notes"
            rows={3}
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
  );
}
