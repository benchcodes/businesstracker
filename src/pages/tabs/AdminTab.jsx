import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

const DEFAULT_MENU = {
  "Regular Churros": [
    { label: "4 pcs - ₱49", pcs: 4, price: 49 },
    { label: "8 pcs - ₱69", pcs: 8, price: 69 },
  ],
  "Churros Bites": [{ label: "25 pcs - ₱89", pcs: 25, price: 89 }],
  "Premium Churros w/ Alcapone": [
    { label: "5 pcs - ₱69", pcs: 5, price: 69 },
    { label: "8 pcs - ₱99", pcs: 8, price: 99 },
  ],
};

const createVariant = () => ({
  label: "",
  pcs: "",
  price: "",
});

const toMenuDraft = (menu) => {
  const source = menu && typeof menu === "object" ? menu : DEFAULT_MENU;

  return Object.entries(source).map(([name, variants]) => ({
    id: `${name}-${Math.random().toString(16).slice(2)}`,
    name,
    variants: Array.isArray(variants) && variants.length
      ? variants.map((variant) => ({
          id: `${name}-${Math.random().toString(16).slice(2)}`,
          label: variant?.label ?? "",
          pcs: variant?.pcs ?? "",
          price: variant?.price ?? "",
        }))
      : [createVariant()],
  }));
};

const normalizeMenuConfig = (draftProducts) => {
  const normalized = {};

  draftProducts.forEach((product) => {
    const productName = String(product.name || "").trim();

    if (!productName) {
      return;
    }

    const variants = (product.variants || [])
      .filter((variant) => variant && (variant.pcs || variant.price || variant.label))
      .map((variant) => {
        const pcs = Number(variant.pcs ?? 0);
        const price = Number(variant.price ?? 0);
        const label = String(variant.label || "").trim();

        return {
          label:
            label ||
            `${Number.isFinite(pcs) && pcs > 0 ? pcs : ""} pcs - ₱${Number.isFinite(price) && price > 0 ? price : 0}`,
          pcs: Number.isFinite(pcs) && pcs > 0 ? pcs : 1,
          price: Number.isFinite(price) && price > 0 ? price : 0,
        };
      });

    if (variants.length > 0) {
      normalized[productName] = variants;
    }
  });

  return Object.keys(normalized).length ? normalized : DEFAULT_MENU;
};

