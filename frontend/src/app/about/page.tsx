import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#28C88C] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">LT</span>
            </div>
            <span className="text-xl font-bold">LinkTik</span>
          </Link>
          <nav className="flex gap-4">
            <Link href="/pricing" className="text-[#8E9CB1]">Pricing</Link>
            <Link href="/login" className="text-[#8E9CB1]">Log in</Link>
            <Link href="/signup" className="px-4 py-2 bg-[#28C88C] text-black rounded">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">About LinkTik</h1>
          <p className="text-[#9AA7BD] mb-8">We make link management simple, powerful, and accessible.</p>

          <section className="bg-[#111827] p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold mb-2">Our Story</h2>
            <p className="text-[#9AA7BD]">LinkTik started as a small project to simplify link management for creators and businesses. Over time we built an analytics-first, privacy-conscious platform that scales from hobbyists to enterprises.</p>
          </section>

          <section className="grid md:grid-cols-3 gap-4">
            <div className="p-6 bg-[#0b1220] rounded text-left">
              <h3 className="font-semibold mb-2">Simplicity</h3>
              <p className="text-[#9AA7BD] text-sm">Powerful features with an easy-to-use interface.</p>
            </div>
            <div className="p-6 bg-[#0b1220] rounded text-left">
              <h3 className="font-semibold mb-2">Security</h3>
              <p className="text-[#9AA7BD] text-sm">We protect your data with strong defaults and best practices.</p>
            </div>
            <div className="p-6 bg-[#0b1220] rounded text-left">
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-[#9AA7BD] text-sm">We build features that help teams and creators succeed.</p>
            </div>
          </section>
        </div>
      </main>

      <footer className="py-8">
        <div className="max-w-7xl mx-auto text-center text-[#8E9CB1]">&copy; 2026 LinkTik</div>
      </footer>
    </div>
  );
}
