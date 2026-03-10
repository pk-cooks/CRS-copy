import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard, BookOpen, LogOut, Clock,
  Star, ExternalLink, Sparkles, ChevronRight, User, ArrowLeft,
} from "lucide-react";
import { allCourses, levelColor } from "@/data/courses";
import FavoriteHeart from "@/components/FavoriteHeart";
import { addCourseToHistory } from "@/lib/courseHistory";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" },
  { icon: BookOpen, label: "My Courses", id: "courses" },
  { icon: Clock, label: "History", id: "history" }
];

const userSkills = [
  "Machine Learning", "Python", "Data Analysis", "Deep Learning",
  "Statistics", "Cloud Computing",
];

const careerPaths = [
  {
    title: "Machine Learning Engineer",
    description: "Design and deploy ML models at scale for production systems.",
    accent: true,
  },
  {
    title: "Data Scientist",
    description: "Extract insights from complex data using statistical methods and ML.",
    accent: false,
  },
  {
    title: "AI Research Engineer",
    description: "Push the boundaries of artificial intelligence through novel research.",
    accent: false,
  },
];

const recommendedCourses = allCourses.slice(0, 4);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const profileStrength = 72;

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
            <p className="text-xs text-muted-foreground">Student</p>
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

        {/* Section 1: Skill Profile */}
        <section className="mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-5">Your Skill Profile</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {userSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium bg-accent text-accent-foreground border border-primary/10"
                >
                  {skill}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">AI Skill Match</span>
                <span className="text-sm font-semibold gradient-text">{profileStrength}%</span>
              </div>
              <Progress value={profileStrength} className="h-2 rounded-full bg-accent [&>div]:gradient-bg" />
              <p className="text-xs text-muted-foreground mt-2">
                Profile strength based on selected interests and learning activity.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Career Path */}
        <section className="mb-10 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">Career Direction Based on Your Skills</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Based on your selected interests and developed skills, these career directions align with your profile.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {careerPaths.map((role) => (
                <div
                  key={role.title}
                  className={`rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${role.accent
                    ? "border-primary/20 bg-accent/30"
                    : "border-border bg-background"
                    }`}
                >
                  <h3 className="font-display font-semibold text-foreground mb-1">{role.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{role.description}</p>
                  <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">

                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: AI Recommendations */}
        <section className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="mb-5">
            <h2 className="font-display text-xl font-semibold text-foreground mb-1">Updated Course Recommendations</h2>
            <p className="text-sm text-muted-foreground">Updated based on your evolving interests and skill profile.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {recommendedCourses.map((course, i) => (
              <div
                key={course.id}
                className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-5 relative animate-fade-in"
                style={{ animationDelay: `${(i + 4) * 80}ms`, opacity: 0 }}
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
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