export default function AdminTab({
  brand,
  setBrand,
  menuConfig,
  setMenuConfig,
  inventoryRows,
  setInventoryRows,
  setErrorMessage,
}) {
  const fileInputRef = useRef(null);
  const [brandForm, setBrandForm] = useState({
    name: brand?.name || "ChurroZi",
    logo: brand?.logo || "/churrozi-logo.jpg",
  });
  const [menuDraft, setMenuDraft] = useState(() => toMenuDraft(menuConfig));
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isSavingMenu, setIsSavingMenu] = useState(false);
  const [isSavingInventory, setIsSavingInventory] = useState(false);

  useEffect(() => {
    setBrandForm({
      name: brand?.name || "ChurroZi",
      logo: brand?.logo || "/churrozi-logo.jpg",
    });
    setMenuDraft(toMenuDraft(menuConfig));
  }, [brand, menuConfig]);

  const handleBrandSave = (event) => {
    event.preventDefault();
    setIsSavingBrand(true);
    setErrorMessage("");

    try {
      const nextBrand = {
        name: brandForm.name.trim() || "ChurroZi",
        logo: brandForm.logo.trim() || "/churrozi-logo.jpg",
      };

      setBrand(nextBrand);
    } catch (error) {
      setErrorMessage(`Unable to save business details: ${error.message}`);
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleLogoFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please choose a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBrandForm((previous) => ({
        ...previous,
        logo: String(reader.result),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingImage(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      handleLogoFile(file);
    }
  };

  const handleMenuSave = (event) => {
    event.preventDefault();
    setIsSavingMenu(true);
    setErrorMessage("");

    try {
      const parsed = normalizeMenuConfig(menuDraft);
      setMenuConfig(parsed);
    } catch (error) {
      setErrorMessage(`Menu update failed: ${error.message}`);
    } finally {
      setIsSavingMenu(false);
    }
  };

  const updateProductName = (productId, value) => {
    setMenuDraft((previous) =>
      previous.map((product) =>
        product.id === productId ? { ...product, name: value } : product,
      ),
    );
  };

  const updateVariant = (productId, variantId, field, value) => {
    setMenuDraft((previous) =>
      previous.map((product) =>
        product.id === productId
          ? {
              ...product,
              variants: product.variants.map((variant) =>
                variant.id === variantId ? { ...variant, [field]: value } : variant,
              ),
            }
          : product,
      ),
    );
  };

  const addProduct = () => {
    setMenuDraft((previous) => [
      ...previous,
      {
        id: `product-${Math.random().toString(16).slice(2)}`,
        name: "New Product",
        variants: [createVariant()],
      },
    ]);
  };

  const removeProduct = (productId) => {
    setMenuDraft((previous) => {
      if (previous.length === 1) {
        return [
          {
            id: `product-${Math.random().toString(16).slice(2)}`,
            name: "New Product",
            variants: [createVariant()],
          },
        ];
      }

      return previous.filter((product) => product.id !== productId);
    });
  };

  const addVariant = (productId) => {
    setMenuDraft((previous) =>
      previous.map((product) =>
        product.id === productId
          ? { ...product, variants: [...product.variants, createVariant()] }
          : product,
      ),
    );
  };

  const removeVariant = (productId, variantId) => {
    setMenuDraft((previous) =>
      previous.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        if (product.variants.length === 1) {
          return {
            ...product,
            variants: [createVariant()],
          };
        }

        return {
          ...product,
          variants: product.variants.filter((variant) => variant.id !== variantId),
        };
      }),
    );
  };

  const handleInventorySave = async (item, field, value) => {
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    const nextValue =
      field === "name"
        ? String(value || "").trim() || item.name
        : Math.max(0, Number(value) || 0);

    setIsSavingInventory(true);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("inventory")
        .update({ [field]: nextValue })
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      setInventoryRows((previous) =>
        previous.map((row) =>
          row.id === item.id ? { ...row, [field]: nextValue } : row,
        ),
      );
    } catch (error) {
      setErrorMessage(`Unable to update inventory: ${error.message}`);
    } finally {
      setIsSavingInventory(false);
    }
  };

  const handleInventoryDelete = async (item) => {
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${item.name}" from inventory?`,
    );

    if (!confirmed) {
      return;
    }

    setIsSavingInventory(true);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      setInventoryRows((previous) =>
        previous.filter((row) => row.id !== item.id),
      );
    } catch (error) {
      setErrorMessage(`Unable to delete inventory item: ${error.message}`);
    } finally {
      setIsSavingInventory(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-[#5A3A2E] via-[#8B5E3C] to-[#D8A66B] p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">Admin Settings</h2>
        <p className="mt-2 text-amber-100">
          Update your business identity, available menu, and packaging inventory.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleBrandSave}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <h3 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
            Business Info
          </h3>

          <div className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Name
              <input
                type="text"
                value={brandForm.name}
                onChange={(event) =>
                  setBrandForm((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none ring-0 focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </label>

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingImage(true);
              }}
              onDragLeave={() => setIsDraggingImage(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-4 text-center transition ${
                isDraggingImage
                  ? "border-[#d8a66b] bg-[#fff6eb] dark:bg-[#2a1f16]"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Drag and drop your logo here
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleLogoFile(file);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 rounded-xl bg-[#d8a66b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c38f54]"
              >
                Choose Image
              </button>
            </div>

            <div className="rounded-xl border border-dashed border-gray-300 p-3 dark:border-gray-600">
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Preview
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={brandForm.logo || "/churrozi-logo.jpg"}
                  alt="Brand logo preview"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div>
                  <p className="text-lg font-bold text-[#5A3A2E] dark:text-[#e8bd85]">
                    {brandForm.name || "ChurroZi"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingBrand}
            className="mt-5 rounded-xl bg-[#d8a66b] px-4 py-2 font-semibold text-white transition hover:bg-[#c38f54] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingBrand ? "Saving..." : "Save Business Info"}
          </button>
        </form>

        <form
          onSubmit={handleMenuSave}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
              Menu Editor
            </h3>
            <button
              type="button"
              onClick={addProduct}
              className="rounded-xl bg-[#5A3A2E] px-3 py-2 text-sm font-semibold text-white hover:bg-[#43291f]"
            >
              + Add Product
            </button>
          </div>

          <div className="mt-4 space-y-5">
            {menuDraft.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={product.name}
                    onChange={(event) =>
                      updateProductName(product.id, event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Product name"
                  />
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="rounded-lg border border-red-300 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="grid gap-2 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-900"
                    >
                      <div className="grid gap-2 sm:grid-cols-3">
                        <input
                          type="text"
                          value={variant.label}
                          onChange={(event) =>
                            updateVariant(
                              product.id,
                              variant.id,
                              "label",
                              event.target.value,
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="Label (optional)"
                        />
                        <input
                          type="number"
                          min="1"
                          value={variant.pcs}
                          onChange={(event) =>
                            updateVariant(
                              product.id,
                              variant.id,
                              "pcs",
                              event.target.value,
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="Qty"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(event) =>
                            updateVariant(
                              product.id,
                              variant.id,
                              "price",
                              event.target.value,
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="Price"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeVariant(product.id, variant.id)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete variant
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addVariant(product.id)}
                  className="mt-3 rounded-lg border border-[#d8a66b] px-3 py-2 text-sm font-medium text-[#5A3A2E] hover:bg-[#fff6eb] dark:text-[#e8bd85] dark:hover:bg-[#2a1f16]"
                >
                  + Add Variant
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSavingMenu}
            className="mt-5 rounded-xl bg-[#5A3A2E] px-4 py-2 font-semibold text-white transition hover:bg-[#43291f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingMenu ? "Saving..." : "Save Menu"}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h3 className="text-xl font-semibold text-[#5A3A2E] dark:text-[#e8bd85]">
          Inventory Management
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {inventoryRows.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="w-full">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                    Item Name
                    <input
                      type="text"
                      value={item.name}
                      onChange={(event) =>
                        handleInventorySave(item, "name", event.target.value)
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm font-semibold text-gray-900 focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </label>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                  {Number(item.stock ?? 0)} left
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={item.stock ?? 0}
                    onChange={(event) =>
                      handleInventorySave(item, "stock", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </label>

                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Min Stock
                  <input
                    type="number"
                    min="0"
                    value={item.minimum_stock ?? 5}
                    onChange={(event) =>
                      handleInventorySave(item, "minimum_stock", event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-900 focus:border-[#d8a66b] dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => handleInventoryDelete(item)}
                disabled={isSavingInventory}
                className="mt-4 w-full rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Delete Item
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
