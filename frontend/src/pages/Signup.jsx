import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  MapPin,
  Loader2,
  AlertCircle,
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
          className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400"
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
            aria-invalid={hasError}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        <div className="ml-1 min-h-[1.25rem]">
          {hasError && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-500">
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
   SIGNUP PAGE
====================================================== */
const Signup = () => {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      navigate(`/${role}`, { replace: true });
    }
  }, [navigate]);

  /* ---------------- VALIDATION ---------------- */
  const validateField = useCallback((name, value) => {
    switch (name) {
      case "name":
        return value.trim().length < 2
          ? "Please enter your full name"
          : "";

      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Enter a valid email address";

      case "password":
        return value.length >= 8
          ? ""
          : "Password must be at least 8 characters";

      default:
        return "";
    }
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) validationErrors[key] = error;
    });

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setTouched(
        Object.keys(form).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      navigate("/login", {
        replace: true,
        state: { message: "Account created! Please log in." },
      });
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
        <div className="rounded-[2rem] border border-gray-100 bg-white p-10 shadow-2xl">

          {/* HEADER */}
          <header className="mb-10 text-center">
            <h1 className="mb-2 text-3xl font-black text-gray-900">
              Create Account
            </h1>
            <p className="font-medium text-gray-500">
              Start your journey with us today.
            </p>
          </header>

          {/* ERROR */}
          {serverError && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
              <AlertCircle size={20} />
              {serverError}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Full Name"
              name="name"
              placeholder="Enter your name"
              icon={User}
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              touched={touched.name}
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@company.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
            />

            <InputField
              label="Address"
              name="address"
              placeholder="123 Street, City"
              icon={MapPin}
              value={form.address}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loading}
              className={`mt-4 flex cursor-pointer w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white transition-all
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
                "Create Account"
              )}
            </button>
          </form>

          {/* FOOTER */}
          <footer className="mt-10 border-t border-gray-50 pt-8 text-center">
            <p className="text-sm font-medium text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="cursor-pointer font-bold text-blue-600 hover:text-blue-700"
              >
                Log In
              </button>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Signup;
