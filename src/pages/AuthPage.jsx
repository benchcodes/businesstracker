import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthPage({ darkMode, setDarkMode }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Supabase is not configured. Add your environment variables first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = isSignUp
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
          })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (result.error) {
        throw result.error;
      }

      if (isSignUp && !result.data.session) {
        setMessage("Account created. Check your email to confirm your account, then log in.");
      }
    } catch (error) {
      setMessage(error.message || "Unable to authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className={`flex min-h-screen items-center justify-center px-6 py-12 transition-colors duration-500 ${
        darkMode ? "bg-[#080d18] text-white" : "bg-[#faf8f5] text-gray-900"
      }`}
    >
      <button
        type="button"
        onClick={() => setDarkMode((previous) => !previous)}
        className="absolute right-6 top-6 rounded-xl bg-[#d8a66b] px-4 py-2 font-semibold text-white shadow-lg transition hover:bg-[#c38f54]"
      >
        {darkMode ? "Light mode" : "Dark mode"}
      </button>

      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="/benzi-logo.svg"
            alt="Benzi Tracker logo"
            className="mx-auto h-24 w-24 rounded-full object-cover shadow-xl ring-4 ring-[#d8a66b]/40"
          />
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8a66b]">
            Benzi Tracker
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">Your tracker, your data.</h1>
          <p className={`mt-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {isSignUp ? "Create an account for your business." : "Log in to continue to your business tracker."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-5 rounded-2xl border p-6 shadow-2xl ${
            darkMode ? "border-gray-700 bg-[#111827]" : "border-gray-200 bg-white"
          }`}
        >
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 outline-none transition focus:border-[#d8a66b] dark:border-gray-600"
              placeholder="you@example.com"
            />
          </label>

          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 outline-none transition focus:border-[#d8a66b] dark:border-gray-600"
              placeholder="At least 6 characters"
            />
          </label>

          {message && (
            <p className="rounded-xl bg-[#d8a66b]/15 px-4 py-3 text-sm text-[#9a682f] dark:text-[#e8bd85]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[#d8a66b] px-4 py-3 font-bold text-white transition hover:bg-[#c38f54] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Please wait..." : isSignUp ? "Create account" : "Log in"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp((previous) => !previous);
              setMessage("");
            }}
            className="w-full text-sm font-semibold text-[#a9753e] hover:underline dark:text-[#e8bd85]"
          >
            {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        </form>
      </section>
    </main>
  );
}
