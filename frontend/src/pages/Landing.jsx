import { Link } from "react-router-dom";
import {
  Zap,
  Shield,
  FileText,
  Wand2,
  MessageCircle,
  Trophy,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
      <div className="flex items-center gap-2">
        <Zap size={22} className="text-blue-400" />
        <span className="text-white font-bold text-xl">
          Resume<span className="text-blue-400">Radar</span>
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-6">
        <a
          href="#features"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Features
        </a>
        <a
          href="#how-it-works"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          How it works
        </a>
        <a
          href="#pricing"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Pricing
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Sign Up Free
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
      {/* Left — Text */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full w-fit">
          <Zap size={12} /> AI-Powered Resume Analysis
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Optimize Your Resume.{" "}
          <span className="text-blue-400">Land More Interviews.</span>
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
          ResumeRadar analyzes your resume against any job description, gives
          you an ATS match score, highlights skill gaps, and rewrites your
          resume with AI — in seconds.
        </p>

        {/* Trust badges */}
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className="text-yellow-400 fill-yellow-400"
            />
          ))}
          <span className="text-slate-400 text-sm ml-1">
            Loved by 500+ job seekers
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            <Zap size={18} /> Analyze My Resume Free
          </Link>
          <a
            href="#how-it-works"
            className="border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white font-medium px-6 py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            See How It Works <ArrowRight size={16} />
          </a>
        </div>

        <p className="text-slate-600 text-sm">
          Free to use · No credit card required · Results in under 30 seconds
        </p>
      </div>

      {/* Right — Mock UI Card */}
      <div className="flex-1 w-full max-w-md">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          {/* Mock header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-400" />
              <span className="text-white text-sm font-semibold">
                ResumeRadar
              </span>
            </div>
            <span className="text-xs text-slate-500">Analysis Report</span>
          </div>

          {/* Score circle mock */}
          <div className="flex items-center gap-4 mb-5 bg-slate-800 rounded-xl p-4">
            <div className="relative shrink-0">
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle
                  cx="35"
                  cy="35"
                  r="28"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="6"
                />
                <circle
                  cx="35"
                  cy="35"
                  r="28"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="6"
                  strokeDasharray="158 176"
                  strokeLinecap="round"
                  transform="rotate(-90 35 35)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm">87%</span>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold">Strong Match!</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Your resume scores 87% for this role
              </p>
            </div>
          </div>

          {/* Mock strengths */}
          <div className="mb-4">
            <p className="text-green-400 text-xs font-medium mb-2">
              ✓ Strengths Found
            </p>
            {[
              "MERN stack experience matches JD",
              "JWT auth skills directly aligned",
              "Deployed projects on Vercel",
            ].map((s) => (
              <div key={s} className="flex items-center gap-2 py-1">
                <CheckCircle size={12} className="text-green-400 shrink-0" />
                <p className="text-slate-300 text-xs">{s}</p>
              </div>
            ))}
          </div>

          {/* Mock missing keywords */}
          <div>
            <p className="text-red-400 text-xs font-medium mb-2">
              Missing Keywords
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["TypeScript", "Docker", "CI/CD", "AWS"].map((kw) => (
                <span
                  key={kw}
                  className="bg-red-900/20 border border-red-800 text-red-400 text-xs px-2 py-0.5 rounded-full"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <TrendingUp size={22} className="text-blue-400" />,
      title: "ATS Match Score",
      desc: "Get an instant percentage score showing how well your resume matches the job description — just like a real ATS system.",
    },
    {
      icon: <Shield size={22} className="text-blue-400" />,
      title: "ATS Simulator",
      desc: "See exactly what an ATS robot parses from your resume — section detection, keyword density, and format issues.",
    },
    {
      icon: <Wand2 size={22} className="text-blue-400" />,
      title: "AI Resume Rewriter",
      desc: "Paste a weak bullet point and get an ATS-optimized, quantified, action-verb version instantly.",
    },
    {
      icon: <FileText size={22} className="text-blue-400" />,
      title: "Cover Letter Generator",
      desc: "Generate a personalized, professional cover letter tailored to the specific job and company in one click.",
    },
    {
      icon: <MessageCircle size={22} className="text-blue-400" />,
      title: "Interview Prep",
      desc: "Get 10 likely interview questions based on the JD and your resume — with STAR method tips for each.",
    },
    {
      icon: <Trophy size={22} className="text-blue-400" />,
      title: "Resume Comparison",
      desc: "Upload two resume versions and see which scores better against the same job — side-by-side AI analysis.",
    },
  ];

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">
          Everything You Need to Land the Job
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          Six AI-powered tools working together to get your resume past ATS
          filters and in front of hiring managers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-slate-900 border border-slate-800 hover:border-blue-800 rounded-2xl p-6 flex flex-col gap-3 transition-colors"
          >
            <div className="bg-slate-800 w-10 h-10 rounded-xl flex items-center justify-center">
              {f.icon}
            </div>
            <h3 className="text-white font-semibold">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Upload Your Resume",
      desc: "Upload your resume as PDF or DOCX. Our AI extracts the text automatically.",
    },
    {
      step: "02",
      title: "Add the Job Description",
      desc: "Paste a job URL or type the JD manually. We support LinkedIn, Naukri, Indeed and more.",
    },
    {
      step: "03",
      title: "Get Instant AI Analysis",
      desc: "Receive your match score, missing keywords, strengths, suggestions, and more in under 30 seconds.",
    },
    {
      step: "04",
      title: "Improve & Apply",
      desc: "Use AI to rewrite your resume, generate a cover letter, and prep for interviews — then apply with confidence.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-slate-900 border-y border-slate-800 py-20"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-slate-400">
            From resume to ready-to-apply in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="flex flex-col gap-3 relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-slate-700 z-0" />
              )}
              <div className="bg-blue-600 text-white font-bold text-sm w-10 h-10 rounded-xl flex items-center justify-center z-10 shrink-0">
                {s.step}
              </div>
              <h3 className="text-white font-semibold">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-3">Simple Pricing</h2>
        <p className="text-slate-400">Free forever. No credit card needed.</p>
      </div>

      <div className="max-w-sm mx-auto bg-slate-900 border-2 border-blue-600 rounded-2xl p-8 text-center">
        <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
          FREE FOREVER
        </div>
        <p className="text-5xl font-bold text-white mb-1">₹0</p>
        <p className="text-slate-500 text-sm mb-6">No hidden charges, ever</p>
        <ul className="flex flex-col gap-3 mb-8 text-left">
          {[
            "Unlimited resume analyses",
            "ATS match scoring",
            "AI cover letter generation",
            "Resume rewriter",
            "Interview prep questions",
            "ATS simulator",
            "Resume comparison",
            "Application tracker",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-sm text-slate-300"
            >
              <CheckCircle size={15} className="text-green-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          to="/signup"
          className="block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-blue-600 py-16">
      <div className="max-w-2xl mx-auto px-6 text-center flex flex-col gap-5">
        <h2 className="text-3xl font-bold text-white">
          Ready to Land Your Dream Job?
        </h2>
        <p className="text-blue-100 text-lg">
          Join thousands of job seekers using ResumeRadar to optimize their
          resumes and get more interviews.
        </p>
        <Link
          to="/signup"
          className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-base mx-auto"
        >
          <Zap size={18} /> Start Analyzing Free
        </Link>
        <p className="text-blue-200 text-sm">
          No credit card · Results in 30 seconds
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-blue-400" />
          <span className="text-white font-bold">
            Resume<span className="text-blue-400">Radar</span>
          </span>
        </div>
        <p className="text-slate-600 text-sm">
          Designed & Developed by Vaishnavi Pujari
        </p>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <Link to="/login" className="hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/signup" className="hover:text-white transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
