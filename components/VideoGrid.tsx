'use client';

import { motion } from 'framer-motion';
import { Clock, Edit, Eye, Lock, Play, Trash2, Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/app/providers';

interface VideoGridProps {
  limit?: number;
}

interface Video {
  id: string;
  title: string;
  video_url: string | null;
  is_locked: boolean;
  duration?: string;
  thumbnail_url?: string;
  views?: number;
  created_at?: string;
  content_type?: 'video' | 'link';
  description?: string | null;
}

const VideoGrid: React.FC<VideoGridProps> = ({ limit }) => {
  const { role } = useRole();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const isGuest = role === 'guest';
  const canManage = role === 'admin' || role === 'owner';

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from('videos').select('*').order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching videos:', error);
          setVideos([]);
        } else {
          setVideos(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [limit]);

  const handleVideoClick = (video: Video) => {
    if (isGuest) {
      router.push('/pricing');
    } else {
      // Route to different pages based on content type
      if (video.content_type === 'link') {
        router.push(`/link/${video.id}`);
      } else {
        router.push(`/watch/${video.id}`);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleDeleteClick = (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!videoToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/videos/${videoToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      // Remove video from local state
      setVideos(videos.filter(v => v.id !== videoToDelete.id));
      setDeleteModalOpen(false);
      setVideoToDelete(null);
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (video: Video, e: React.MouseEvent) => {
    e.stopPropagation();
    setVideoToEdit(video);
    setEditTitle(video.title);
    setEditDescription(video.description || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!videoToEdit || !editTitle.trim()) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/videos/${videoToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update video');
      }

      const updatedVideo = await response.json();

      // Update video in local state
      setVideos(videos.map(v => v.id === videoToEdit.id ? { ...v, title: editTitle.trim(), description: editDescription.trim() } : v));
      setEditModalOpen(false);
      setVideoToEdit(null);
      setEditTitle('');
      setEditDescription('');
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-glass-border rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-video bg-white/10" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No videos available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video, index) => (
        <motion.div
          key={video.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => handleVideoClick(video)}
          className={`
            group bg-white/5 border border-glass-border rounded-xl overflow-hidden
            transition-all duration-300 relative
            ${isGuest ? 'cursor-pointer hover:border-red-500/50' : 'cursor-pointer hover:border-electric-violet/50'}
          `}
        >
          <div className="relative aspect-video overflow-hidden bg-slate-800">
            {video.thumbnail_url ? (
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className={`w-full h-full object-cover transition-all duration-500
                  ${isGuest || video.is_locked ? 'grayscale blur-md scale-105' : 'group-hover:scale-105'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                <div className="text-center">
                  <Play className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-medium">{video.title}</p>
                </div>
              </div>
            )}

            {isGuest && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
                <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse-slow">
                  <Lock className="w-5 h-5 text-red-500" />
                </div>
                <div className="bg-black/80 border border-red-900/50 px-3 py-1 rounded backdrop-blur-md">
                  <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Uncensored Locked</span>
                </div>
              </div>
            )}

            {!isGuest && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full bg-electric-violet flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.6)] transform scale-90 group-hover:scale-100 transition-transform">
                  {video.content_type === 'link' ? (
                    <ExternalLink className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white fill-current ml-1" />
                  )}
                </div>
              </div>
            )}

            {/* Content Type Badge */}
            {video.content_type === 'link' && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-electric-violet/90 backdrop-blur rounded text-[10px] text-white font-bold z-20 flex items-center">
                <LinkIcon className="w-3 h-3 mr-1" />
                LINK
              </div>
            )}

            {video.duration && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur rounded text-[10px] text-white font-mono z-20">
                {video.duration}
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-white text-md leading-tight line-clamp-1">
                {video.title}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                {video.views !== undefined && (
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {video.views.toLocaleString()}
                  </span>
                )}
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(video.created_at)}
                </span>
              </div>
            </div>

            {canManage && (
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                <button
                  className="flex items-center text-[10px] text-slate-400 hover:text-electric-violet transition-colors"
                  onClick={(e) => handleEditClick(video, e)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  EDIT
                </button>
                <button
                  className="flex items-center text-[10px] text-slate-400 hover:text-red-500 transition-colors"
                  onClick={(e) => handleDeleteClick(video, e)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  DELETE
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mr-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Video</h3>
                <p className="text-sm text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-bold text-white">"{videoToDelete?.title}"</span>? This will permanently remove the video and all associated data.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setVideoToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-white/5 border border-glass-border text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Video'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-glass-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-electric-violet/20 flex items-center justify-center mr-4">
                  <Edit className="w-6 h-6 text-electric-violet" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Edit Video</h3>
                  <p className="text-sm text-slate-400">Update video information</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter video title..."
                  disabled={isUpdating}
                  className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition-all disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Video description..."
                  disabled={isUpdating}
                  className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition-all disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setVideoToEdit(null);
                  setEditTitle('');
                  setEditDescription('');
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-3 bg-white/5 border border-glass-border text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isUpdating || !editTitle.trim()}
                className="flex-1 px-4 py-3 bg-electric-violet text-white rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;
