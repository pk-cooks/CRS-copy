import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, GraduationCap, Heart, BarChart3, Check, Plus } from "lucide-react";
import { useUser } from "@/context/UserContext";
import * as api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";

const educationLevels = ["High School", "Undergraduate", "Post Graduate"];
const interestAreas = [
  "Web Development", "Data Science", "Machine Learning", "Mobile Apps",
  "Cloud Computing", "Cybersecurity", "Python", "JavaScript",
  "Java", "DevOps", "Deep Learning", "Databases",
];
const skillLevels = ["Beginner", "Intermediate", "Advanced"];

const steps = [
  { label: "Education", icon: GraduationCap },
  { label: "Interests", icon: Heart },
  { label: "Skill Level", icon: BarChart3 },
];

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [education, setEducation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [skill, setSkill] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateInterests } = useUser();
  const { toast } = useToast();

  // Redirect if no user session
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Restore interests from explore page
  useEffect(() => {
    if (location.state?.interests) {
      setInterests(location.state.interests);
      setStep(1);
    }
  }, [location.state]);

  const toggleInterest = (item: string) => {
    setInterests((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const canProceed =
    (step === 0 && education) ||
    (step === 1 && interests.length > 0) ||
    (step === 2 && skill);

  const handleNext = async () => {
    if (!user) return;

    // When leaving step 0, save education level
    if (step === 0 && education) {
      try {
        await api.setEducationLevel(user.userid, education);
        // Also save to Firestore
        if (user.uid) {
          await userService.updateUserProfile(user.uid, { educationLevel: education });
        }
      } catch (err) {
        console.error("Failed to save education level:", err);
        toast({
          title: "Warning",
          description: "Could not save education level, but you can continue.",
        });
      }
    }

    if (step < 2) {
      setStep(step + 1);
      return;
    }

    // Final step – save interests, skill level, and mark onboarding done
    setSubmitting(true);
    try {
      await api.setInterest(user.userid, interests);
      updateInterests(interests);

      // Save all onboarding data to Firestore
      if (user.uid) {
        await userService.updateUserProfile(user.uid, {
          interests,
          skillLevel: skill,
          hasFinishedOnboarding: true,
        });
      }

      navigate("/loading");
    } catch (err: any) {
      console.error("Failed to save interests:", err);
      toast({
        title: "Error",
        description: err.message || "Could not save your interests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-1 gradient-bg" />
      <div className="absolute top-40 -right-60 w-80 h-80 rounded-full gradient-bg opacity-[0.05] blur-3xl" />

      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${i < step
                  ? "gradient-bg text-primary-foreground"
                  : i === step
                    ? "gradient-bg text-primary-foreground shadow-hero"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-0.5 rounded-full transition-colors duration-300 ${i < step ? "gradient-bg" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-card rounded-2xl shadow-card p-8">
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">What's your education level?</h2>
              <p className="text-muted-foreground mb-6">This helps us match courses to your background.</p>
              <div className="grid grid-cols-2 gap-3">
                {educationLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setEducation(level)}
                    className={`rounded-xl px-4 py-4 text-sm font-medium border transition-all duration-200 ${education === level
                      ? "gradient-bg text-primary-foreground border-transparent shadow-hero"
                      : "bg-background border-border text-foreground hover:border-primary/30 hover:bg-accent"
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">What are you interested in?</h2>
              <p className="text-muted-foreground mb-6">Select one or more topics you'd like to learn.</p>
              <div className="flex flex-wrap gap-2">
                {interestAreas.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`rounded-full px-4 py-2 text-sm font-medium border transition-all duration-200 ${interests.includes(item)
                      ? "gradient-bg text-primary-foreground border-transparent"
                      : "bg-background border-border text-foreground hover:border-primary/30 hover:bg-accent"
                      }`}
                  >
                    {item === "Project Management" ? (
                      <span className="flex items-center gap-1.5">
                        {item}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/explore-interests", { state: { interests } });
                          }}
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full gradient-bg text-primary-foreground hover:shadow-hero transition-all duration-200 hover:scale-110 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </span>
                      </span>
                    ) : (
                      item
                    )}
                  </button>
                ))}
                {/* Show extra interests from explore page */}
                {interests
                  .filter((i) => !interestAreas.includes(i))
                  .map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleInterest(item)}
                      className="rounded-full px-4 py-2 text-sm font-medium border transition-all duration-200 gradient-bg text-primary-foreground border-transparent"
                    >
                      {item}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">What's your current skill level?</h2>
              <p className="text-muted-foreground mb-6">We'll recommend courses that match where you are.</p>
              <div className="grid gap-3">
                {skillLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSkill(level)}
                    className={`rounded-xl px-6 py-5 text-left border transition-all duration-200 ${skill === level
                      ? "gradient-bg text-primary-foreground border-transparent shadow-hero"
                      : "bg-background border-border text-foreground hover:border-primary/30 hover:bg-accent"
                      }`}
                  >
                    <span className="font-medium">{level}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button variant="gradient" onClick={handleNext} disabled={!canProceed || submitting}>
            {submitting ? "Saving..." : step === 2 ? "Get Recommendations" : "Continue"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
