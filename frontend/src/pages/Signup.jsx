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

/**
 * Reusable Input Component
 */
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
    const isPasswordField = type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;
    const hasError = error && touched;

    return (
      <div className="flex flex-col space-y-1.5 w-full">
        <label
          htmlFor={name}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1"
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
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={hasError ? "true" : "false"}
            className={`w-full pl-10 pr-10 py-3 rounded-xl border transition-all duration-200 outline-none font-medium
              ${
                hasError
                  ? "border-red-500 bg-red-50/50 focus:ring-4 focus:ring-red-500/10"
                  : "border-gray-200 bg-gray-50/30 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10"
              }
            `}
          />

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        <div className="min-h-[1.25rem] ml-1">
          {hasError && (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </span>
          )}
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";

const Signup = () => {
  const navigate = useNavigate();

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

  /* ✅ AUTH GUARD: block /signup if already logged in */
  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      navigate(`/${role}`, { replace: true });
    }
  }, [navigate]);

  const getValidationError = useCallback((name, value) => {
    switch (name) {
      case "name":
        return value.trim().length < 2
          ? "Please enter your full name"
          : "";
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Enter a valid email address"
          : "";
      case "password":
        return value.length < 8
          ? "Password must be at least 8 characters"
          : "";
      default:
        return "";
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: getValidationError(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: getValidationError(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const formErrors = {};
    Object.keys(form).forEach((key) => {
      const error = getValidationError(key, form[key]);
      if (error) formErrors[key] = error;
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
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

      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white p-10 rounded-[2rem] shadow-2xl border border-gray-100">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-500 font-medium">
              Start your journey with us today.
            </p>
          </header>

          {serverError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 mb-6 rounded-2xl text-sm font-semibold">
              <AlertCircle size={20} />
              <p>{serverError}</p>
            </div>
          )}

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
              className={`flex items-center justify-center gap-2 w-full py-4 mt-4 rounded-2xl font-bold text-white transition-all
                ${
                  loading
                    ? "bg-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.97] shadow-xl shadow-blue-600/20"
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <footer className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 font-bold hover:text-blue-700"
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
