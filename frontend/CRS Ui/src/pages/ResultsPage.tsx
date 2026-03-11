import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, ExternalLink, Sparkles, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRecommendations } from "@/hooks/useRecommendations";
import type { NormalizedCourse } from "@/hooks/useRecommendations";
import CompletedBadge from "@/components/CompletedBadge";

const levelColor = (level: string) => {
  switch (level) {
    case "Beginner": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Intermediate": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Advanced": return "bg-rose-50 text-rose-700 border-rose-200";
    default: return "bg-muted text-muted-foreground";
  }
};

const ResultsPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { courses, loading, error } = useRecommendations(user?.userid ?? null);

  const topPicks: NormalizedCourse[] = courses.filter((c) => c.isTop);
  const otherPicks: NormalizedCourse[] = courses.filter((c) => !c.isTop);

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/my-courses")}>
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg text-foreground">CRS</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">Course Recommendation System</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/my-courses")}
              className="text-sm nav-link-gradient"
            >
              My Courses
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-display font-bold text-sm hover:scale-105 transition-transform"
            >
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="gradient-bg">
        <div className="container mx-auto max-w-5xl px-6 py-12">
          <div className="flex items-center left-6 gap-3 mb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Go back"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all"
                title="Go forward"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <Sparkles className="h-6 w-6 text-primary-foreground" />
            <h1 className="font-display text-3xl font-bold text-primary-foreground">
              Your Recommendations
            </h1>
          </div>
          <p className="text-primary-foreground/70 text-lg">
            {loading
              ? "Finding courses tailored to your profile…"
              : `We found ${courses.length} courses tailored to your profile`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-6 -mt-4">
        {/* Loading state */}
        {loading && (
          <div className="text-center py-20">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading recommendations…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="gradient" onClick={() => navigate("/onboarding", { state: { startStep: 1 } })}>
              Update Your Interests
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">No courses found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find courses matching your interests right now. Try updating your interests.
            </p>
            <Button variant="gradient" onClick={() => navigate("/onboarding", { state: { startStep: 1 } })}>
              Update Your Interests
            </Button>
          </div>
        )}

        {/* Top Picks */}
        {!loading && topPicks.length > 0 && (
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {topPicks.map((course, i) => (
              <div
                key={course.id}
                className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6 border border-primary/10 relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 gradient-bg" />
                <div className="flex items-center gap-1.5 mb-4">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold gradient-text uppercase tracking-wide">Top Pick</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{course.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">{course.platform}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColor(course.level)}`}>{course.level}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">{course.rating}</span>
                    <CompletedBadge courseId={course.id} />
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => navigate(`/course/${course.id}`)}>
                    View <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground italic border-t border-border pt-3">
                  "{course.reason}"
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Other results */}
        {!loading && otherPicks.length > 0 && (
          <>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">More Recommendations</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {otherPicks.map((course, i) => (
                <div
                  key={course.id}
                  className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6 animate-fade-in"
                  style={{ animationDelay: `${(i + 3) * 100}ms`, opacity: 0 }}
                >
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{course.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">{course.platform}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColor(course.level)}`}>{course.level}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-foreground">{course.rating}</span>
                      <CompletedBadge courseId={course.id} />
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => navigate(`/course/${course.id}`)}>
                      View <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground italic border-t border-border pt-3">
                    "{course.reason}"
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
