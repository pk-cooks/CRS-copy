import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Brain, Sparkles, Target, GraduationCap, Cpu, Route } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our AI analyzes your background and goals to find the perfect courses for you.",
  },
  {
    icon: Target,
    title: "Personalized Matches",
    description: "Get recommendations tailored to your skill level and learning objectives.",
  },
  {
    icon: BookOpen,
    title: "Top Platforms",
    description: "Courses from Coursera, Udemy, edX, and more — all in one place.",
  },
];

const statCards = [
  { icon: GraduationCap, label: "AI- Filtered Best Courses", delay: "0s" },
  { icon: Route, label: "Personalized Career Paths", delay: "1s" },
  { icon: Cpu, label: "AI-Powered Matching", delay: "0.5s" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 h-16 flex items-center relative">
          {/* Left: CRS Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg text-foreground">CRS</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">Course Recommendation System</span>
            </div>
          </div>

          {/* Right: Login Button */}  
          <div className="ml-auto"> 
            <Button variant="gradient" size="sm" onClick={() => navigate("/login")}>
            Get Started
          </Button>
          </div>
        </div>
      </nav>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/[0.04] blur-[100px]" />

        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Learning
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Find Your Perfect{" "}
              <span className="gradient-text">Course</span>{" "}
              in Seconds
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Tell us about your background and goals. Our AI will recommend the best online courses personalized just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="gradient" size="lg" className="text-base px-8" onClick={() => navigate("/login")}>
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
              variant="outline"
              size="lg"
              className="text-base"
              onClick={() => {
                const section = document.getElementById("how-it-works");
                section?.scrollIntoView({ behavior: "smooth" });
                }}>
                  Learn More
                </Button>
            </div>
          </div>

          {/* Floating stat cards */}
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col gap-5 w-full max-w-xs">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-float flex items-center gap-4"
                  style={{ animationDelay: card.delay }}
                >
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <card.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-display font-semibold text-foreground">{card.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="how-it-works" className="py-20 px-6 gradient-subtle-bg">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to your personalized learning path</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="gradient-bg rounded-3xl p-12 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl font-bold mb-4">Ready to Start Learning?</h2>
              <p className="text-primary-foreground/80 mb-8 text-lg">
                Join thousands of students who found their ideal courses with AI
              </p>
              <Button
                variant="outline"
                size="lg"
                className="bg-card text-foreground border-0 hover:bg-card/90 text-base px-8"
                onClick={() => navigate("/login")}
              >
                Get Your Recommendations <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold">CRS</span>
          </div>
          <p>© 2026 CRS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
