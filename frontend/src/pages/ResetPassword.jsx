import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { API_BASE } from "../utils/api";

/* ======================================================
   REUSABLE INPUT FIELD (MEMOIZED)
====================================================== */
const InputField = React.memo(
  ({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    touched,
    icon: Icon,
  }) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
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
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors
              ${
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
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            className={`w-full rounded-xl border py-3 pl-10 pr-10 font-medium outline-none transition-all
              ${
                hasError
                  ? "border-red-500 bg-red-50/50 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 bg-gray-50/30 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              }
            `}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
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
   RESET PASSWORD PAGE
====================================================== */
const ResetPassword = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [form, setForm] = useState({
    token: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- VALIDATION ---------------- */
  const validateField = useCallback((name, value, values) => {
    if (name === "token") {
      return value ? "" : "Reset token is required";
    }

    if (name === "newPassword") {
      return value.length >= 6
        ? ""
        : "Password must be at least 6 characters";
    }

    if (name === "confirmPassword") {
      return value === values.newPassword
        ? ""
        : "Passwords do not match";
    }

    return "";
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };

    setForm(updatedForm);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, updatedForm),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, form),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    const validationErrors = {
      token: validateField("token", form.token, form),
      newPassword: validateField("newPassword", form.newPassword, form),
      confirmPassword: validateField(
        "confirmPassword",
        form.confirmPassword,
        form
      ),
    };

    if (Object.values(validationErrors).some(Boolean)) {
      setErrors(validationErrors);
      setTouched({
        token: true,
        newPassword: true,
        confirmPassword: true,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: form.token,
            newPassword: form.newPassword,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      setSuccessMessage(
        "Password updated successfully! Redirecting to login..."
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-10 shadow-2xl shadow-blue-900/5">

          {/* HEADER */}
          <header className="mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ShieldCheck size={28} />
            </div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-gray-900">
              Set New Password
            </h1>
            <p className="font-medium text-gray-500">
              Secure your account with a new password.
            </p>
          </header>

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700 animate-in zoom-in-95">
              <CheckCircle2 size={20} className="shrink-0" />
              {successMessage}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {serverError && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600 animate-in zoom-in-95">
              <AlertCircle size={20} className="shrink-0" />
              {serverError}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Reset Token"
              name="token"
              placeholder="Paste your token here"
              icon={ShieldCheck}
              value={form.token}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.token}
              touched={touched.token}
            />

            <InputField
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.newPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.newPassword}
              touched={touched.newPassword}
            />

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className={`relative cursor-pointer mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white transition-all
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
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
