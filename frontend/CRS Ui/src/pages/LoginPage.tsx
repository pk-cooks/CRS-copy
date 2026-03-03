import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Mail, Lock, ArrowRight, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup, googleLogin, loading, error } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const routeAfterAuth = (result: { isNewUser: boolean; hasDoneOnboarding: boolean }) => {
    if (result.isNewUser || !result.hasDoneOnboarding) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Email and password are required.", variant: "destructive" });
      return;
    }
    try {
      const result = await login(email, password);
      routeAfterAuth(result);
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Email and password are required.", variant: "destructive" });
      return;
    }
    try {
      const result = await signup(email, password, name);
      routeAfterAuth(result);
    } catch (err) {
      toast({
        title: "Sign up failed",
        description: err instanceof Error ? err.message : "Could not create account",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleLogin();
      routeAfterAuth(result);
    } catch (err) {
      toast({
        title: "Google Sign-In Failed",
        description: err instanceof Error ? err.message : "Could not sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex animate-fade-in">
      {/* Left – Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg text-foreground">CRS</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">Course Recommendation System</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              {mode === "login" ? "Welcome to CRS" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
              {mode === "login"
                ? "Sign in to continue your personalized learning journey."
                : "Sign up to start your personalized learning journey."}
            </p>

            {/* Google */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email form */}
            <form onSubmit={mode === "login" ? handleSignIn : handleSignUp} className="space-y-4">
              {mode === "signup" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 rounded-xl h-11"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 rounded-xl h-11"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 rounded-xl h-11"
                />
              </div>

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(v) => setRemember(v === true)}
                    />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" variant="gradient" className="w-full rounded-xl h-11 text-base" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? <>Sign In <ArrowRight className="ml-1 h-4 w-4" /></>
                    : <>Sign Up <ArrowRight className="ml-1 h-4 w-4" /></>}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "login" ? (
                <>
                  New to CRS?{" "}
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => setMode("signup")}
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => setMode("login")}
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Right – Illustration */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        {/* Gradient glow */}
        <div className="absolute inset-0 gradient-bg opacity-[0.06]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />

        {/* Abstract neural network */}
        <svg viewBox="0 0 400 400" className="w-80 h-80 relative z-10 opacity-60" fill="none">
          {/* Nodes */}
          {[
            [80, 100], [160, 60], [240, 100], [320, 60],
            [120, 200], [200, 180], [280, 200],
            [80, 300], [160, 340], [240, 300], [320, 340],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="8" fill="url(#nodeGrad)" opacity={0.7 + (i % 3) * 0.1}>
                <animate attributeName="r" values="8;10;8" dur={`${3 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
          {/* Connections */}
          {[
            [80, 100, 120, 200], [160, 60, 200, 180], [240, 100, 200, 180], [320, 60, 280, 200],
            [120, 200, 80, 300], [120, 200, 160, 340], [200, 180, 240, 300],
            [280, 200, 320, 340], [280, 200, 240, 300], [160, 60, 120, 200],
            [240, 100, 280, 200], [200, 180, 160, 340],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lineGrad)" strokeWidth="1" opacity="0.3">
              <animate attributeName="opacity" values="0.15;0.4;0.15" dur={`${4 + i * 0.2}s`} repeatCount="indefinite" />
            </line>
          ))}
          <defs>
            <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A716A7" />
              <stop offset="100%" stopColor="#7B61FF" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A716A7" />
              <stop offset="100%" stopColor="#7B61FF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Labels */}
        <div className="absolute bottom-20 text-center z-10">
          <p className="font-display text-lg font-semibold text-foreground/60">AI-Powered Learning</p>
          <p className="text-sm text-muted-foreground">Personalized course recommendations</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
