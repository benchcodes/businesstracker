import { useMemo } from "react";

const MENU = {
  "Regular Churros": [
    {
      label: "4 pcs - ₱49",
      pcs: 4,
      price: 49,
    },
    {
      label: "8 pcs - ₱69",
      pcs: 8,
      price: 69,
    },
  ],

  "Churros Bites": [
    {
      label: "15 pcs - ₱89",
      pcs: 15,
      price: 89,
    },
  ],

  "Premium Churros w/ Alcapone": [
    {
      label: "5 pcs - ₱69",
      pcs: 5,
      price: 69,
    },
    {
      label: "8 pcs - ₱99",
      pcs: 8,
      price: 99,
    },
  ],
};

const DIPS = ["Matcha", "Chocolate"];

const ADDITIONAL_DIP_PRICE = 10;

export default function TrackerTab({
  tracker,
  setTracker,
  trackerTotal,
  isSubmitting,
  onSubmit,
}) {
  /*
   * ============================================================
   * CURRENT PRODUCT
   * ============================================================
   */

  const selectedProduct =
    MENU[tracker.product] || MENU["Regular Churros"];

  /*
   * Find the currently selected menu variant.
   *
   * We use variantPcs + productPrice instead of tracker.price
   * because tracker.price is kept as the BASE PRODUCT PRICE.
   */

  const selectedVariant = useMemo(() => {
    const found = selectedProduct.find(
      (variant) =>
        Number(variant.pcs) === Number(tracker.variantPcs) &&
        Number(variant.price) === Number(tracker.productPrice)
    );

    return found || selectedProduct[0];
  }, [
    selectedProduct,
    tracker.variantPcs,
    tracker.productPrice,
  ]);

  /*
   * ============================================================
   * ORDER VALUES
   * ============================================================
   */

  const quantity = Math.max(
    1,
    Number(tracker.orderQuantity) || 1
  );

  /*
   * Additional dip is intentionally allowed to be ""
   * while the user is typing.
   *
   * Example:
   *
   * ""  -> 0
   * "1" -> 1
   * "2" -> 2
   */

  const additionalDips =
    tracker.additionalDips === ""
      ? 0
      : Math.max(
          0,
          Number(tracker.additionalDips) || 0
        );

  /*
   * BASE MENU PRICE
   *
   * This is NEVER modified by the additional dip.
   */

  const basePrice =
    Number(selectedVariant.price) || 0;

  /*
   * PRODUCT TOTAL
   *
   * Example:
   *
   * ₱69 × 2 orders = ₱138
   */

  const productTotal =
    basePrice * quantity;

  /*
   * ADDITIONAL DIP TOTAL
   *
   * ₱10 per additional dip.
   */

  const dipTotal =
    additionalDips * ADDITIONAL_DIP_PRICE;

  /*
   * FINAL ORDER TOTAL
   *
   * Product total + additional dips
   */

  const calculatedTotal =
    productTotal + dipTotal;

  /*
   * ============================================================
   * PRODUCT CHANGE
   * ============================================================
   */

  const handleProductChange = (event) => {
    const product = event.target.value;

    const firstVariant =
      MENU[product]?.[0];

    if (!firstVariant) return;

    setTracker((previous) => ({
      ...previous,

      product,

      variantPcs:
        firstVariant.pcs,

      productPrice:
        firstVariant.price,

      /*
       * IMPORTANT:
       * price is ONLY the base menu price.
       */
      price:
        firstVariant.price,

      /*
       * Reset additional dip when changing product.
       */
      additionalDips: "",

      additionalDipType:
        "Chocolate",
    }));
  };

  /*
   * ============================================================
   * VARIANT CHANGE
   * ============================================================
   */

  const handleVariantChange = (event) => {
    const index =
      Number(event.target.value);

    const variant =
      selectedProduct[index];

    if (!variant) return;

    setTracker((previous) => ({
      ...previous,

      variantPcs:
        variant.pcs,

      productPrice:
        variant.price,

      /*
       * price remains the BASE PRODUCT PRICE.
       */
      price:
        variant.price,
    }));
  };

  /*
   * ============================================================
   * QUANTITY CHANGE
   * ============================================================
   */

  const handleQuantityChange = (event) => {
    const value =
      event.target.value;

    /*
     * Allow empty input temporarily.
     * This makes typing easier.
     */
    if (value === "") {
      setTracker((previous) => ({
        ...previous,
        orderQuantity: "",
      }));

      return;
    }

    const numericValue =
      Math.max(
        1,
        Number(value) || 1
      );

    setTracker((previous) => ({
      ...previous,
      orderQuantity:
        numericValue,
    }));
  };

  /*
   * ============================================================
   * ADDITIONAL DIP QUANTITY
   * ============================================================
   */

  const handleAdditionalDipsChange = (
    event
  ) => {
    const value =
      event.target.value;

    /*
     * IMPORTANT:
     *
     * We allow "".
     *
     * This prevents the input from forcing
     * 0 back into the field while typing.
     */

    if (value === "") {
      setTracker((previous) => ({
        ...previous,
        additionalDips: "",
      }));

      return;
    }

    const numericValue =
      Math.max(
        0,
        Number(value) || 0
      );

    setTracker((previous) => ({
      ...previous,
      additionalDips:
        numericValue,
    }));
  };

  /*
   * ============================================================
   * ADDITIONAL DIP FLAVOR
   * ============================================================
   */

  const handleAdditionalDipTypeChange = (
    event
  ) => {
    setTracker((previous) => ({
      ...previous,

      additionalDipType:
        event.target.value,
    }));
  };

  /*
   * ============================================================
   * VARIANT SELECT INDEX
   * ============================================================
   */

  const selectedVariantIndex = Math.max(
    0,
    selectedProduct.findIndex(
      (variant) =>
        Number(variant.pcs) ===
          Number(
            tracker.variantPcs
          ) &&
        Number(variant.price) ===
          Number(
            tracker.productPrice
          )
    )
  );

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {/* =======================================================
          WELCOME BANNER
      ======================================================= */}

      <div className="rounded-2xl bg-gradient-to-r from-[#5A3A2E] via-[#8B5E3C] to-[#D8A66B] p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          👋 Welcome to ChurroZi Tracker!
        </h1>

        <p className="mt-3 text-amber-100">
          Easily manage your daily orders,
          calculate sales, and keep track of
          your churros business—all in one place.
        </p>
      </div>

      {/* =======================================================
          BASIC ORDER INFO
      ======================================================= */}

      <div className="grid gap-4 md:grid-cols-2">

        {/* DATE */}

        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Date</span>

          <input
            type="date"
            value={
              tracker.date || ""
            }
            onChange={(event) =>
              setTracker((previous) => ({
                ...previous,
                date:
                  event.target.value,
              }))
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </label>

        {/* CUSTOMER NAME */}

        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>
            Customer Name
          </span>

          <input
            type="text"
            value={
              tracker.name || ""
            }
            onChange={(event) =>
              setTracker((previous) => ({
                ...previous,
                name:
                  event.target.value,
              }))
            }
            placeholder="Customer or order name"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </label>

      </div>

      {/* =======================================================
          PRODUCT
      ======================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">

        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          🥨 Churros Order
        </h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Select the churros product and
          variant.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          {/* PRODUCT */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">

            <span>
              Product
            </span>

            <select
              value={
                tracker.product ||
                "Regular Churros"
              }
              onChange={
                handleProductChange
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {Object.keys(MENU).map(
                (product) => (
                  <option
                    key={product}
                    value={product}
                  >
                    {product}
                  </option>
                )
              )}
            </select>

          </label>

          {/* VARIANT */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">

            <span>
              Size / Variant
            </span>

            <select
              value={
                selectedVariantIndex
              }
              onChange={
                handleVariantChange
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {selectedProduct.map(
                (variant, index) => (
                  <option
                    key={`${variant.pcs}-${variant.price}`}
                    value={index}
                  >
                    {variant.label}
                  </option>
                )
              )}
            </select>

          </label>

          {/* QUANTITY */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">

            <span>
              Quantity
            </span>

            <input
              type="number"
              min="1"
              value={
                tracker.orderQuantity === ""
                  ? ""
                  : tracker.orderQuantity ??
                    1
              }
              onChange={
                handleQuantityChange
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />

          </label>

          {/* FREE DIP */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">

            <span>
              Free Dip
            </span>

            <select
              value={
                tracker.dip ||
                "Matcha"
              }
              onChange={(event) =>
                setTracker(
                  (previous) => ({
                    ...previous,
                    dip:
                      event.target.value,
                  })
                )
              }
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {DIPS.map(
                (dip) => (
                  <option
                    key={dip}
                    value={dip}
                  >
                    {dip}
                  </option>
                )
              )}
            </select>

          </label>

        </div>

        {/* =====================================================
            ADDITIONAL DIP
        ===================================================== */}

        <div className="mt-5 rounded-xl border border-[#d8a66b] bg-white p-4 dark:border-[#8B5E3C] dark:bg-gray-800">

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
                🥣 Additional Dip
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                ₱10.00 per additional dip
              </p>

            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">

              {/* DIP FLAVOR */}

              <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                <span>
                  Dip Flavor
                </span>

                <select
                  value={
                    tracker.additionalDipType ||
                    "Chocolate"
                  }
                  onChange={
                    handleAdditionalDipTypeChange
                  }
                  disabled={
                    additionalDips <= 0
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {DIPS.map(
                    (dip) => (
                      <option
                        key={dip}
                        value={dip}
                      >
                        {dip}
                      </option>
                    )
                  )}
                </select>

              </label>

              {/* DIP QUANTITY */}

              <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">

                <span>
                  Quantity
                </span>

                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={
                    tracker.additionalDips === ""
                      ? ""
                      : tracker.additionalDips ??
                        ""
                  }
                  onChange={
                    handleAdditionalDipsChange
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />

              </label>

            </div>

          </div>

          {additionalDips > 0 && (
            <p className="mt-3 text-sm text-[#5A3A2E] dark:text-[#e8bd85]">

              {additionalDips} additional{" "}
              {additionalDips === 1
                ? "dip"
                : "dips"}{" "}
              —{" "}
              {tracker.additionalDipType ||
                "Chocolate"}{" "}
              · ₱
              {dipTotal.toFixed(2)}

            </p>
          )}

        </div>

      </div>

      {/* =======================================================
          NOTES
      ======================================================= */}

      <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">

        <span>
          Notes
        </span>

        <textarea
          value={
            tracker.notes || ""
          }
          onChange={(event) =>
            setTracker((previous) => ({
              ...previous,
              notes:
                event.target.value,
            }))
          }
          placeholder="Add special instructions or order notes"
          rows={3}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        />

      </label>

      {/* =======================================================
          STATUS
      ======================================================= */}

      <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">

        <span>
          Status
        </span>

        <select
          value={
            tracker.status ||
            "Pending"
          }
          onChange={(event) =>
            setTracker((previous) => ({
              ...previous,
              status:
                event.target.value,
            }))
          }
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="Pending">
            Pending
          </option>

          <option value="Completed">
            Completed
          </option>
        </select>

      </label>

      {/* =======================================================
          ORDER SUMMARY
      ======================================================= */}

      <div className="rounded-2xl bg-[#f8f5f2] p-5 dark:bg-gray-800">

        <p className="text-lg font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Order Summary
        </p>

        <div className="mt-4 space-y-3">

          {/* PRODUCT */}

          <div className="flex justify-between text-gray-600 dark:text-gray-300">

            <span>
              {tracker.product ||
                "Regular Churros"}{" "}
              ({selectedVariant.pcs} pcs)
            </span>

            <span>
              ₱
              {basePrice.toFixed(2)}
              {" × "}
              {quantity}
            </span>

          </div>

          {/* PRODUCT SUBTOTAL */}

          <div className="flex justify-between text-gray-600 dark:text-gray-300">

            <span>
              Product Subtotal
            </span>

            <span>
              ₱
              {productTotal.toFixed(2)}
            </span>

          </div>

          {/* FREE DIP */}

          <div className="flex justify-between text-gray-600 dark:text-gray-300">

            <span>
              Free Dip
              {tracker.dip
                ? ` (${tracker.dip})`
                : ""}
            </span>

            <span className="text-green-600 dark:text-green-400">
              Included
            </span>

          </div>

          {/* ADDITIONAL DIP */}

          <div className="flex justify-between text-gray-600 dark:text-gray-300">

            <span>
              Additional Dip

              {additionalDips > 0 && (
                <>
                  {" "}
                  (
                  {tracker.additionalDipType ||
                    "Chocolate"}
                  )
                </>
              )}

            </span>

            <span>
              ₱
              {dipTotal.toFixed(2)}
            </span>

          </div>

          {/* TOTAL */}

          <div className="border-t border-gray-300 pt-3 dark:border-gray-600">

            <div className="flex items-center justify-between">

              <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Total Price
              </span>

              <span className="text-3xl font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
                ₱
                {calculatedTotal.toFixed(2)}
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =======================================================
          SUBMIT
      ======================================================= */}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#d8a66b] px-4 py-4 text-lg font-semibold text-white transition hover:bg-[#c9944d] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting
          ? "Saving..."
          : "Submit Order"}
      </button>

    </form>
  );
}
