import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useUser } from "@/context/UserContext";
import * as api from "@/services/api";

const loadingMessages = [
  "Analyzing your profile...",
  "Matching courses to your interests...",
  "Generating personalized recommendations...",
];

const LoadingPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const load = async () => {
      const userid = user?.userid ?? null;
      if (userid !== null) {
        try {
          // Pre-fetch recommendations so the ResultsPage has data ready
          await api.getRecommendations(userid);
        } catch (err) {
          console.error("Pre-fetch recommendations failed:", err);
        }
      }
      // Navigate regardless — ResultsPage will re-fetch if needed
      navigate("/results");
    };

    // Give the loading animation at least 2.5s to play
    const minDelay = new Promise<void>((r) => setTimeout(r, 2500));
    Promise.all([load(), minDelay]).then(() => {
      // navigation already happened inside load()
    });
  }, [navigate, user]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full gradient-bg opacity-[0.06] blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 text-center space-y-8">
        {/* Animated spinner */}
        <div className="relative w-24 h-24 mx-auto">
          <svg className="w-24 h-24 animate-spin-slow" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A716A7" />
                <stop offset="100%" stopColor="#7B61FF" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="200"
              strokeDashoffset="80"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">AI is working its magic</h2>
          <div className="space-y-2">
            {loadingMessages.map((msg, i) => (
              <p
                key={msg}
                className="text-muted-foreground animate-fade-in"
                style={{ animationDelay: `${i * 800}ms`, opacity: 0 }}
              >
                {msg}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
