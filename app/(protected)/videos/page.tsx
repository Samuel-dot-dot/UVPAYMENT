'use client';

import { useEffect, useState } from 'react';
import VideoGrid from '@/components/VideoGrid';
import { supabase } from '@/lib/supabase';

const VideosPage = () => {
  const [videoCount, setVideoCount] = useState<number>(0);

  useEffect(() => {
    const fetchVideoCount = async () => {
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });
      setVideoCount(count || 0);
    };

    fetchVideoCount();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Video Library</h1>
        <div className="flex space-x-2">
          <span className="px-3 py-1 rounded-lg bg-white/5 text-xs text-slate-400 border border-glass-border">
            Total: {videoCount}
          </span>
        </div>
      </div>

      <VideoGrid />
    </div>
  );
};

export default VideosPage;
