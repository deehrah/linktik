'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      await signup(email, name, password);
      router.push('/dashboard');
    } catch (err) {
      // Error is handled by useAuth store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4 py-12">
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#28C88C] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">LT</span>
            </div>
            <span className="text-2xl font-bold text-white">LinkTik</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2 mt-6">
            Create your account
          </h1>
          <p className="text-[#8E9CB1]">Start managing your links today</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {passwordError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#F1F5F9] mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
              placeholder="John Doe"
            />
          </div>

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
            <p className="text-xs text-[#8E9CB1] mt-1">At least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F1F5F9] mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0F172A] border border-[#334155] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#28C88C] focus:border-transparent text-white placeholder-[#8E9CB1]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#28C88C] hover:bg-[#24B37D] disabled:bg-[#8E9CB1] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg mt-6"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#8E9CB1] text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-[#28C88C] hover:text-[#24B37D] font-semibold transition-colors">
              Login
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[#334155]">
          <p className="text-center text-xs text-[#8E9CB1]">
            By creating an account, you agree to our{' '}
            <Link href="#" className="text-[#28C88C] hover:text-[#24B37D]">Terms</Link>
            {' '}and{' '}
            <Link href="#" className="text-[#28C88C] hover:text-[#24B37D]">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
