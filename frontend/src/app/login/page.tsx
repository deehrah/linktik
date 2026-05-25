'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by useAuth store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#28C88C] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">LT</span>
            </div>
            <span className="text-2xl font-bold text-white">LinkTik</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2 mt-6">
            Welcome back
          </h1>
          <p className="text-[#8E9CB1]">Login to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#F1F5F9] mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#F1F5F9] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-[#8E9CB1] cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-[#334155] text-[#28C88C] focus:ring-[#28C88C]" />
              Remember me
            </label>
            <Link href="#" className="text-[#28C88C] hover:text-[#24B37D] transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#28C88C] hover:bg-[#24B37D] disabled:bg-[#8E9CB1] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#8E9CB1] text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#28C88C] hover:text-[#24B37D] font-semibold transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[#334155]">
          <p className="text-center text-xs text-[#8E9CB1]">
            By continuing, you agree to our{' '}
            <Link href="#" className="text-[#28C88C] hover:text-[#24B37D]">Terms</Link>
            {' '}and{' '}
            <Link href="#" className="text-[#28C88C] hover:text-[#24B37D]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
