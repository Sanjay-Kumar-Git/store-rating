import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Loader2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { API_BASE } from "../utils/api";

/* ======================================================
   REUSABLE INPUT FIELD (MEMOIZED)
====================================================== */
const InputField = React.memo(
  ({
    label,
    name,
    type,
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    touched,
    icon: Icon,
  }) => {
    const hasError = Boolean(error && touched);

    return (
      <div className="flex w-full flex-col space-y-1.5">
        <label
          htmlFor={name}
          className="ml-1 text-[11px] font-bold uppercase tracking-widest text-gray-400"
        >
          {label}
        </label>

        <div className="group relative">
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
              hasError
                ? "text-red-400"
                : "text-gray-400 group-focus-within:text-blue-600"
            }`}
          >
            <Icon size={18} />
          </div>

          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`w-full rounded-xl border py-3 pl-10 pr-4 font-medium outline-none transition-all
              ${
                hasError
                  ? "border-red-500 bg-red-50/50 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 bg-gray-50/30 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              }
            `}
          />
        </div>

        <div className="ml-1 min-h-[1.25rem]">
          {hasError && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={12} />
              {error}
            </span>
          )}
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";

/* ======================================================
   FORGOT PASSWORD PAGE
====================================================== */
const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================================================
     VALIDATION
  ====================================================== */
  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? ""
      : "Enter a valid email address";

  /* ======================================================
     HANDLERS
  ====================================================== */
  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (touched) {
      setError(validateEmail(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetToken("");

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setTouched(true);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to process request");
      }

      setMessage("Reset token generated successfully");
      setResetToken(data.resetToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to reset page with token (test mode)
  const handleResetNavigate = useCallback(() => {
    if (resetToken) {
      navigate(`/reset-password?token=${resetToken}`);
    }
  }, [resetToken, navigate]);

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-10 shadow-2xl shadow-blue-900/5">

          {/* HEADER */}
          <header className="mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <KeyRound size={28} />
            </div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-gray-900">
              Forgot Password?
            </h1>
            <p className="px-4 font-medium text-gray-500">
              Enter your email and we’ll generate a reset token.
            </p>
          </header>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700">
              <CheckCircle2 size={20} />
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={error}
              touched={touched}
            />

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white transition-all
                ${
                  loading
                    ? "cursor-wait bg-blue-400"
                    : "bg-blue-600 shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.97]"
                }
              `}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "Get Reset Token"
              )}
            </button>
          </form>

          {/* RESET TOKEN (TEST MODE) */}
          {resetToken && (
            <div className="mt-6 space-y-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Test Mode
                </p>
                <code className="block break-all rounded-lg border bg-white p-2 font-mono text-xs text-blue-700">
                  {resetToken}
                </code>
              </div>

              <button
                onClick={handleResetNavigate}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white transition-all hover:bg-emerald-700 active:scale-[0.97] shadow-lg shadow-emerald-600/20"
              >
                <KeyRound size={18} />
                Reset Password
              </button>
            </div>
          )}

          {/* FOOTER */}
          <footer className="mt-8 border-t border-gray-50 pt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
