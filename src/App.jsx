import { startTransition, useCallback, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import AuthPage from "./pages/AuthPage";
import { supabase } from "./lib/supabase";

const DEFAULT_BRAND = {
  name: "Benzi Tracker",
  logo: "/benzi-logo.svg",
};

const LEGACY_DEFAULT_LOGOS = new Set([
  "/churrozi-logo.jpg",
  "churrozi-logo.jpg",
]);

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

const readStoredJson = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const hasStoredValue = (key) => localStorage.getItem(key) !== null;

const normalizeBrand = (brand, session) => {
  const nextBrand = {
    ...getInitialBrand(session),
    ...(brand || {}),
  };

  if (LEGACY_DEFAULT_LOGOS.has(nextBrand.logo)) {
    nextBrand.logo = DEFAULT_BRAND.logo;
  }

  return nextBrand;
};

const getInitialBrand = (session) => ({
  ...DEFAULT_BRAND,
  name: session?.user?.user_metadata?.business_name?.trim() || DEFAULT_BRAND.name,
});

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [activeView, setActiveView] = useState("summary");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // =========================
  // WELCOME PAGE
  // =========================
  const [started, setStarted] = useState(false);

  // =========================
  // DARK MODE
  // Dark is DEFAULT
  // =========================
  const storageKey = useCallback(
    (key) => `${key}-${session?.user?.id || "guest"}`,
    [session],
  );

  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      startTransition(() => {
        setSession(data.session);
        setAuthLoading(false);
      });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStarted(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) {
      return;
    }

    const savedMode = localStorage.getItem(storageKey("darkMode"));

    startTransition(() => {
      setDarkMode(savedMode === null ? true : savedMode === "true");
    });
  }, [session, storageKey]);

  const [brand, setBrand] = useState(() => getInitialBrand(session));
  const [menuConfig, setMenuConfig] = useState(DEFAULT_MENU);
  const [settingsOwner, setSettingsOwner] = useState(null);

  useEffect(() => {
    if (session === undefined) {
      return;
    }

    startTransition(() => {
      setBrand(
        normalizeBrand(
          readStoredJson(storageKey("churrozi-brand"), null),
          session,
        ),
      );
      const menuKey = storageKey("churrozi-menu");
      setMenuConfig(
        hasStoredValue(menuKey)
          ? readStoredJson(menuKey, {})
          : DEFAULT_MENU,
      );
      setSettingsOwner(session?.user?.id || "guest");
    });
  }, [session, storageKey]);

  // =========================
  // APPLY DARK MODE
  // TO ENTIRE WEBSITE
  // =========================
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (session === undefined || settingsOwner !== (session?.user?.id || "guest")) {
      return;
    }

    localStorage.setItem(storageKey("darkMode"), String(darkMode));
    localStorage.setItem(storageKey("churrozi-brand"), JSON.stringify(brand));
    localStorage.setItem(storageKey("churrozi-menu"), JSON.stringify(menuConfig));
  }, [brand, darkMode, menuConfig, session, settingsOwner, storageKey]);

  // =========================
  // START WEBSITE
  // =========================
  const handleStart = () => {
    setStarted(true);
  };

  // =========================
  // WELCOME PAGE
  // =========================
  if (authLoading) {
    return null;
  }

  if (!session) {
    return <AuthPage darkMode={darkMode} setDarkMode={setDarkMode} />;
  }

  if (!started) {
    return (
      <Welcome
        onStart={handleStart}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        brand={brand}
      />
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#080d18] text-white" : "bg-[#faf8f5] text-gray-900"
      }`}
    >
      {/* MOBILE HAMBURGER */}
      <button
        aria-label="Toggle sidebar"
        aria-expanded={sidebarOpen}
        className={`fixed left-4 top-4 z-50 rounded-md p-2 shadow-sm md:hidden ${
          darkMode ? "bg-gray-800 text-white" : "bg-white/90 text-gray-900"
        }`}
        onClick={() => setSidebarOpen((s) => !s)}
      >
        <div className="relative h-6 w-6">
          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 -translate-y-2 transform transition-all duration-200 ${
              sidebarOpen ? "rotate-45 translate-y-0" : ""
            } ${darkMode ? "bg-white" : "bg-gray-900"}`}
          />

          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 transform transition-all duration-200 ${
              sidebarOpen ? "scale-75 opacity-0" : "scale-100 opacity-100"
            } ${darkMode ? "bg-white" : "bg-gray-900"}`}
          />

          <span
            className={`absolute left-0 top-1/2 h-0.5 w-6 translate-y-2 transform transition-all duration-200 ${
              sidebarOpen ? "-rotate-45 -translate-y-0" : ""
            } ${darkMode ? "bg-white" : "bg-gray-900"}`}
          />
        </div>
      </button>

      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          brand={brand}
          userEmail={session.user.email}
          onSignOut={() => supabase.auth.signOut()}
        />

        {/* MAIN */}
        <main
          className={`min-h-screen flex-1 transition-colors duration-300 md:pl-64 ${
            darkMode ? "bg-[#080d18]" : "bg-[#faf8f5]"
          }`}
        >
          <Dashboard
            activeView={activeView}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            userId={session.user.id}
            brand={brand}
            setBrand={setBrand}
            menuConfig={menuConfig}
            setMenuConfig={setMenuConfig}
          />
        </main>
      </div>
    </div>
  );
}
