'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Lock, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/app/providers';

type Content = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  content_type: string;
  created_at: string;
};

export default function LinkPage() {
  const params = useParams();
  const router = useRouter();
  const { role } = useRole();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isGuest = role === 'guest';
  const canAccess = !isGuest; // Subscribers, admins, and owners can access

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (!data) {
          setError('Content not found');
          return;
        }

        setContent(data);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchContent();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-electric-violet animate-spin" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <ArrowLeft className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{error || 'Content Not Found'}</h1>
        <button
          onClick={() => router.push('/videos')}
          className="px-6 py-3 bg-electric-violet hover:bg-violet-600 text-white rounded-xl transition-colors"
        >
          Back to Content
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-slate-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Content Card */}
      <div className="bg-white/5 border border-glass-border rounded-2xl overflow-hidden shadow-2xl">
        {/* Header with Icon */}
        <div className="bg-gradient-to-br from-electric-violet/20 to-violet-900/20 p-12 border-b border-glass-border">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-electric-violet/20 border-2 border-electric-violet flex items-center justify-center">
              <LinkIcon className="w-12 h-12 text-electric-violet" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white text-center mb-4">{content.title}</h1>
          <div className="flex items-center justify-center text-slate-400 text-sm">
            <span>{new Date(content.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Description */}
        {content.description && (
          <div className="p-8 border-b border-glass-border">
            <h2 className="text-lg font-bold text-white mb-4">Description</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {content.description}
            </p>
          </div>
        )}

        {/* Access Section */}
        <div className="p-8">
          {isGuest ? (
            /* Locked for Guests */
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Subscriber Only Content</h3>
              <p className="text-slate-400 mb-6">
                This content is exclusive to subscribers. Subscribe to unlock access to all premium content.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="px-8 py-4 bg-electric-violet hover:bg-violet-600 text-white font-bold rounded-xl transition-colors inline-flex items-center"
              >
                View Subscription Plans
                <ExternalLink className="w-5 h-5 ml-2" />
              </button>
            </div>
          ) : (
            /* Access Link for Subscribers */
            <div className="text-center py-8">
              <h3 className="text-xl font-bold text-white mb-4">Access Content</h3>
              <p className="text-slate-400 mb-6">
                Click the button below to access this content. You will be redirected to an external link.
              </p>
              <a
                href={content.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-electric-violet hover:bg-violet-600 text-white font-bold rounded-xl transition-all inline-flex items-center shadow-lg hover:shadow-electric-violet/50 hover:scale-105 transform"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Open Link
              </a>
              <p className="text-slate-500 text-sm mt-4">
                Link opens in a new tab
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
