import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sun, Moon, Copy, Check, Loader2, Flame, Heart, Sparkles } from "lucide-react";

type Mode = "roast" | "compliment";
type Tone = "soft" | "normal" | "savage";
type Language = "english" | "hinglish";

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mode, setMode] = useState<Mode>("roast");
  const [tone, setTone] = useState<Tone>("normal");
  const [language, setLanguage] = useState<Language>("hinglish");
  const [name, setName] = useState("");
  const [traits, setTraits] = useState("");
  const [insideJoke, setInsideJoke] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    setOutput("");
    setError("");
  }, [name, traits, insideJoke]);

  const triggerConfetti = () => {
    const colors = mode === "roast" 
      ? ["#ef4444", "#f97316", "#fbbf24", "#f87171"]
      : ["#ec4899", "#a855f7", "#f472b6", "#c084fc"];
    
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors,
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.6, x: 0.3 },
        colors,
      });
    }, 150);
    
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.6, x: 0.7 },
        colors,
      });
    }, 300);
  };

  const handleGenerate = async () => {
    if (!name.trim() || loading) return;

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          tone,
          language,
          name: name.trim(),
          traits: traits.trim(),
          insideJoke: insideJoke.trim(),
        }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      
      if (data.line) {
        setOutput(data.line);
        triggerConfetti();
      } else {
        throw new Error("No line returned");
      }
    } catch {
      setError("Something went wrong 😭 Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isRoast = mode === "roast";

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${
            isRoast ? "bg-roast" : "bg-compliment"
          }`}
        />
        <div 
          className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-15 transition-colors duration-500 ${
            isRoast ? "bg-roast" : "bg-compliment"
          }`}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/30 opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-border/20 opacity-50" />
      </div>

      <div className="relative container max-w-lg mx-auto px-4 py-8 pb-16">
        {/* Top Bar */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isRoast 
                ? "bg-roast-light" 
                : "bg-compliment-light"
            }`}>
              {isRoast ? (
                <Flame className="w-6 h-6 text-roast" />
              ) : (
                <Heart className="w-6 h-6 text-compliment" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-display tracking-tight">
                AI Roast & Compliment
              </h1>
            </div>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-xl bg-secondary hover:bg-accent transition-all duration-200 hover:scale-105"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </header>

        {/* Main Card */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          {/* Mode Section */}
          <section>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("roast")}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  isRoast
                    ? "text-white btn-glow-roast"
                    : "bg-pill-bg border border-pill-border text-foreground hover:bg-accent"
                }`}
                style={isRoast ? { background: "var(--gradient-roast)" } : undefined}
              >
                <Flame className="w-4 h-4" />
                Roast Mode
              </button>
              <button
                onClick={() => setMode("compliment")}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  !isRoast
                    ? "text-white btn-glow-compliment"
                    : "bg-pill-bg border border-pill-border text-foreground hover:bg-accent"
                }`}
                style={!isRoast ? { background: "var(--gradient-compliment)" } : undefined}
              >
                <Heart className="w-4 h-4" />
                Compliment
              </button>
            </div>
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Options</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Tone Section */}
          <section>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Tone
            </label>
            <div className="flex gap-2">
              {(["soft", "normal", "savage"] as Tone[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    tone === t
                      ? `text-white ${isRoast ? "btn-glow-roast" : "btn-glow-compliment"}`
                      : "bg-pill-bg border border-pill-border text-foreground hover:bg-accent"
                  }`}
                  style={
                    tone === t
                      ? { background: isRoast ? "var(--gradient-roast)" : "var(--gradient-compliment)" }
                      : undefined
                  }
                >
                  {t === "soft" && "😌 "}
                  {t === "normal" && "😎 "}
                  {t === "savage" && "😈 "}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Language Section */}
          <section>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Language
            </label>
            <div className="flex gap-2">
              {(["english", "hinglish"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    language === lang
                      ? `text-white ${isRoast ? "btn-glow-roast" : "btn-glow-compliment"}`
                      : "bg-pill-bg border border-pill-border text-foreground hover:bg-accent"
                  }`}
                  style={
                    language === lang
                      ? { background: isRoast ? "var(--gradient-roast)" : "var(--gradient-compliment)" }
                      : undefined
                  }
                >
                  {lang === "english" ? "🇬🇧 English" : "🇮🇳 Hinglish"}
                </button>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Details</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Inputs Section */}
          <section className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Who are we roasting today?"
                className="w-full px-4 py-3.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Traits
              </label>
              <input
                type="text"
                value={traits}
                onChange={(e) => setTraits(e.target.value)}
                placeholder="lazy, always late, never replies"
                className="w-full px-4 py-3.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Inside joke{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={insideJoke}
                onChange={(e) => setInsideJoke(e.target.value)}
                placeholder="10/100 in exam, that one Goa plan, etc."
                className="w-full px-4 py-3.5 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </section>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!name.trim() || loading}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
              !name.trim() || loading
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : `text-white hover:scale-[1.02] active:scale-[0.98] ${isRoast ? "btn-glow-roast" : "btn-glow-compliment"}`
            }`}
            style={
              name.trim() && !loading
                ? { background: isRoast ? "var(--gradient-roast)" : "var(--gradient-compliment)" }
                : undefined
            }
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating magic…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate {isRoast ? "Roast" : "Compliment"}
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        {(output || error) && (
          <section className="mt-6 animate-fade-up">
            <div className={`glass-card rounded-2xl p-6 relative overflow-hidden ${
              !error && (isRoast ? "border-roast/20" : "border-compliment/20")
            }`}>
              {/* Decorative gradient */}
              {!error && (
                <div 
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isRoast ? "bg-gradient-to-r from-roast to-orange-400" : "bg-gradient-to-r from-compliment to-purple-400"
                  }`}
                />
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {!error && (
                    <span className={`text-lg ${isRoast ? "text-roast" : "text-compliment"}`}>
                      {isRoast ? "🔥" : "💖"}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {error ? "Error" : "Result"}
                  </span>
                </div>
                {output && (
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      copied 
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              <p
                className={`text-lg font-medium leading-relaxed ${
                  error ? "text-destructive" : "text-foreground"
                }`}
              >
                {error || output}
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Made with {isRoast ? "🔥" : "💖"} for my friends by rahul 
          </p>
          <p className="text-xs text-muted-foreground/60">
            Share the {isRoast ? "burns" : "love"} responsibly
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
