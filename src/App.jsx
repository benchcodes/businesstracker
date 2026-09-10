import { startTransition, useCallback, useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import AuthPage from "./pages/AuthPage";
import { supabase } from "./lib/supabase";

const DEFAULT_BRAND = {
  name: "Benzi Tracker",
  logo: "/benzi-logo.png",
};

const DEFAULT_MENU = {
  "Example Product": [
    { label: "Example - ₱0", pcs: 1, price: 0 },
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

export default function App() {
  const [session, setSession] = useState(undefined);
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

    supabase.auth.getSession().then(async ({ data }) => {
      let nextSession = data.session;

      if (
        nextSession?.expires_at &&
        nextSession.expires_at <= Math.floor(Date.now() / 1000) + 60
      ) {
        const { data: refreshedData, error: refreshError } =
          await supabase.auth.refreshSession();

        if (!refreshError && refreshedData.session) {
          nextSession = refreshedData.session;
        } else {
          await supabase.auth.signOut();
          nextSession = null;
        }
      }

      if (nextSession) {
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user) {
          nextSession = {
            ...nextSession,
            user: userData.user,
          };
        }
      }

      startTransition(() => {
        setSession(nextSession);
        setAuthLoading(false);
      });
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

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

  const brand = DEFAULT_BRAND;
  const [menuConfig, setMenuConfig] = useState(DEFAULT_MENU);
  const [settingsOwner, setSettingsOwner] = useState(null);

  useEffect(() => {
    if (session === undefined) {
      return;
    }

    startTransition(() => {
      const menuKey = storageKey("churrozi-menu");
      setMenuConfig(
        hasStoredValue(menuKey) ? readStoredJson(menuKey, {}) : DEFAULT_MENU,
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
    localStorage.setItem(storageKey("churrozi-menu"), JSON.stringify(menuConfig));
  }, [darkMode, menuConfig, session, settingsOwner, storageKey]);

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
          className={`min-w-0 min-h-screen flex-1 transition-colors duration-300 md:pl-64 ${
            darkMode ? "bg-[#080d18]" : "bg-[#faf8f5]"
          }`}
        >
          <Dashboard
            activeView={activeView}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            brand={brand}
            menuConfig={menuConfig}
            setMenuConfig={setMenuConfig}
          />
        </main>
      </div>
    </div>
  );
}
