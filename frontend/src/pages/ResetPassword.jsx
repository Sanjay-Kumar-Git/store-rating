import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { API_BASE } from "../utils/api";

/**
 * Reusable Input Component (Memoized)
 */
const InputField = React.memo(({ label, name, type, placeholder, value, onChange, onBlur, error, touched, icon: Icon }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;
  const hasError = error && touched;

  return (
    <div className="flex flex-col space-y-1.5 w-full">
      <label htmlFor={name} className="text-[11px] font-bold uppercase tracking-widest text-gray-400 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${hasError ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-600'}`}>
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
            ${hasError 
              ? 'border-red-500 bg-red-50/50 focus:ring-4 focus:ring-red-500/10' 
              : 'border-gray-200 bg-gray-50/30 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'}
          `}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
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
});

InputField.displayName = "InputField";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ token: "", newPassword: "", confirmPassword: "" });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getValidationError = useCallback((name, value, allValues) => {
    if (name === "token") return value.length < 1 ? "Reset token is required" : "";
    if (name === "newPassword") return value.length < 6 ? "Password must be at least 6 characters" : "";
    if (name === "confirmPassword") return value !== allValues.newPassword ? "Passwords do not match" : "";
    return "";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: getValidationError(name, value, newForm) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: getValidationError(name, value, form) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setMessage("");

    const formErrors = {
      token: getValidationError("token", form.token, form),
      newPassword: getValidationError("newPassword", form.newPassword, form),
      confirmPassword: getValidationError("confirmPassword", form.confirmPassword, form),
    };

    if (Object.values(formErrors).some(err => err)) {
      setErrors(formErrors);
      setTouched({ token: true, newPassword: true, confirmPassword: true });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            token: form.token,
            newPassword: form.newPassword
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setMessage("Password updated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-gray-100">
          
          <header className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mb-4">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Set New Password</h1>
            <p className="text-gray-500 font-medium">Secure your account with a new password.</p>
          </header>

          {message && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 p-4 mb-6 rounded-2xl text-sm font-semibold animate-in zoom-in-95">
              <CheckCircle2 size={20} className="shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {serverError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 mb-6 rounded-2xl text-sm font-semibold animate-in zoom-in-95">
              <AlertCircle size={20} className="shrink-0" />
              <p>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField 
              label="Reset Token" name="token" placeholder="Paste your token here" icon={ShieldCheck}
              value={form.token} onChange={handleChange} onBlur={handleBlur} 
              error={errors.token} touched={touched.token}
            />
            <InputField 
              label="New Password" name="newPassword" type="password" placeholder="••••••••" icon={Lock}
              value={form.newPassword} onChange={handleChange} onBlur={handleBlur} 
              error={errors.newPassword} touched={touched.newPassword}
            />
            <InputField 
              label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" icon={Lock}
              value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} 
              error={errors.confirmPassword} touched={touched.confirmPassword}
            />

            <button
              type="submit"
              disabled={loading}
              className={`group cursor-pointer relative flex items-center justify-center gap-2 w-full py-4 mt-4 rounded-2xl font-bold text-white transition-all duration-300
                ${loading 
                  ? 'bg-blue-400 cursor-wait' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.97] shadow-xl shadow-blue-600/20'}
              `}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;