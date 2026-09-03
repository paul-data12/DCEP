import Link from 'next/link';
import {
  ArrowRight, BookOpen, Clock, ShieldCheck, Target, Award,
  Zap, BarChart3, Lock, CheckCircle2, Sparkles, GraduationCap,
  Timer, Brain, LineChart,
} from 'lucide-react';
import { getUser } from '@/lib/auth';
import LogoutButton from '@/app/components/LogoutButton';

/* ── Exam data ────────────────────────────────────────────── */
const exams = [
  {
    code: 'MCDA-101',
    name: 'MCDA (PL-300)',
    full: 'Microsoft Certified: Data Analyst Associate',
    desc: 'Power BI focused assessment covering data preparation, modeling, DAX, visualization, and deployment across scenario-based MCQs.',
    icon: Target,
    available: true,
    questions: '50–60',
    duration: '100–120',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    ringColor: 'ring-indigo-100',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    badgeText: 'Live',
    accentHover: 'group-hover:border-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-100/50',
  },
  {
    code: 'PMP-201',
    name: 'PMP',
    full: 'Project Management Professional',
    desc: '180-question simulation with two optional 10-minute scheduled breaks, covering predictive, agile, and hybrid approaches.',
    icon: Award,
    available: false,
    questions: '180',
    duration: '230',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    ringColor: 'ring-amber-100',
    badge: 'bg-slate-100 text-slate-500 ring-slate-200',
    badgeText: 'Coming Soon',
    accentHover: '',
  },
  {
    code: 'CBAP-301',
    name: 'CBAP',
    full: 'Certified Business Analysis Professional',
    desc: 'Case-study heavy exam with split-screen UI — case prompt on the left, questions on the right. 120 questions across all BA knowledge areas.',
    icon: ShieldCheck,
    available: false,
    questions: '120',
    duration: '210',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    ringColor: 'ring-cyan-100',
    badge: 'bg-slate-100 text-slate-500 ring-slate-200',
    badgeText: 'Coming Soon',
    accentHover: '',
  },
];

