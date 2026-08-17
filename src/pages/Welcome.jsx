import { useEffect, useState } from "react";

export default function Welcome({
  onStart,
  darkMode,
  setDarkMode,
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after page loads
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-6 transition-colors duration-300 ${
        darkMode
          ? "bg-[#111827] text-white"
          : "bg-[#faf8f5] text-gray-900"
      }`}
    >
      {/* Dark Mode */}
      <button
        type="button"
        onClick={() =>
          setDarkMode((previous) => !previous)
        }
        className={`absolute right-6 top-6 rounded-xl px-4 py-2 font-semibold text-white shadow-sm transition hover:scale-105 ${
          darkMode
            ? "bg-[#d8a66b] hover:bg-[#c38f54]"
            : "bg-[#d8a66b] hover:bg-[#c38f54]"
        }`}
      >
        {darkMode
          ? "☀️ Light Mode"
          : "🌙 Dark Mode"}
      </button>

      {/* Welcome Content */}
      <div
        className={`flex w-full max-w-lg flex-col items-center text-center transition-all duration-1000 ease-out ${
          loaded
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        {/* Logo */}
        <div
          className={`mb-8 transition-all duration-1000 ease-out ${
            loaded
              ? "scale-100 opacity-100"
              : "scale-75 opacity-0"
          }`}
        >
          <img
            src="/churrozi-logo.jpg"
            alt="ChurroZi Logo"
            className="h-64 w-64 rounded-full object-cover shadow-2xl ring-4 ring-[#d8a66b]/40 transition-transform duration-500 hover:scale-105 sm:h-72 sm:w-72"
          />
        </div>

        {/* Brand Name */}
        <h1
          className={`text-4xl font-extrabold tracking-tight transition-all delay-300 duration-700 sm:text-5xl ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          } ${
            darkMode
              ? "text-[#e8bd85]"
              : "text-[#5A3A2E]"
          }`}
        >
          ChurroZi
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-3 text-lg transition-all delay-500 duration-700 ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          } ${
            darkMode
              ? "text-gray-300"
              : "text-gray-600"
          }`}
        >
          Churros Business &amp; Financial Tracker
        </p>

        {/* Description */}
        <p
          className={`mt-2 max-w-md text-sm leading-relaxed transition-all delay-700 duration-700 ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          } ${
            darkMode
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          Manage your orders, expenses, sales,
          savings, and tuition fee goals in one place.
        </p>

        {/* Start Button */}
        <button
          type="button"
          onClick={onStart}
          className={`mt-8 rounded-2xl bg-[#d8a66b] px-10 py-4 text-lg font-bold text-white shadow-lg transition-all delay-1000 duration-700 hover:-translate-y-1 hover:scale-105 hover:bg-[#c38f54] hover:shadow-xl active:scale-100 ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
        >
          Start
        </button>

        {/* Tagline */}
        <p
          className={`mt-6 text-xs tracking-widest transition-all delay-[1200ms] duration-700 ${
            loaded
              ? "opacity-100"
              : "opacity-0"
          } ${
            darkMode
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          CRISPY OUTSIDE, SWEET INSIDE
        </p>
      </div>
    </div>
  );
}