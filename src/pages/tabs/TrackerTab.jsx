import { useMemo } from "react";

const DEFAULT_MENU = {
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
      label: "25 pcs - ₱89",
      pcs: 25,
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
  menuConfig,
}) {
  const MENU = menuConfig ?? DEFAULT_MENU;
  // ============================================================
  // CURRENT PRODUCT
  // ============================================================

  const selectedProduct = useMemo(
    () =>
      MENU[tracker.product] ||
      MENU["Regular Churros"] ||
      Object.values(MENU)[0] ||
      [],
    [MENU, tracker.product],
  );

  // ============================================================
  // SELECTED VARIANT
  // ============================================================

  const selectedVariant = useMemo(() => {
    const found = selectedProduct.find(
      (variant) =>
        Number(variant.pcs) ===
          Number(tracker.variantPcs) &&
        Number(variant.price) ===
          Number(tracker.productPrice),
    );

    return found || selectedProduct[0] || { pcs: 0, price: 0, label: "No variant" };
  }, [
    selectedProduct,
    tracker.variantPcs,
    tracker.productPrice,
  ]);

  // ============================================================
  // QUANTITY
  // ============================================================

  const quantity =
    tracker.orderQuantity === ""
      ? 1
      : Math.max(
          1,
          Number(tracker.orderQuantity) || 1,
        );

  // ============================================================
  // ADDITIONAL DIPS
  // ============================================================

  const additionalDips =
    tracker.additionalDips === ""
      ? 0
      : Math.max(
          0,
          Number(tracker.additionalDips) || 0,
        );

  // ============================================================
  // BASE PRICE
  // ============================================================

  const basePrice =
    Number(selectedVariant.price) || 0;

  // ============================================================
  // PRODUCT TOTAL
  // ============================================================

  const productTotal =
    basePrice * quantity;

  // ============================================================
  // ADDITIONAL DIP TOTAL
  // ============================================================

  const dipTotal =
    additionalDips *
    ADDITIONAL_DIP_PRICE;

  // ============================================================
  // FINAL TOTAL
  // ============================================================

  const calculatedTotal =
    productTotal + dipTotal;

  // ============================================================
  // CALCULATE ORDER VALUES
  // ============================================================

  const calculateOrderValues = (
    previous,
    overrides = {},
  ) => {
    const nextQuantity =
      overrides.orderQuantity === ""
        ? 1
        : Math.max(
            1,
            Number(
              overrides.orderQuantity ??
                previous.orderQuantity ??
                1,
            ) || 1,
          );

    const nextProductPrice =
      Number(
        overrides.productPrice ??
          previous.productPrice ??
          selectedVariant.price,
      ) || 0;

    const nextAdditionalDips =
      overrides.additionalDips === ""
        ? 0
        : Math.max(
            0,
            Number(
              overrides.additionalDips ??
                previous.additionalDips ??
                0,
            ) || 0,
          );

    const nextProductTotal =
      nextProductPrice *
      nextQuantity;

    const nextDipTotal =
      nextAdditionalDips *
      ADDITIONAL_DIP_PRICE;

    const nextTotal =
      nextProductTotal +
      nextDipTotal;

    return {
      ...previous,
      ...overrides,

      // Quantity
      orderQuantity:
        overrides.orderQuantity === ""
          ? ""
          : nextQuantity,

      // Product price
      price: nextProductPrice,
      productPrice: nextProductPrice,

      // Product subtotal
      productTotal:
        nextProductTotal,

      // Additional dip
      additionalDips:
        overrides.additionalDips === ""
          ? ""
          : nextAdditionalDips,

      additionalDipPrice:
        ADDITIONAL_DIP_PRICE,

      additionalDipTotal:
        nextDipTotal,

      // FINAL TOTAL
      totalPrice:
        nextTotal,

      // Legacy-compatible field
      total:
        nextTotal,
    };
  };

  // ============================================================
  // PRODUCT CHANGE
  // ============================================================

  const handleProductChange = (
    event,
  ) => {
    const product =
      event.target.value;

    const firstVariant =
      MENU[product]?.[0];

    if (!firstVariant) {
      return;
    }

    setTracker((previous) =>
      calculateOrderValues(
        previous,
        {
          product,

          variantPcs:
            firstVariant.pcs,

          productPrice:
            firstVariant.price,

          price:
            firstVariant.price,

          additionalDips: "",

          additionalDipType:
            "Chocolate",
        },
      ),
    );
  };

  // ============================================================
  // VARIANT CHANGE
  // ============================================================

  const handleVariantChange = (
    event,
  ) => {
    const index =
      Number(event.target.value);

    const variant =
      selectedProduct[index];

    if (!variant) {
      return;
    }

    setTracker((previous) =>
      calculateOrderValues(
        previous,
        {
          variantPcs:
            variant.pcs,

          productPrice:
            variant.price,

          price:
            variant.price,
        },
      ),
    );
  };

  // ============================================================
  // QUANTITY CHANGE
  // ============================================================

  const handleQuantityChange = (
    event,
  ) => {
    const value =
      event.target.value;

    if (value === "") {
      setTracker((previous) =>
        calculateOrderValues(
          previous,
          {
            orderQuantity: "",
          },
        ),
      );

      return;
    }

    const numericValue =
      Math.max(
        1,
        Number(value) || 1,
      );

    setTracker((previous) =>
      calculateOrderValues(
        previous,
        {
          orderQuantity:
            numericValue,
        },
      ),
    );
  };

  // ============================================================
  // ADDITIONAL DIP QUANTITY
  // ============================================================

  const handleAdditionalDipsChange = (
    event,
  ) => {
    const value =
      event.target.value;

    // Allow empty input
    if (value === "") {
      setTracker((previous) =>
        calculateOrderValues(
          previous,
          {
            additionalDips: "",
          },
        ),
      );

      return;
    }

    const numericValue =
      Math.max(
        0,
        Number(value) || 0,
      );

    setTracker((previous) =>
      calculateOrderValues(
        previous,
        {
          additionalDips:
            numericValue,
        },
      ),
    );
  };

  // ============================================================
  // ADDITIONAL DIP FLAVOR
  // ============================================================

  const handleAdditionalDipTypeChange = (
    event,
  ) => {
    setTracker((previous) => ({
      ...previous,

      additionalDipType:
        event.target.value,
    }));
  };

  // ============================================================
  // DATE
  // ============================================================

  const handleDateChange = (
    event,
  ) => {
    setTracker((previous) => ({
      ...previous,
      date: event.target.value,
    }));
  };

  // ============================================================
  // CUSTOMER NAME
  // ============================================================

  const handleNameChange = (
    event,
  ) => {
    setTracker((previous) => ({
      ...previous,
      name: event.target.value,
    }));
  };

  // ============================================================
  // FREE DIP
  // ============================================================

  const handleFreeDipChange = (
    event,
  ) => {
    setTracker((previous) => ({
      ...previous,
      dip: event.target.value,
    }));
  };

  // ============================================================
  // NOTES
  // ============================================================

  const handleNotesChange = (
    event,
  ) => {
    setTracker((previous) => ({
      ...previous,
      notes: event.target.value,
    }));
  };

  // ============================================================
  // STATUS
  // ============================================================

  const handleStatusChange = (
    event,
  ) => {
    setTracker((previous) => ({
      ...previous,
      status: event.target.value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (event) => {
    /*
     * Make sure the tracker contains the latest:
     *
     * Product Total
     * Additional Dip Total
     * Final Total
     */

    const finalTracker =
      calculateOrderValues(
        tracker,
        {
          orderQuantity:
            tracker.orderQuantity,

          productPrice:
            selectedVariant.price,

          additionalDips:
            tracker.additionalDips,
        },
      );

    /*
     * Store the complete calculated order.
     */
    setTracker(finalTracker);

    /*
     * Pass the calculated tracker to the parent.
     *
     * The parent can use the second argument:
     *
     * onSubmit(event, finalTracker)
     */
    onSubmit(event, finalTracker);
  };

  // ============================================================
  // SELECTED VARIANT INDEX
  // ============================================================

  const selectedVariantIndex =
    Math.max(
      0,
      selectedProduct.findIndex(
        (variant) =>
          Number(variant.pcs) ===
            Number(
              tracker.variantPcs,
            ) &&
          Number(variant.price) ===
            Number(
              tracker.productPrice,
            ),
      ),
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ======================================================
          WELCOME
      ====================================================== */}

      <div className="rounded-2xl bg-gradient-to-r from-[#5A3A2E] via-[#8B5E3C] to-[#D8A66B] p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Welcome to Benzi Tracker!
        </h1>

        <p className="mt-3 text-amber-100">
          Easily manage your daily orders,
          calculate sales, and keep track of
          your churros business—all in one
          place.
        </p>
      </div>

      {/* ======================================================
          BASIC ORDER INFO
      ====================================================== */}

      <div className="grid gap-4 md:grid-cols-2">
        {/* DATE */}

        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Date</span>

          <input
            type="date"
            value={tracker.date || ""}
            onChange={
              handleDateChange
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </label>

        {/* CUSTOMER */}

        <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>
            Customer Name
          </span>

          <input
            type="text"
            value={tracker.name || ""}
            onChange={
              handleNameChange
            }
            placeholder="Customer or order name"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </label>
      </div>

      {/* ======================================================
          CHURROS ORDER
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          🥨 Churros Order
        </h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Select the churros product
          and variant.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* PRODUCT */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Product</span>

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
                ),
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
                (
                  variant,
                  index,
                ) => (
                  <option
                    key={`${variant.pcs}-${variant.price}`}
                    value={index}
                  >
                    {variant.label}
                  </option>
                ),
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
                tracker.orderQuantity ===
                ""
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
              onChange={
                handleFreeDipChange
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
                ),
              )}
            </select>
          </label>
        </div>

        {/* ====================================================
            ADDITIONAL DIP
        ==================================================== */}

        <div className="mt-5 rounded-xl border border-[#d8a66b] bg-white p-4 dark:border-[#8B5E3C] dark:bg-gray-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
                🥣 Additional Dip
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                ₱10.00 per additional
                dip
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
                    additionalDips <=
                    0
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
                    ),
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
                    tracker.additionalDips ===
                    ""
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
              {additionalDips}{" "}
              additional{" "}
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

      {/* ======================================================
          NOTES
      ====================================================== */}

      <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>Notes</span>

        <textarea
          value={tracker.notes || ""}
          onChange={
            handleNotesChange
          }
          placeholder="Add special instructions or order notes"
          rows={3}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        />
      </label>

      {/* ======================================================
          STATUS
      ====================================================== */}

      <label className="block space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <span>Status</span>

        <select
          value={
            tracker.status ||
            "Pending"
          }
          onChange={
            handleStatusChange
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

      {/* ======================================================
          ORDER SUMMARY
      ====================================================== */}

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
              {basePrice.toFixed(2)} ×{" "}
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
                {calculatedTotal.toFixed(
                  2,
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          SUBMIT
      ====================================================== */}

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