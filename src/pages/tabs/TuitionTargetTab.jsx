import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TuitionTargetTab() {

  // =========================
  // Tuition Goal
  // =========================

  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // =========================
  // Savings Form
  // =========================

  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  // =========================
  // Savings Records
  // =========================

  const [rows, setRows] = useState([]);

  // =========================
  // Loading / Error
  // =========================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");



  // =========================
  // Load Savings Data
  // =========================

  async function loadData() {

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("tuition_savings")
      .select("*")
      .order("created_at", {
        ascending: true
      });


    if (error) {
      console.log(error);
      setError("Failed to load savings data.");
      setLoading(false);
      return;
    }


    setRows(data || []);

    setLoading(false);
  }



  // =========================
  // Initial Load
  // =========================

  useEffect(() => {

    loadData();

  }, []);




  // =========================
  // Total Saved
  // =========================

  const totalSaved = useMemo(() => {

    return rows.reduce(
      (total, row) =>
        total + Number(row.amount || 0),
      0
    );

  }, [rows]);




  // =========================
  // Goal Computation
  // =========================

  const target = Number(targetAmount || 0);


  const remaining = Math.max(
    target - totalSaved,
    0
  );


  const progress =
    target > 0
      ? Math.min(
          (totalSaved / target) * 100,
          100
        )
      : 0;




  // =========================
  // Add Savings
  // =========================

  async function handleSubmit(e) {

    e.preventDefault();


    if (!date || !amount) {
      setError("Please complete required fields.");
      return;
    }


    if (Number(amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }


    const { error } = await supabase
      .from("tuition_savings")
      .insert([
        {
          date,
          amount: Number(amount),
          notes,
        },
      ]);


    if (error) {
      console.log(error);
      setError("Failed to save record.");
      return;
    }


    setDate("");
    setAmount("");
    setNotes("");

    loadData();

  }

    // =========================
  // Delete Savings
  // =========================

  async function handleDelete(id) {

    const confirmDelete = window.confirm(
      "Delete this savings record?"
    );

    if (!confirmDelete) return;


    const { error } = await supabase
      .from("tuition_savings")
      .delete()
      .eq("id", id);


    if (error) {
      console.log(error);
      setError("Failed to delete record.");
      return;
    }


    loadData();

  }




  // =========================
  // Save Tuition Goal
  // =========================

  async function saveGoal() {

    if (!targetAmount || !targetDate) {

      setError(
        "Please enter target amount and date."
      );

      return;
    }


    setError("");

    // Temporary local save
    // Next step: connect to tuition_goal table

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
  // Load Tuition Goal
  // =========================

  useEffect(() => {

    const savedGoal =
      localStorage.getItem(
        "tuitionGoal"
      );


    if (savedGoal) {

      const goal =
        JSON.parse(savedGoal);


      setTargetAmount(
        goal.amount
      );


      setTargetDate(
        goal.date
      );

    }

  }, []);




  return (

    <div className="space-y-6">



      {/* Error Message */}

      {error && (

        <div className="
          rounded-lg
          bg-red-100
          p-3
          text-red-700
        ">

          {error}

        </div>

      )}






      {/* Tuition Goal */}

      <div className="
        rounded-2xl
        border
        border-gray-200
        bg-[#f8f5f2]
        p-5
        space-y-4
      ">


        <h2 className="
          text-xl
          font-semibold
          text-[#5A3A2E]
        ">

          Tuition Goal

        </h2>



        <input

          type="number"

          placeholder="Target Amount"

          value={targetAmount}

          onChange={(e)=>
            setTargetAmount(
              e.target.value
            )
          }

          className="
            w-full
            rounded-lg
            border
            p-3
          "

        />



        <input

          type="date"

          value={targetDate}

          onChange={(e)=>
            setTargetDate(
              e.target.value
            )
          }

          className="
            w-full
            rounded-lg
            border
            p-3
          "

        />



        <button

          type="button"

          onClick={saveGoal}

          className="
            rounded-lg
            bg-[#5A3A2E]
            px-5
            py-3
            text-white
            hover:bg-[#6b4737]
          "

        >

          Save Goal

        </button>


      </div>





      {/* Tuition Savings Form */}

      <form

        onSubmit={handleSubmit}

        className="
          rounded-2xl
          border
          border-gray-200
          bg-[#f8f5f2]
          p-5
          space-y-4
        "

      >

        <h2 className="
          text-xl
          font-semibold
          text-[#5A3A2E]
        ">

          Tuition Savings

        </h2>

                <input

          type="date"

          value={date}

          onChange={(e)=>
            setDate(e.target.value)
          }

          className="
            w-full
            rounded-lg
            border
            p-3
          "

          required

        />



        <input

          type="number"

          placeholder="Amount"

          value={amount}

          onChange={(e)=>
            setAmount(e.target.value)
          }

          className="
            w-full
            rounded-lg
            border
            p-3
          "

          required

        />



        <input

          type="text"

          placeholder="Notes"

          value={notes}

          onChange={(e)=>
            setNotes(e.target.value)
          }

          className="
            w-full
            rounded-lg
            border
            p-3
          "

        />



        <button

          type="submit"

          className="
            rounded-lg
            bg-[#5A3A2E]
            px-5
            py-3
            text-white
            hover:bg-[#6b4737]
          "

        >

          Save Savings

        </button>


      </form>






      {/* Savings History */}

      <div className="
        rounded-2xl
        border
        border-gray-200
        bg-[#f8f5f2]
        p-5
      ">


        <h2 className="
          text-xl
          font-semibold
          text-[#5A3A2E]
        ">

          Savings History

        </h2>



        {loading ? (

          <p className="mt-4">
            Loading...
          </p>


        ) : rows.length === 0 ? (

          <p className="mt-4 text-gray-500">
            No savings record yet.
          </p>


        ) : (

          <div className="mt-4 overflow-x-auto">


            <table className="
              w-full
              text-left
            ">


              <thead>

                <tr className="
                  border-b
                ">

                  <th className="p-2">
                    Date
                  </th>

                  <th className="p-2">
                    Amount
                  </th>

                  <th className="p-2">
                    Notes
                  </th>

                  <th className="p-2">
                    Action
                  </th>


                </tr>

              </thead>



              <tbody>


                {rows.map((row)=>(


                  <tr

                    key={row.id}

                    className="
                      border-b
                    "

                  >


                    <td className="p-2">
                      {row.date}
                    </td>



                    <td className="
                      p-2
                      font-semibold
                    ">

                      ₱
                      {Number(
                        row.amount
                      ).toFixed(2)}

                    </td>



                    <td className="p-2">

                      {row.notes || "-"}

                    </td>



                    <td className="p-2">


                      <button

                        onClick={()=>
                          handleDelete(
                            row.id
                          )
                        }

                        className="
                          text-red-600
                          hover:underline
                        "

                      >

                        Delete

                      </button>


                    </td>



                  </tr>


                ))}


              </tbody>


            </table>


          </div>

        )}


      </div>








      {/* Progress */}

      <div className="
        rounded-2xl
        border
        border-gray-200
        bg-[#f8f5f2]
        p-5
      ">


        <h2 className="
          text-xl
          font-semibold
          text-[#5A3A2E]
        ">

          Tuition Progress

        </h2>




        <div className="
          mt-5
          h-6
          overflow-hidden
          rounded-full
          bg-gray-200
        ">


          <div

            className="
              h-full
              bg-green-600
              transition-all
              duration-500
            "

            style={{
              width:`${progress}%`
            }}

          />


        </div>





        <div className="
          mt-6
          space-y-3
        ">



          <div className="
            flex
            justify-between
          ">

            <span>
              Target Amount
            </span>


            <span className="
              font-semibold
            ">

              ₱
              {target.toFixed(2)}

            </span>


          </div>





          <div className="
            flex
            justify-between
          ">


            <span>
              Target Date
            </span>


            <span className="
              font-semibold
            ">

              {targetDate || "-"}

            </span>


          </div>






          <div className="
            flex
            justify-between
          ">


            <span>
              Total Saved
            </span>


            <span className="
              font-semibold
              text-green-700
            ">

              ₱
              {totalSaved.toFixed(2)}

            </span>


          </div>






          <div className="
            flex
            justify-between
          ">


            <span>
              Remaining
            </span>


            <span className="
              font-semibold
              text-red-600
            ">

              ₱
              {remaining.toFixed(2)}

            </span>


          </div>







          <div className="
            flex
            justify-between
          ">


            <span>
              Progress
            </span>


            <span className="
              font-bold
              text-[#5A3A2E]
            ">

              {progress.toFixed(1)}%

            </span>


          </div>



        </div>



      </div>




    </div>

  );

}