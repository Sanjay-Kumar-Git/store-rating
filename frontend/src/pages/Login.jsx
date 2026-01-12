import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  LogIn,
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
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;
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
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const successMsg = location.state?.message;

  /* ✅ AUTH GUARD: block /login if already logged in */
  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (token && role) {
      navigate(`/${role}`, { replace: true });
    }
  }, [navigate]);

  const getValidationError = useCallback((name, value) => {
    if (name === "email") {
      return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? "Invalid email address"
        : "";
    }
    if (name === "password") {
      return value.length < 1 ? "Password is required" : "";
    }
    return "";
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

    const formErrors = {
      email: getValidationError("email", form.email),
      password: getValidationError("password", form.password),
    };

    if (formErrors.email || formErrors.password) {
      setErrors(formErrors);
      setTouched({ email: true, password: true });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      /* ✅ COOKIE FIX (local + prod safe) */
      Cookies.set("token", data.token, {
        expires: 7,
        sameSite: "strict",
        secure: import.meta.env.PROD,
      });
      Cookies.set("role", data.role, {
        expires: 7,
        sameSite: "strict",
      });

      navigate(`/${data.role}`, { replace: true });
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
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mb-4">
              <LogIn size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 font-medium">
              Please enter your details to sign in.
            </p>
          </header>

          {successMsg && !serverError && (
            <div className="bg-green-50 border border-green-100 text-green-600 p-4 mb-6 rounded-2xl text-sm font-semibold">
              {successMsg}
            </div>
          )}

          {serverError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 mb-6 rounded-2xl text-sm font-semibold">
              <AlertCircle size={20} />
              <p>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              touched={touched.password}
            />

            <div className="flex justify-end pr-1">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white transition-all
                ${
                  loading
                    ? "bg-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-[0.97] shadow-xl shadow-blue-600/20"
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <footer className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500 font-medium">
              New to the platform?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 font-bold hover:text-blue-700"
              >
                Create Account
              </button>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;
