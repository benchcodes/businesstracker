import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

const TARGET = 35000;

export default function TuitionTargetTab() {
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState([]);

  async function loadData() {
    const { data } = await supabase
      .from("tuition_savings")
      .select("*")
      .order("created_at", { ascending: true });

    setRows(data || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalSaved = useMemo(() => {
    return rows.reduce((t, r) => t + Number(r.amount || 0), 0);
  }, [rows]);

  const remaining = TARGET - totalSaved;

  const progress = Math.min((totalSaved / TARGET) * 100, 100);

  async function handleSubmit(e) {
    e.preventDefault();

    await supabase.from("tuition_savings").insert([
      {
        date,
        amount: Number(amount),
        notes,
      },
    ]);

    setDate("");
    setAmount("");
    setNotes("");

    loadData();
  }

  async function handleDelete(id) {
    await supabase
      .from("tuition_savings")
      .delete()
      .eq("id", id);

    loadData();
  }

  return (
    <div className="space-y-6">

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 space-y-4"
      >

        <h2 className="text-xl font-semibold text-[#5A3A2E]">
          Tuition Savings
        </h2>

        <input
          type="date"
          value={date}
          onChange={(e)=>setDate(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e)=>setAmount(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="text"
          placeholder="Notes"
          value={notes}
          onChange={(e)=>setNotes(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <button
          className="rounded-lg bg-[#5A3A2E] px-5 py-3 text-white"
        >
          Save
        </button>

      </form>

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">

        <h2 className="text-xl font-semibold text-[#5A3A2E]">
          Tuition Progress
        </h2>

        <div className="mt-4 h-6 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-green-600"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 space-y-2 text-lg">

          <div className="flex justify-between">
            <span>Target</span>
            <span>₱{TARGET.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Saved</span>
            <span className="text-green-700">
              ₱{totalSaved.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Remaining</span>
            <span className="text-red-600">
              ₱{remaining.toFixed(2)}
            </span>
          </div>

        </div>

      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5">

        <h2 className="text-xl font-semibold text-[#5A3A2E]">
          Savings History
        </h2>

        <table className="mt-4 w-full text-sm">

          <thead>

            <tr>

              <th className="text-left">Date</th>

              <th className="text-left">Amount</th>

              <th className="text-left">Notes</th>

              <th className="text-left">Action</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((row)=>(

              <tr key={row.id}>

                <td>{row.date}</td>

                <td>₱{Number(row.amount).toFixed(2)}</td>

                <td>{row.notes}</td>

                <td>

                  <button
                    onClick={()=>handleDelete(row.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}