const features = [
  {
    icon: Timer,
    title: 'Timed Simulation',
    desc: 'Authentic countdown timers that mirror the real exam environment with auto-save.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Brain,
    title: 'Smart Randomization',
    desc: 'Fisher-Yates shuffle ensures every attempt is unique — questions and options randomized uniformly.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: LineChart,
    title: 'Instant Diagnostics',
    desc: 'Domain-level breakdown of performance with correct answers and explanations post-exam.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: ShieldCheck,
    title: 'Exam-Grade Security',
    desc: 'JWT-based sessions, server-side grading, and answer keys never sent to the client.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

export default async function Home() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-[#fafbfe] flex flex-col overflow-hidden font-display">

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-300 transition-shadow">
              <BookOpen className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight text-slate-900">DCEP</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-semibold text-slate-600">Hi, {String(user.name)}</span>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Admin Panel</Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">Sign In</Link>
                <Link
                  href="/register"
                  className="text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 rounded-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Soft gradient orbs (light mode) */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-15%] left-[5%] w-[700px] h-[700px] rounded-full bg-indigo-100/60 blur-[100px] animate-[drift_20s_ease-in-out_infinite]" />
          <div className="absolute top-[-5%] right-[5%] w-[500px] h-[500px] rounded-full bg-violet-100/50 blur-[80px] animate-[drift_25s_ease-in-out_infinite_reverse]" />
          <div className="absolute bottom-[-15%] left-[35%] w-[400px] h-[400px] rounded-full bg-blue-100/40 blur-[80px] animate-[drift_18s_ease-in-out_infinite]" />
        </div>

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <div className="max-w-5xl mx-auto text-center px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Exam Simulation Engine
          </div>

          <h1 className="text-[2.75rem] leading-[1.1] sm:text-[3.25rem] md:text-[4rem] font-extrabold tracking-tight text-slate-900">
            Ace your certification
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              with confidence.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Full-length, timed mock exams that mirror the real testing experience.
            Auto-save, proctoring, and instant diagnostics — all in one platform.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/exam/MCDA-101/take"
              className="group inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-[15px] shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all w-full sm:w-auto"
            >
              Start MCDA Prep
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#exams"
              className="inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-white text-slate-700 font-bold text-[15px] border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all w-full sm:w-auto"
            >
              Browse All Exams
            </a>
          </div>

          {/* Stats strip */}
          <div className="mt-20 grid grid-cols-3 max-w-xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
            {[
              { label: 'Exam Tracks', value: '3', suffix: '' },
              { label: 'Question Bank', value: '700', suffix: '+' },
              { label: 'Avg. Pass Rate', value: '94', suffix: '%' },
            ].map((s, i) => (
              <div key={s.label} className={`py-6 text-center ${i > 0 ? 'border-l border-slate-100' : ''}`}>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {s.value}<span className="text-indigo-600">{s.suffix}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Why DCEP</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Built for serious candidates
            </h2>
            <p className="mt-4 text-slate-500 max-w-lg mx-auto font-medium">
              Every feature is designed to replicate real exam conditions and maximize your preparation.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="group relative p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                    <Icon className={`w-5.5 h-5.5 ${f.color}`} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Exam Catalog ─────────────────────────────────── */}
      <section id="exams" className="scroll-mt-20 relative py-24 bg-gradient-to-b from-transparent via-indigo-50/30 to-transparent">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3">Certification Catalog</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Choose your certification
            </h2>
            <p className="mt-4 text-slate-500 max-w-lg mx-auto font-medium">
              Realistic exam simulations with randomized question pools and instant performance analytics.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const Icon = exam.icon;
              return (
                <div
                  key={exam.code}
                  className={`group relative flex flex-col rounded-2xl border bg-white transition-all duration-300
                    ${exam.available
                      ? `border-slate-200/80 shadow-sm hover:-translate-y-1 ${exam.accentHover}`
                      : 'border-dashed border-slate-200 opacity-60'
                    }
                  `}
                >
                  <div className="p-7 flex-1 flex flex-col">
                    {/* Icon + Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl ${exam.iconBg} ring-1 ${exam.ringColor} flex items-center justify-center`}>
                        <Icon className={`w-5.5 h-5.5 ${exam.iconColor}`} />
                      </div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${exam.badge} ring-1 rounded-full px-2.5 py-1`}>
                        {exam.badgeText}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 mb-1">{exam.name}</h3>
                    <p className="text-[13px] text-slate-400 font-semibold mb-3">{exam.full}</p>
                    <p className="text-sm text-slate-500 leading-relaxed flex-1 font-medium">{exam.desc}</p>

                    {/* Meta row */}
                    <div className="mt-6 flex items-center gap-5 text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />{exam.questions} Qs
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />{exam.duration} min
                      </span>
                    </div>
                  </div>

                  {/* Footer action */}
                  <div className="border-t border-slate-100 px-7 py-4">
                    {exam.available ? (
                      <Link
                        href={`/exam/${exam.code}/take`}
                        className="flex items-center justify-between text-sm font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors"
                      >
                        Start Exam
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-400">
                        <Lock className="w-3.5 h-3.5" /> Locked
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Social Proof / CTA ───────────────────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-[20%] w-[500px] h-[500px] rounded-full bg-violet-100/40 blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8">
            <GraduationCap className="w-3.5 h-3.5" />
            Join thousands of certified professionals
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Your certification journey<br />starts here.
          </h2>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed font-medium">
            Stop studying blindly. Practice with realistic simulations, identify weak areas instantly,
            and walk into your exam with unshakable confidence.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {!user ? (
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-[15px] shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all w-full sm:w-auto"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/exam/MCDA-101/take"
                className="group inline-flex items-center justify-center gap-2 h-13 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-[15px] shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] transition-all w-full sm:w-auto"
              >
                Start Your First Exam
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 700+ practice questions</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant diagnostics</span>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-slate-200/60 py-12 mt-auto bg-white/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-200">
                <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-extrabold text-slate-700">DCEP</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold">
              © {new Date().getFullYear()} DCEP. Built for certification success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
