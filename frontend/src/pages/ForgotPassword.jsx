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

/**
 * Reusable Input Component (Memoized)
 */
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
    const hasError = error && touched;

    return (
      <div className="flex flex-col space-y-1.5 w-full">
        <label
          htmlFor={name}
          className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1"
        >
          {label}
        </label>

        <div className="relative group">
          <div
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
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
            className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 outline-none font-medium
              ${
                hasError
                  ? "border-red-500 bg-red-50/50 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 bg-gray-50/30 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              }
            `}
          />
        </div>

        <div className="min-h-[1.25rem] ml-1">
          {hasError && (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={12} /> {error}
            </span>
          )}
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (val) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      ? "Enter a valid email address"
      : "";

  const handleBlur = () => {
    setTouched(true);
    setError(validate(email));
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (touched) setError(validate(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setToken("");

    const emailError = validate(email);
    if (emailError) {
      setError(emailError);
      setTouched(true);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process request.");
      }

      setMessage("Reset token generated successfully!");
      setToken(data.resetToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate to reset page with token
  const handleResetNavigate = useCallback(() => {
    if (token) {
      navigate(`/reset-password?token=${token}`);
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-gray-100">
          {/* HEADER */}
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mb-4">
              <KeyRound size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-500 font-medium px-4">
              Enter your email and we&apos;ll provide a token to reset your
              password.
            </p>
          </header>

          {/* SUCCESS */}
          {message && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 p-4 mb-6 rounded-2xl text-sm font-semibold">
              <CheckCircle2 size={20} />
              <p>{message}</p>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 mb-6 rounded-2xl text-sm font-semibold">
              <AlertCircle size={20} />
              <p>{error}</p>
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
              className={`flex items-center cursor-pointer justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white transition-all
                ${
                  loading
                    ? "bg-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.97] shadow-xl shadow-blue-600/20"
                }
              `}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Get Reset Token"
              )}
            </button>
          </form>

          {/* TOKEN + RESET BUTTON */}
          {token && (
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Test Mode: Copy the Token and click Reset
                </p>
                <code className="text-xs text-blue-700 break-all font-mono bg-white p-2 rounded-lg border block">
                  {token}
                </code>
              </div>

              <button
                onClick={handleResetNavigate}
                className="flex cursor-pointer items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white
                  bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97]
                  transition-all shadow-lg shadow-emerald-600/20"
              >
                <KeyRound size={18} />
                Reset Password
              </button>
            </div>
          )}

          {/* FOOTER */}
          <footer className="mt-8 pt-6 border-t border-gray-50 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-500 font-bold hover:text-blue-600 transition-colors"
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
