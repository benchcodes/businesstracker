import { useEffect, useState } from "react";

export default function Welcome({ onStart, darkMode, setDarkMode, brand }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-6 transition-colors duration-500 ${
        darkMode ? "bg-[#080d18] text-white" : "bg-[#faf8f5] text-gray-900"
      }`}
    >
      {/* Background Glow */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
          darkMode ? "bg-[#d8a66b]/10" : "bg-[#d8a66b]/20"
        }`}
      />

      {/* DARK / LIGHT BUTTON */}
      <button
        type="button"
        onClick={() => setDarkMode((previous) => !previous)}
        className="absolute right-6 top-6 rounded-xl bg-[#d8a66b] px-4 py-2 font-semibold text-white shadow-lg transition duration-200 hover:scale-105 hover:bg-[#c38f54]"
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* CONTENT */}
      <div
        className={`relative flex w-full max-w-lg flex-col items-center text-center transition-all duration-1000 ease-out ${
          loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* LOGO */}
        <div
          className={`mb-8 transition-all duration-1000 ease-out ${
            loaded ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          <img
            src={brand?.logo || "/benzi-logo.svg"}
            alt={`${brand?.name || "Benzi Tracker"} Logo`}
            className="h-64 w-64 rounded-full object-cover shadow-2xl ring-4 ring-[#d8a66b]/50 transition-transform duration-500 hover:scale-105 sm:h-72 sm:w-72"
          />
        </div>

        {/* BRAND */}
        <h1
          className={`text-4xl font-extrabold tracking-tight transition-all delay-300 duration-700 sm:text-5xl ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          } ${darkMode ? "text-[#e8bd85]" : "text-[#5A3A2E]"}`}
        >
          {brand?.name || "Benzi Tracker"}
        </h1>

        {/* SUBTITLE */}
        <p
          className={`mt-3 text-lg transition-all delay-500 duration-700 ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          } ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          Churros Business &amp; Financial Tracker
        </p>

        {/* DESCRIPTION */}
        <p
          className={`mt-2 max-w-md text-sm leading-relaxed transition-all delay-700 duration-700 ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          } ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Manage your orders, expenses, sales, savings, and tuition fee goals in
          one place.
        </p>

        {/* START BUTTON */}
        <button
          type="button"
          onClick={onStart}
          className={`mt-8 rounded-2xl bg-[#d8a66b] px-10 py-4 text-lg font-bold text-white shadow-lg transition-all delay-1000 duration-700 hover:-translate-y-1 hover:scale-105 hover:bg-[#c38f54] hover:shadow-xl active:scale-100 ${
            loaded ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          Start
        </button>

        {/* TAGLINE */}
        <p
          className={`mt-6 text-xs tracking-widest transition-all delay-[1200ms] duration-700 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${darkMode ? "text-gray-500" : "text-gray-400"}`}
        >
          CRISPY OUTSIDE, SWEET INSIDE
        </p>
      </div>
    </div>
  );
}
