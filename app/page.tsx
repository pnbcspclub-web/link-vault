import Link from "next/link";
import { ArrowRight, Bookmark, Shield, Zap, Search, Globe, Layout, Database, Terminal } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Bookmark size={18} fill="currentColor" />
          </div>
          LinkVault
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-full hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
          >
            Open Vault
          </Link>
        </div>
      </nav>

      <main className="relative pt-32 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white -z-10" />
        
        {/* Hero Section */}
        <section className="px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[13px] font-medium mb-10">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
            Next-generation bookmark management
          </div>
          
          <h1 className="text-5xl md:text-[84px] font-[850] tracking-tight text-slate-900 mb-8 leading-[1.05]">
            Capture the web.<br />
            <span className="text-indigo-600">Curate your mind.</span>
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-slate-500 mb-12 leading-relaxed">
            LinkVault is a high-performance, private archive for your digital life. 
            Organize bookmarks, articles, and media with a beautiful macOS-inspired interface.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-24">
            <Link
              href="/dashboard"
              className="group flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              Start Building Your Vault
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="text-sm font-medium text-slate-400">
              Free to use &bull; Local SQLite &bull; Self-hosted speed
            </div>
          </div>

          {/* Product Preview / UI Shot Placeholder */}
          <div className="relative w-full max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-100 overflow-hidden mb-32">
            <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <div className="w-3 h-3 rounded-full bg-slate-200" />
            </div>
            <div className="aspect-[16/10] bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 opacity-20">
                <Layout size={64} className="text-indigo-600" />
                <span className="font-bold text-xl uppercase tracking-widest">Dashboard Interface</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 py-24 bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <Feature 
                icon={<Zap className="text-indigo-600" />}
                title="Lightning Fast"
                description="Instant search and filtering. Built on SQLite for maximum local performance and privacy."
              />
              <Feature 
                icon={<Shield className="text-indigo-600" />}
                title="Privacy First"
                description="Your data stays on your machine. No tracking, no external cookies, just your archive."
              />
              <Feature 
                icon={<Search className="text-indigo-600" />}
                title="Deep Search"
                description="Search through titles, descriptions, and tags effortlessly with our global command palette."
              />
            </div>
          </div>
        </section>

        {/* Tech Specs Section */}
        <section id="workflow" className="bg-slate-900 py-32 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8 tracking-tight">Built for modern workflows.</h2>
                <div className="space-y-8">
                  <TechItem 
                    icon={<Layout size={20} />}
                    title="macOS Inspired Design"
                    description="A familiar, distraction-free environment that prioritizes your content."
                  />
                  <TechItem 
                    icon={<Terminal size={20} />}
                    title="Command Palette"
                    description="Navigate and manage your vault entirely with your keyboard using Cmd+K."
                  />
                  <TechItem 
                    icon={<Database size={20} />}
                    title="Relational Tags"
                    description="Go beyond folders with a flexible tagging system that connects related ideas."
                  />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
                <div className="text-indigo-400 opacity-80 scale-150">
                  <Bookmark size={120} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 tracking-tight text-slate-900">Ready to organize the chaos?</h2>
          <p className="text-lg text-slate-500 mb-10">
            Join thousands of developers, researchers, and creators who trust LinkVault for their digital archive.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            Get Started for Free
          </Link>
        </section>
      </main>

      <footer className="py-16 px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900 opacity-60">
            <Bookmark size={18} />
            LinkVault
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-slate-900">Twitter</a>
            <a href="#" className="hover:text-slate-900">GitHub</a>
            <a href="#" className="hover:text-slate-900">Privacy</a>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} LinkVault. Engineered with precision.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-2">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function TechItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold mb-1">{title}</h4>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
