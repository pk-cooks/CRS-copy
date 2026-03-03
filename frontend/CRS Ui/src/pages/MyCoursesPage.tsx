import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, ExternalLink, Sparkles, Search } from "lucide-react";
import { levelColor, allCourses } from "@/data/courses";
import { getFavorites } from "@/lib/favorites";
import type { StaticCourse } from "@/data/courses";

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [favoriteCourses, setFavoriteCourses] = useState<StaticCourse[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load favorite courses
  useEffect(() => {
    const favoriteIds = getFavorites();
    const favorites = allCourses.filter((c) =>
      favoriteIds.includes(c.id)
    );
    setFavoriteCourses(favorites);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search inside favorites
  const filteredLibrary = useMemo(() => {
    if (!query.trim()) return [];

    const lower = query.toLowerCase();

    return favoriteCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.platform.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower)
    );
  }, [query, favoriteCourses]);

  // Search in full catalog excluding favorites
  const datasetMatches = useMemo(() => {
    if (!query.trim()) return [];

    const lower = query.toLowerCase();

    return allCourses.filter(
      (c) =>
        (c.title.toLowerCase().includes(lower) ||
          c.platform.toLowerCase().includes(lower) ||
          c.description.toLowerCase().includes(lower)) &&
        !favoriteCourses.some((fc) => fc.id === c.id)
    );
  }, [query, favoriteCourses]);

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
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Favorite Courses
        </h1>
        <p className="text-muted-foreground mb-8">
          Courses you've marked as favorites.
        </p>

        {/* Search */}
        <div ref={searchRef} className="relative mb-10 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 rounded-xl h-11"
          />

          {query.trim() &&
            (filteredLibrary.length > 0 || datasetMatches.length > 0) && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">

                {filteredLibrary.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
                      In Favorites
                    </div>
                    {filteredLibrary.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          navigate(`/course/${course.id}`);
                          setQuery("");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground">
                          {course.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {course.platform}
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {datasetMatches.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-t border-border">
                      Found in Catalog
                    </div>
                    {datasetMatches.slice(0, 5).map((course) => (
                      <button
                        key={course.id}
                        onClick={() => {
                          navigate(`/course/${course.id}`);
                          setQuery("");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground">
                          {course.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {course.platform}
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
        </div>

        {/* Favorites Grid */}
        {!query.trim() && favoriteCourses.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No favorite courses yet.
            </p>
          </div>
        )}

        {!query.trim() && favoriteCourses.length > 0 && (
          <div className="grid md:grid-cols-3 gap-5">
            {favoriteCourses.map((course, i) => (
              <div
                key={course.id}
                className="bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}
              >
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  {course.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">
                    {course.platform}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${levelColor(
                      course.level
                    )}`}
                  >
                    {course.level}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">
                      {course.rating}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    View <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;