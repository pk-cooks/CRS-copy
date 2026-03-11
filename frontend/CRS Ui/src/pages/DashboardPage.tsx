import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, BookOpen, LogOut, Clock,
  Star, ExternalLink, Sparkles, User, ArrowLeft, RefreshCw,
} from "lucide-react";
import { levelColor } from "@/data/courses";
import { addCourseToHistory } from "@/lib/courseHistory";
import CompletedBadge from "@/components/CompletedBadge";
import { getLearnedSkills } from "@/lib/learnedSkills";
import { getLearnedCareers } from "@/lib/learnedCareers";
import type { CareerEntry } from "@/lib/learnedCareers";
import { useUser } from "@/context/UserContext";
import { useRecommendations } from "@/hooks/useRecommendations";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: BookOpen, label: "My Courses", id: "courses" },
  { icon: Clock, label: "History", id: "history" }
];


const ROTATION_INTERVAL = 3 * 60 * 1000; // 3 minutes
const CARDS_PER_PAGE = 4;

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { courses: allRecommended, loading: coursesLoading } = useRecommendations(user?.userid ?? null);

  const [activeSection, setActiveSection] = useState("overview");
  const [userSkills, setUserSkills] = useState<string[]>(getLearnedSkills);
  const [careerPaths, setCareerPaths] = useState<CareerEntry[]>(getLearnedCareers);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(ROTATION_INTERVAL / 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep skills + careers in sync whenever localStorage changes
  useEffect(() => {
    const sync = () => {
      setUserSkills(getLearnedSkills());
      setCareerPaths(getLearnedCareers());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Rotate displayed courses every 3 minutes
  useEffect(() => {
    if (allRecommended.length <= CARDS_PER_PAGE) return;

    intervalRef.current = setInterval(() => {
      setRotationIndex((prev) => {
        const maxIndex = Math.ceil(allRecommended.length / CARDS_PER_PAGE) - 1;
        return prev >= maxIndex ? 0 : prev + 1;
      });
      setSecondsLeft(ROTATION_INTERVAL / 1000);
    }, ROTATION_INTERVAL);

    // Countdown ticker every second
    countdownRef.current = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? ROTATION_INTERVAL / 1000 : s - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [allRecommended.length]);

  // Slice the currently visible 4 courses
  const start = rotationIndex * CARDS_PER_PAGE;
  const displayedCourses = allRecommended.slice(start, start + CARDS_PER_PAGE);

  const handleSidebarClick = (id: string) => {
    if (id === "courses") {
      navigate("/my-courses");
    } else if (id === "history") {
      navigate("/history");
    } else {
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border p-5 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-lg text-foreground">CRS</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">Course Recommendation System</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-accent/50">
          <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm text-foreground truncate">Praveen</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === item.id
                ? "gradient-bg text-primary-foreground shadow-hero"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-display font-bold text-lg text-foreground">CRS</span>
        </div>

        {/* Greeting */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-3xl font-bold text-foreground">Welcome back, Praveen</h1>
          </div>
          <p className="text-muted-foreground ml-11">Your personalized learning space</p>
        </div>

        <section className="mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold text-foreground">Your Skill Profile</h2>
              {userSkills.length > 0 && (
                <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-accent border border-border">
                  {userSkills.length} skill{userSkills.length > 1 ? "s" : ""} earned
                </span>
              )}
            </div>

            {userSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full px-3.5 py-1.5 text-sm font-medium bg-accent text-accent-foreground border border-primary/10 animate-fade-in"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <p className="text-sm text-muted-foreground">
                  No skills earned yet.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Complete a course to see your core skill appear here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Career Path */}
        <section className="mb-10 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl font-semibold text-foreground">Career Direction Based on Your Skills</h2>
              {careerPaths.length > 0 && (
                <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-accent border border-border">
                  {careerPaths.length} path{careerPaths.length > 1 ? "s" : ""} unlocked
                </span>
              )}
            </div>

            {careerPaths.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Based on the courses you've completed, these career paths are now open to you.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  {careerPaths.map((career) => (
                    <div
                      key={career.role}
                      className="rounded-2xl p-5 border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover animate-fade-in"
                    >
                      <h3 className="font-display font-semibold text-foreground mb-1">{career.role}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{career.description}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <p className="text-sm text-muted-foreground">No career paths unlocked yet.</p>
                <p className="text-xs text-muted-foreground/70">
                  Complete a course to unlock your first career direction here.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Course Recommendations */}
        <section className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-1">Updated Course Recommendations</h2>
              <p className="text-sm text-muted-foreground">Rotates every 3 mins — based on your interests.</p>
            </div>
            {allRecommended.length > CARDS_PER_PAGE && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: "3s" }} />
                <span>Next in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</span>
              </div>
            )}
          </div>

          {coursesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <span className="ml-2 text-sm text-muted-foreground">Loading recommendations…</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayedCourses.map((course, i) => (
                <div
                  key={course.id}
                  className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5 animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <h3 className="font-display text-base font-semibold text-foreground mb-1 leading-snug">{course.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">{course.platform}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColor(course.level)}`}>{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-foreground">{course.rating}</span>
                      <CompletedBadge courseId={course.id} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary text-xs"
                      onClick={() => {
                        addCourseToHistory(course);
                        navigate(`/course/${course.id}`);
                      }}
                    >
                      View <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
