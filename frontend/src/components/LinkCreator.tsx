'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';
import Link from 'next/link';

interface LinkResult {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  title?: string;
  clickCount: number;
  createdAt: string;
}

export function LinkCreator() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [result, setResult] = useState<LinkResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canUseCustom = user?.planTier && ['PRO', 'ENTERPRISE'].includes(user.planTier);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new Error('Please enter a valid URL (e.g., https://example.com)');
      }

      const payload: any = {
        originalUrl: url,
        title: title || undefined,
      };

      if (useCustom && customSlug) {
        if (customSlug.length < 3) {
          throw new Error('Custom code must be at least 3 characters');
        }
        payload.customSlug = customSlug;
      }

      const { data } = await api.post('/api/links', payload);

      setResult(data.data);
      // Reset form
      setUrl('');
      setTitle('');
      setCustomSlug('');
      setUseCustom(false);
      setCopied(false);
    } catch (err: any) {
      const message =
        err.response?.data?.error?.message || err.message || 'Failed to create link';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result!.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Card className="bg-slate-900 border-slate-800">
        <div className="p-6 md:p-8">
          <h2 className="text-3xl font-bold text-slate-50 mb-2">
            Shorten Your Link
          </h2>
          <p className="text-slate-400 mb-6">
            Create a short, shareable link in seconds
          </p>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your long URL
                </label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url"
                  required
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Link title (optional)
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My awesome link"
                  disabled={loading}
                  className="w-full"
                />
              </div>

              {/* Custom Slug Option */}
              {canUseCustom && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustom}
                      onChange={(e) => setUseCustom(e.target.checked)}
                      disabled={loading}
                      className="w-4 h-4 rounded border-slate-600 text-primary-500"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      Use custom short code
                    </span>
                    <span className="text-xs bg-primary-900 text-primary-300 px-2 py-1 rounded">
                      ✨ {user?.planTier}
                    </span>
                  </label>

                  {useCustom && (
                    <div className="flex items-center gap-2 pl-7 bg-slate-800/50 p-3 rounded border border-slate-700">
                      <span className="text-slate-400 font-medium">
                        linktik.ng/
                      </span>
                      <Input
                        type="text"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="my-custom-code"
                        disabled={loading}
                        pattern="[a-zA-Z0-9-_]+"
                        minLength={3}
                        maxLength={50}
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Upgrade CTA for Free users */}
              {!canUseCustom && user?.planTier === 'FREE' && (
                <div className="bg-primary-900/20 border border-primary-800 rounded-lg p-4">
                  <p className="text-sm text-primary-300">
                    💡 Want custom short codes like{' '}
                    <code className="bg-primary-950 px-2 py-1 rounded text-primary-200">
                      linktik.ng/my-link
                    </code>
                    ?
                  </p>
                  <Link href="/pricing">
                    <Button
                      type="button"
                      size="sm"
                      className="mt-2 bg-primary-600 hover:bg-primary-700"
                    >
                      Upgrade to PRO
                    </Button>
                  </Link>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-300">⚠️ {error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !url}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block animate-spin">⚙️</span>
                    Creating link...
                  </span>
                ) : (
                  'Create Short Link'
                )}
              </Button>
            </form>
          ) : (
            /* Success State */
            <div className="space-y-6">
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-300 font-medium">
                  ✅ Link created successfully!
                </p>
              </div>

              {/* Result Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Short URL
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-slate-900 px-3 py-2 rounded font-mono text-sm text-primary-300 break-all">
                      {result.shortUrl}
                    </code>
                    <Button
                      onClick={copyToClipboard}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded text-sm font-medium whitespace-nowrap"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">
                    Original URL
                  </label>
                  <p className="mt-2 text-sm text-slate-300 break-all">
                    {result.originalUrl}
                  </p>
                </div>

                {result.title && (
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase">
                      Title
                    </label>
                    <p className="mt-2 text-sm text-slate-300">{result.title}</p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-700 flex justify-between text-xs text-slate-400">
                  <span>Created: {new Date(result.createdAt).toLocaleDateString()}</span>
                  <span>{result.clickCount} clicks</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => setResult(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Create Another
                </Button>
                <Link href="/dashboard/links" className="flex-1">
                  <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                    View All Links
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
