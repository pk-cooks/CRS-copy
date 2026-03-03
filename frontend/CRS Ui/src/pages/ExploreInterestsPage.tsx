import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Check, Sparkles } from "lucide-react";

const allFields = [
  "AI Engineering", "Blockchain", "Game Development", "DevOps",
  "AR/VR Development", "FinTech", "Robotics", "Data Engineering",
  "Prompt Engineering", "Artificial Intelligence", "Full Stack Development",
  "Quantum Computing", "Internet of Things", "Natural Language Processing",
  "Computer Vision", "Edge Computing", "Bioinformatics", "Embedded Systems",
  "3D Modeling", "Technical Writing",
];

const popularFields = [
  "AI Engineering", "Blockchain", "Game Development", "DevOps",
  "AR/VR Development", "FinTech", "Robotics", "Data Engineering",
  "Prompt Engineering",
];

const ExploreInterestsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const existingInterests: string[] = location.state?.interests || [];

  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const toggleSelect = (item: string) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return allFields.filter((f) =>
      f.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  }, [query]);

  const handleAddInterests = () => {
    const merged = [...new Set([...existingInterests, ...selected])];
    navigate("/onboarding", { state: { interests: merged } });
  };

  const highlightMatch = (text: string) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-bold gradient-text">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 gradient-bg" />
      <div className="absolute top-40 -right-60 w-80 h-80 rounded-full gradient-bg opacity-[0.05] blur-3xl" />

      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <button
          onClick={() => navigate("/onboarding", { state: { interests: [...new Set([...existingInterests, ...selected])] } })}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Explore More Learning Paths
        </h1>
        <p className="text-muted-foreground mb-8">
          Search and discover additional fields not listed in the main selection.
        </p>

        {/* Search */}
        <div className="relative mb-10">
          <div
            className={`relative rounded-xl border transition-all duration-300 shadow-card ${
              isFocused ? "border-primary/50 shadow-hero" : "border-border"
            }`}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Search for skills, domains, or career paths…"
              className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none font-sans"
            />
          </div>

          {/* Autocomplete dropdown */}
          {suggestions.length > 0 && isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-card-hover overflow-hidden z-10 animate-fade-in">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onMouseDown={() => {
                    toggleSelect(item);
                    setQuery("");
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{highlightMatch(item)}</span>
                  </div>
                  {selected.includes(item) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Emerging Fields */}
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Popular Emerging Fields
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-24">
          {popularFields.map((field) => {
            const isSelected = selected.includes(field);
            return (
              <button
                key={field}
                onClick={() => toggleSelect(field)}
                className={`relative rounded-xl px-4 py-4 text-sm font-medium border transition-all duration-200 hover:-translate-y-0.5 ${
                  isSelected
                    ? "gradient-bg text-primary-foreground border-transparent shadow-hero"
                    : "bg-card border-border text-foreground hover:border-primary/30 shadow-card hover:shadow-card-hover"
                }`}
              >
                <span className="flex items-center justify-between">
                  {field}
                  {isSelected && (
                    <Check className="h-4 w-4 animate-scale-in" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom button */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border animate-fade-in">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selected.length} field{selected.length > 1 ? "s" : ""} selected
            </span>
            <Button variant="gradient" onClick={handleAddInterests}>
              Add to My Interests <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreInterestsPage;
