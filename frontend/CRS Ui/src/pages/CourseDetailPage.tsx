import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Star,
  ExternalLink,
  Play,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useUser } from "@/context/UserContext";
import { useRecommendations } from "@/hooks/useRecommendations";
import type { NormalizedCourse } from "@/hooks/useRecommendations";
import { getPlatformLogo } from "@/components/PlatformLogos";
import { addMyCourse } from "@/lib/myCourses";
import { addFavorite, removeFavorite, isFavorite } from "@/lib/favorites";
import { markCompleted, unmarkCompleted, isCompleted } from "@/lib/completedCourses";
import { addLearnedSkill, removeLearnedSkill } from "@/lib/learnedSkills";
import { addLearnedCareer, removeLearnedCareer, deriveCareer } from "@/lib/learnedCareers";
import { userService } from "@/services/userService";
import { Heart } from "lucide-react";
import { addCourseToHistory } from "@/lib/courseHistory";


const levelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Intermediate":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Advanced":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const CourseDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const { courses, loading } = useRecommendations(user?.userid ?? null);

  const [favorited, setFavorited] = useState(false);
  const [completed, setCompleted] = useState(false);

  const course: NormalizedCourse | undefined = courses.find(
    (c) => c.id === Number(id)
  );

  useEffect(() => {
    if (course) {
      setFavorited(isFavorite(course.id));
      setCompleted(isCompleted(course.id));
    }
  }, [course]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading course details…</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Course Not Found
          </h1>
          <Button variant="gradient" onClick={() => navigate("/results")}>
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  const relatedCourses = courses.filter((c) => c.id !== course.id);

  const defaultRoles = [
    "Data Scientist",
    "ML Engineer",
    "AI Engineer",
    "Software Developer",
    "Analyst",
  ];

  const careerRoles =
    course?.skills?.length
      ? course.skills.slice(0, 5).map((s) => `${s} Specialist`)
      : defaultRoles;

  const handlePlay = () => {
    addCourseToHistory(course);
    window.open(course.url, "_blank");
  };

  const toggleFavorite = async () => {
    if (favorited) {
      removeFavorite(course.id);
      // Also remove from Firestore
      if (user?.uid) {
        try {
          await userService.removeCourseFromProfile(user.uid, {
            name: course.title,
            platform: course.platform,
          });
        } catch (e) {
          console.warn("Could not remove course from Firestore:", e);
        }
      }
    } else {
      addFavorite(course.id);
      // Also save to Firestore
      if (user?.uid) {
        try {
          await userService.addCourseToProfile(user.uid, {
            name: course.title,
            platform: course.platform,
          });
        } catch (e) {
          console.warn("Could not save course to Firestore:", e);
        }
      }
    }
    setFavorited(!favorited);
  };

  return (
    <div className="min-h-screen bg-background pb-16 animate-fade-in">
      <div className="container mx-auto max-w-6xl px-6 pt-8">
        <div className="flex items-center gap-1 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            title="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            title="Go forward"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* LEFT */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
              {course.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-4">
              {course.platform}
            </p>

            <div className="flex items-center gap-3 mb-5">
              <span
                className={`text-sm px-3 py-1 rounded-full border font-medium ${levelColor(
                  course.level
                )}`}
              >
                {course.level}
              </span>

              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-foreground">
                  {course.rating}
                </span>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-base">
              {course.description}
            </p>

            {/* FAVORITE & COMPLETED BUTTONS */}
            <div className="mt-3 flex items-center gap-3">
              <div
                className={`p-[1px] rounded-lg ${favorited ? "bg-gradient-to-r from-[#A716A7] to-[#7B61FF]" : "bg-border"
                  }`}
              >
                <button
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-white transition-all duration-200"
                >
                  <Heart
                    size={16}
                    className={`transition-all duration-200 ${favorited
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                      }`}
                  />

                  <span className={favorited ? "text-primary" : "text-foreground"}>
                    {favorited ? "Saved" : "Add to My Courses"}
                  </span>
                </button>
              </div>

              {/* COMPLETED CHECKBOX */}
              <div
                className={`p-[1px] rounded-lg transition-all duration-200 ${
                  completed
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : "bg-border"
                }`}
              >
                <button
                  onClick={async () => {
                    const coreSkill = course.skills?.[0] ?? "";
                    if (completed) {
                      unmarkCompleted(course.id);
                      removeLearnedSkill(course.id);
                      removeLearnedCareer(course.id);
                      if (user?.uid) {
                        try {
                          await userService.removeCompletedCourse(user.uid, {
                            name: course.title,
                            platform: course.platform,
                          });
                        } catch (e) {
                          console.warn("Could not remove completed course from Firestore:", e);
                        }
                      }
                    } else {
                      markCompleted(course.id);
                      addLearnedSkill(course.id, coreSkill);
                      addLearnedCareer(course.id, deriveCareer(coreSkill, course.title));
                      if (user?.uid) {
                        try {
                          await userService.addCompletedCourse(user.uid, {
                            name: course.title,
                            platform: course.platform,
                          });
                        } catch (e) {
                          console.warn("Could not save completed course to Firestore:", e);
                        }
                      }
                    }
                    setCompleted(!completed);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                    completed
                      ? "bg-emerald-50"
                      : "bg-white"
                  }`}
                >
                  <CheckCircle2
                    size={16}
                    className={`transition-all duration-200 ${
                      completed
                        ? "fill-emerald-500 text-white"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`transition-all duration-200 ${
                      completed ? "text-emerald-700 font-medium" : "text-foreground"
                    }`}
                  >
                    {completed ? "Completed" : "Completed"}
                  </span>
                </button>
              </div>
            </div>
          </div>


          {/* RIGHT */}
          <div className="relative group">
            <div className="absolute -inset-3 gradient-bg rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative bg-card rounded-2xl overflow-hidden shadow-card border border-border">
              <AspectRatio ratio={16 / 9}>
                <div
                  className="w-full h-full relative overflow-hidden"
                  style={{
                    backgroundColor:
                      getPlatformLogo(course.platform).bgColor,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {(() => {
                      const { Logo } =
                        getPlatformLogo(course.platform);
                      return (
                        <Logo className="w-48 h-12 opacity-80" />
                      );
                    })()}
                  </div>

                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors duration-300">
                    <button
                      onClick={handlePlay}
                      className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center shadow-hero hover:scale-110 transition-transform duration-300"
                    >
                      <Play className="h-7 w-7 text-primary-foreground ml-1" />
                    </button>
                  </div>
                </div>
              </AspectRatio>
            </div>
          </div>
        </div>
      </div>


      {/* Content Section */}
      <div className="container mx-auto max-w-6xl px-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-5">Course Details</h2>

        <div className="bg-card rounded-2xl shadow-card p-6 mb-6 border border-border">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">Overview</h3>
          <p className="text-muted-foreground leading-relaxed">{course.description}</p>
        </div>

        {course?.skills?.length > 0 && (
          <div className="bg-card rounded-2xl shadow-card p-6 mb-6 border border-border">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Skills You'll Gain</h3>
            <div className="flex flex-wrap gap-2">
              {course.skills?.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-accent text-accent-foreground border border-primary/10"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-card p-6 mb-6 border border-border">
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">Career Opportunities</h3>
          <p className="text-muted-foreground leading-relaxed mb-5">
            Mastering these skills prepares you for real-world industry roles across data-driven and AI-powered domains. With strong foundations in practical implementation and problem-solving, learners can confidently pursue technical positions that require analytical thinking, model development, and system optimization.
          </p>
          <div className="flex flex-wrap gap-2">
            {careerRoles.map((role) => (
              <span
                key={role}
                className="px-4 py-1.5 rounded-full text-sm font-semibold border border-primary/30 bg-primary/5 text-primary"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div className="container mx-auto max-w-6xl px-6 mt-14">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">More Courses</h2>
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            {relatedCourses.map((c, i) => (
              <div
                key={c.id}
                className="min-w-[300px] max-w-[320px] bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6 border border-border flex-shrink-0 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
                onClick={() => navigate(`/course/${c.id}`)}
              >
                {c.isTop && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold gradient-text uppercase tracking-wide">Top Pick</span>
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{c.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">{c.platform}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColor(c.level)}`}>{c.level}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">{c.rating}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                    View <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


export default CourseDetailPage;
