import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Mail, Lock, ArrowRight, ArrowLeft, KeyRound, CheckCircle2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as api from "@/services/api";

type Step = "email" | "otp" | "reset" | "success";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1: Request OTP ──────────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.requestOtp(email.trim());
      toast({
        title: "OTP Sent!",
        description: "Check your backend console for the 4-digit OTP.",
      });
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const next = [...otp];
    next[index] = value.slice(-1); // one digit per box
    setOtp(next);
    // Auto-advance
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(""));
      document.getElementById("otp-3")?.focus();
    }
    e.preventDefault();
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.verifyOtp(email.trim(), otpString);
      toast({ title: "OTP Verified!", description: "Now set your new password." });
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ───────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.resetPassword(email.trim(), otp.join(""), newPassword);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = { email: 1, otp: 2, reset: 3, success: 3 }[step];

  return (
    <div className="min-h-screen bg-background flex animate-fade-in">
      {/* Left – Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg text-foreground">CRS</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">Course Recommendation System</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-8">

            {/* Step Indicator */}
            {step !== "success" && (
              <div className="flex items-center gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        s < stepLabel
                          ? "bg-primary text-white"
                          : s === stepLabel
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s < stepLabel ? "✓" : s}
                    </div>
                    {s < 3 && (
                      <div className={`h-0.5 w-8 rounded transition-all duration-300 ${s < stepLabel ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
                <span className="ml-2 text-xs text-muted-foreground">
                  {step === "email" ? "Enter email" : step === "otp" ? "Verify OTP" : "New password"}
                </span>
              </div>
            )}

            {/* ── STEP 1: Email ── */}
            {step === "email" && (
              <>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Forgot Password</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Enter your registered email and we'll send you a 4-digit OTP.
                </p>
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      className="pl-10 rounded-xl h-11"
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" variant="gradient" className="w-full rounded-xl h-11 text-base" disabled={loading}>
                    {loading ? "Sending OTP..." : <><span>Send OTP</span> <ArrowRight className="ml-1 h-4 w-4" /></>}
                  </Button>
                </form>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === "otp" && (
              <>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">Enter OTP</h1>
                <p className="text-muted-foreground text-sm mb-2">
                  A 4-digit OTP was printed to the backend console for{" "}
                  <span className="text-foreground font-medium">{email}</span>.
                </p>
                <p className="text-xs text-muted-foreground mb-8">
                  OTP is valid for <span className="text-primary font-medium">5 minutes</span>.
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP boxes */}
                  <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 bg-background text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/25 ${
                          digit ? "border-primary" : "border-border"
                        }`}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                  {error && <p className="text-sm text-destructive text-center">{error}</p>}
                  <Button type="submit" variant="gradient" className="w-full rounded-xl h-11 text-base" disabled={loading}>
                    {loading ? "Verifying..." : <><KeyRound className="mr-1 h-4 w-4" /><span>Verify OTP</span></>}
                  </Button>
                </form>
                {/* Resend */}
                <button
                  type="button"
                  className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => {
                    setOtp(["", "", "", ""]);
                    setError(null);
                    setStep("email");
                  }}
                >
                  <RefreshCw className="h-3 w-3" /> Change email or resend OTP
                </button>
              </>
            )}

            {/* ── STEP 3: New Password ── */}
            {step === "reset" && (
              <>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">New Password</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Choose a strong password for your account.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="New password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                      className="pl-10 rounded-xl h-11"
                      autoFocus
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                      className="pl-10 rounded-xl h-11"
                    />
                  </div>
                  {/* Password strength hint */}
                  {newPassword && (
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            newPassword.length >= i * 3
                              ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-yellow-400" : i <= 3 ? "bg-blue-400" : "bg-green-400"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" variant="gradient" className="w-full rounded-xl h-11 text-base" disabled={loading}>
                    {loading ? "Resetting..." : <><span>Reset Password</span> <ArrowRight className="ml-1 h-4 w-4" /></>}
                  </Button>
                </form>
              </>
            )}

            {/* ── SUCCESS ── */}
            {step === "success" && (
              <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">Password Reset!</h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                <Button
                  id="go-to-login"
                  variant="gradient"
                  className="w-full rounded-xl h-11 text-base"
                  onClick={() => navigate("/login")}
                >
                  Go to Sign In <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Back to login (non-success steps) */}
            {step !== "success" && (
              <button
                type="button"
                className="mt-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right – Decorative Panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-[0.06]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative z-10 text-center px-12">
          {/* Animated lock icon */}
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30" />
              <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-primary/30 flex items-center justify-center">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
          <p className="font-display text-lg font-semibold text-foreground/60 mb-2">Secure Recovery</p>
          <p className="text-sm text-muted-foreground">4-digit OTP verification to keep your account safe.</p>

          {/* Steps preview */}
          <div className="mt-8 space-y-3 text-left">
            {[
              { icon: Mail, label: "Enter your email address" },
              { icon: KeyRound, label: "Verify 4-digit OTP" },
              { icon: Lock, label: "Set your new password" },
            ].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3 bg-card/30 backdrop-blur px-4 py-3 rounded-xl border border-border/30">
                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
