import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";
import newLrtLogo from "../../imports/image-removebg-preview_(1)-1.png";
import { supabase } from "../../../backend/supabase";

const BG_IMAGE =
  "https://images.unsplash.com/photo-1665148522404-14fd426c2e50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMUlQlMjBMaW5lJTIwMiUyMHN0YXRpb24lMjBwbGF0Zm9ybSUyMGFuZCUyMHRyYWNrc3xlbnwxfHx8fDE3NzY2MTQ5OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

// Shake keyframes via inline style animation
const shakeKeyframes = `
@keyframes shake {
  0%   { transform: translateX(0); }
  12%  { transform: translateX(-8px); }
  25%  { transform: translateX(8px); }
  37%  { transform: translateX(-8px); }
  50%  { transform: translateX(6px); }
  62%  { transform: translateX(-4px); }
  75%  { transform: translateX(4px); }
  87%  { transform: translateX(-2px); }
  100% { transform: translateX(0); }
}
.shake { animation: shake 0.45s ease-in-out; }
`;

function ParticleBackground() {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white opacity-30"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -1000],
            x: [0, Math.random() * 100 - 50],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = useCallback(
    async (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;
      setError("");
      setLoading(true);

      if (email.trim() && password.trim()) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (authError) {
          setLoading(false);
          setError(authError.message);
          triggerShake();
        } else {
          sessionStorage.setItem("isAuthenticated", "true");
          navigate("/iam-portal");
        }
      } else {
        setLoading(false);
        setError("Please enter both email and password.");
        triggerShake();
      }
    },
    [email, password, loading, navigate]
  );

  return (
    <>
      <style>{shakeKeyframes}</style>
      <div
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* ── Background Image ── */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${BG_IMAGE}')` }}
        />

        {/* ── Gradient Overlay ── */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(26,0,58,0.92) 0%, rgba(75,0,130,0.85) 50%, rgba(45,0,87,0.92) 100%)",
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center w-full px-4 py-10 gap-8">

          {/* ── Top Branding ── */}
          <motion.div
            className="flex flex-col items-center gap-3 text-center"
            initial={{ opacity: 0, y: -32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            {/* Logo + Title */}
            <div className="flex items-center w-full max-w-[28rem] mb-1 pl-1">
              {/* Literal logo only, no container */}
              <img
                src={newLrtLogo.src}
                alt="LRT-2 Logo"
                style={{
                  width: 96,
                  height: 96,
                  objectFit: "contain",
                  filter: "brightness(1.5) contrast(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
                  marginRight: "-0.75rem",
                }}
                className="flex-shrink-0"
              />

              {/* Title & subtitle */}
              <div className="flex flex-col text-left justify-center ml-5">
                <p
                  className="text-white tracking-wider m-0"
                  style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "0.05em", lineHeight: 1.2 }}
                >
                  I.A.M PORTAL
                </p>
                <p
                  className="tracking-wide m-0 mt-1"
                  style={{
                    color: "rgba(216,191,216,0.9)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    letterSpacing: "0.03em"
                  }}
                >
                  Provision System
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-full border w-full max-w-[28rem]"
              style={{
                background: "rgba(255,255,255,0.10)",
                borderColor: "rgba(255,255,255,0.20)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
                style={{
                  boxShadow: "0 0 6px 2px rgba(74,222,128,0.7)",
                  animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                }}
              />
              <span
                className="text-green-300 uppercase tracking-widest"
                style={{ fontSize: "0.65rem", fontWeight: 600 }}
              >
                System Online — Secure Access Required
              </span>
            </div>
          </motion.div>

          {/* ── Login Card ── */}
          <motion.div
            className={`w-full max-w-md bg-white overflow-hidden ${shaking ? "shake" : ""}`}
            style={{
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
          >
            {/* Card Header */}
            <div
              className="px-8 py-6"
              style={{ background: "#4B0082" }}
            >
              <h2
                className="text-white"
                style={{ fontWeight: 700, fontSize: "1.05rem" }}
              >
                System Administrator Login
              </h2>
              <p style={{ color: "#D8BFD8", fontSize: "0.78rem", marginTop: 4 }}>
                Enter administrative credentials to provision and manage personnel access
              </p>
            </div>

            {/* Card Body */}
            <div className="px-8 py-7 flex flex-col gap-5">

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="flex items-start gap-3 px-4 py-3 rounded-lg"
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: "8px",
                    }}
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AlertCircle
                      size={16}
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    />
                    <p
                      className="text-red-700"
                      style={{ fontSize: "0.78rem", lineHeight: 1.5 }}
                    >
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="on">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-gray-700"
                    style={{ fontSize: "0.82rem", fontWeight: 600 }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter admin email"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      background: "#FAFAFA",
                      border: "1px solid #D1D1D6",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      color: "#111",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4B0082";
                      e.target.style.boxShadow = "0 0 0 3px rgba(75,0,130,0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#D1D1D6";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-gray-700"
                    style={{ fontSize: "0.82rem", fontWeight: 600 }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        background: "#FAFAFA",
                        border: "1px solid #D1D1D6",
                        borderRadius: "8px",
                        padding: "10px 42px 10px 14px",
                        fontSize: "0.85rem",
                        color: "#111",
                        outline: "none",
                        width: "100%",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#4B0082";
                        e.target.style.boxShadow = "0 0 0 3px rgba(75,0,130,0.15)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#D1D1D6";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#4B0082] transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between">
                  <label
                    className="flex items-center gap-2 cursor-pointer select-none"
                    style={{ fontSize: "0.8rem", color: "#374151" }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#4B0082]"
                      style={{ accentColor: "#4B0082" }}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="hover:underline"
                    style={{
                      fontSize: "0.8rem",
                      color: "#4B0082",
                      fontWeight: 500,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() => {}}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-white transition-all"
                  style={{
                    background: loading ? "#7c3aed" : "#4B0082",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading
                      ? "0 4px 20px rgba(75,0,130,0.25)"
                      : "0 4px 20px rgba(75,0,130,0.45)",
                    transition: "background 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = "#3d006a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background = "#4B0082";
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield size={16} />
                      Access Provision System
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p
            className="text-center"
            style={{ color: "rgba(216,191,216,0.60)", fontSize: "0.7rem" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >© 2026 CJMN Technologies</motion.p>
        </div>
      </div>
    </>
  );
}
