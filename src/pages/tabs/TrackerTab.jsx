import { useMemo } from "react";

export default function TrackerTab({
  brand,
  tracker,
  setTracker,
  isSubmitting,
  onSubmit,
  menuConfig,
}) {
  const MENU = useMemo(() => menuConfig || {}, [menuConfig]);
  const firstProduct = Object.keys(MENU)[0] || "";
  // ============================================================
  // CURRENT PRODUCT
  // ============================================================

  const selectedProduct = useMemo(
    () =>
      MENU[tracker.product] || MENU[firstProduct] || [],
    [MENU, firstProduct, tracker.product],
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
  // FINAL TOTAL
  // ============================================================

  const calculatedTotal = productTotal;

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

    const nextProductTotal =
      nextProductPrice *
      nextQuantity;

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

      // FINAL TOTAL
      totalPrice:
        nextProductTotal,

      // Legacy-compatible field
      total:
        nextProductTotal,
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
          Welcome to {brand?.name || "Benzi Tracker"}!
        </h1>

        <p className="mt-3 text-amber-100">
          Easily manage your daily orders,
          calculate sales, and keep track of
          your business—all in one
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
          PRODUCT ORDER
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-[#f8f5f2] p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Product Order
        </h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Select a product and variant.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {/* PRODUCT */}

          <label className="space-y-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Product</span>

            <select
              value={
                tracker.product || firstProduct
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
              {tracker.product || firstProduct}{" "}
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