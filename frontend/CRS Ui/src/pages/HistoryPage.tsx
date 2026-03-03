import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Sparkles, Trash2, Clock } from "lucide-react";
import { allCourses, levelColor } from "@/data/courses";
import { getCourseHistory, clearCourseHistory, addCourseToHistory } from "@/lib/courseHistory";
import FavoriteHeart from "@/components/FavoriteHeart";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(getCourseHistory());

  const handleClear = () => {
    clearCourseHistory();
    setHistory([]);
  };

  const handleRevisit = (courseId: number) => {
    const course = allCourses.find((c) => c.id === courseId);
    if (course) {
      addCourseToHistory(course);
      if (course.url) {
        window.open(course.url, "_blank");
      }
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              HOME
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-display font-bold text-sm hover:scale-105 transition-transform"
            >
              P
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-5xl px-6 pt-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Recently Viewed Courses</h1>
          </div>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={handleClear}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Clear History
            </Button>
          )}
        </div>
        <p className="text-muted-foreground mb-8">Courses you previously opened or visited.</p>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No history yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Courses you view or open will appear here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {history.map((entry, i) => {
              const course = allCourses.find((c) => c.id === entry.id);
              if (!course) return null;
              return (
                <div
                  key={entry.id}
                  className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6 relative animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
                >
                  <FavoriteHeart courseId={course.id} />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-1">{course.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">{course.platform}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColor(course.level)}`}>{course.level}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium text-foreground">{course.rating}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary"
                      onClick={() => handleRevisit(course.id)}
                    >
                      Revisit <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    Viewed on: {formatDate(entry.timestamp)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
