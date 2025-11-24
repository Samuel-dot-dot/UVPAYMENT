'use client';

import Link from 'next/link';
import { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileVideo, ShieldAlert, Check, Info, X, Loader2 } from 'lucide-react';
import { useRole } from '@/app/providers';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const { role } = useRole();
  const router = useRouter();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url'); // Default to URL mode
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (role !== 'admin' && role !== 'owner') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">403 Unauthorised</h1>
        <Link href="/dashboard" className="px-6 py-3 bg-white/10 border border-glass-border rounded-xl text-white hover:bg-white/20 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleVideoDragLeave = () => {
    setIsDragging(false);
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleVideoFileChange(files[0]);
    }
  };

  const handleVideoFileChange = (file: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/x-matroska', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid video format. Please upload MP4, WEBM, MKV, or MOV files.');
      return;
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('Video file is too large. Maximum size is 500MB. Please compress your video.');
      return;
    }

    setVideoFile(file);
    setError(null);
  };

  const handleThumbnailFileChange = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid thumbnail format. Please upload JPEG, PNG, WEBP, or GIF files.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Thumbnail file is too large. Maximum size is 10MB.');
      return;
    }

    setThumbnailFile(file);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (uploadMode === 'file' && !videoFile) {
      setError('Please select a video file');
      return;
    }

    if (uploadMode === 'url' && !videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a video title');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      if (uploadMode === 'url') {
        // URL mode - submit directly to API
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode: 'url',
            videoUrl: videoUrl.trim(),
            thumbnailUrl: thumbnailUrl.trim() || null,
            title: title.trim(),
            description: description.trim(),
            isPublished,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setSuccess('Video added successfully!');
      } else {
        // File mode - use FormData
        const formData = new FormData();
        formData.append('mode', 'file');
        formData.append('video', videoFile!);
        if (thumbnailFile) {
          formData.append('thumbnail', thumbnailFile);
        }
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('isPublished', isPublished.toString());

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) return prev;
            return prev + 5;
          });
        }, 500);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setSuccess('Video uploaded successfully!');
      }

      // Reset form
      setVideoFile(null);
      setVideoUrl('');
      setThumbnailFile(null);
      setThumbnailUrl('');
      setTitle('');
      setDescription('');
      setIsPublished(false);
      setUploadProgress(0);

      // Redirect to videos page after 2 seconds
      setTimeout(() => {
        router.push('/videos');
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload video');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Content Upload</h1>
          <p className="text-slate-400 text-sm">Upload and manage video content</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-lg border border-glass-border">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>Ready</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start">
          <ShieldAlert className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Switcher */}
          <div className="flex gap-3 p-1 bg-black/40 border border-glass-border rounded-xl">
            <button
              onClick={() => setUploadMode('url')}
              disabled={isUploading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                uploadMode === 'url'
                  ? 'bg-electric-violet text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📎 Link Video (Recommended)
            </button>
            <button
              onClick={() => setUploadMode('file')}
              disabled={isUploading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                uploadMode === 'file'
                  ? 'bg-electric-violet text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              📤 Upload File
            </button>
          </div>

          {uploadMode === 'url' ? (
            /* URL Input Mode */
            <div className="bg-white/5 border border-glass-border rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Video URL * (Google Drive, Dropbox, etc.)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  disabled={isUploading}
                  className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition-all disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: For Google Drive, make sure the link is set to "Anyone with the link can view"
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  disabled={isUploading}
                  className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition-all disabled:opacity-50"
                />
              </div>
            </div>
          ) : (
            /* File Upload Mode */
            <>
          {/* Video Upload Area */}
          <div
            onDragOver={handleVideoDragOver}
            onDragLeave={handleVideoDragLeave}
            onDrop={handleVideoDrop}
            onClick={() => !isUploading && videoInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
              ${isDragging ? 'border-electric-violet bg-electric-violet/10 scale-[1.02]' : 'border-slate-700 bg-black/40 hover:bg-white/5 hover:border-slate-500'}
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            {videoFile ? (
              <div className="flex flex-col items-center justify-center text-center px-4">
                <FileVideo className="w-12 h-12 text-electric-violet mb-3" />
                <p className="text-white font-medium mb-1">{videoFile.name}</p>
                <p className="text-slate-400 text-sm">{formatFileSize(videoFile.size)}</p>
                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                    }}
                    className="mt-3 text-red-500 text-sm hover:text-red-400"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <motion.div
                  animate={{ y: isDragging ? -10 : 0 }}
                  className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 shadow-lg"
                >
                  <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-electric-violet' : 'text-slate-400'}`} />
                </motion.div>
                <p className="mb-2 text-lg text-slate-300 font-medium">Drag and drop video file</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">MP4, WEBM, MKV, or MOV (Max 500MB)</p>
              </div>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/x-matroska,video/quicktime"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) handleVideoFileChange(file);
              }}
              className="hidden"
            />
          </div>

          {/* Thumbnail Upload - File Mode */}
          <div className="bg-white/5 border border-glass-border rounded-2xl p-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Thumbnail Image (Optional)
            </label>
            <div
              onClick={() => !isUploading && thumbnailInputRef.current?.click()}
              className={`
                relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
                ${thumbnailFile ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700 bg-black/40 hover:bg-white/5'}
                ${isUploading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              {thumbnailFile ? (
                <div className="flex items-center space-x-4">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <p className="text-white font-medium">{thumbnailFile.name}</p>
                    <p className="text-slate-400 text-sm">{formatFileSize(thumbnailFile.size)}</p>
                    {!isUploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailFile(null);
                        }}
                        className="mt-1 text-red-500 text-sm hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Click to upload thumbnail</p>
                  <p className="text-slate-600 text-xs">JPEG, PNG, WEBP, or GIF (Max 10MB)</p>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailFileChange(file);
                }}
                className="hidden"
              />
            </div>
          </div>
            </>
          )}

          {/* Video Details Form */}
          <div className="bg-white/5 border border-glass-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Video Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title..."
                disabled={isUploading}
                className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Video description..."
                disabled={isUploading}
                className="w-full bg-black/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-electric-violet focus:ring-1 focus:ring-electric-violet transition-all disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    disabled={isUploading}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-electric-violet peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-electric-violet peer-disabled:opacity-50" />
                </div>
                <span className="ml-3 text-sm font-medium text-slate-300 group-hover:text-white">
                  Publish Immediately
                </span>
              </label>

              <button
                onClick={handleSubmit}
                disabled={isUploading || (uploadMode === 'file' ? !videoFile : !videoUrl.trim()) || !title.trim()}
                className="px-8 py-3 bg-electric-violet text-white font-bold rounded-lg hover:bg-violet-600 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadMode === 'url' ? 'Adding...' : 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {uploadMode === 'url' ? 'Add Video' : 'Upload Video'}
                  </>
                )}
              </button>
            </div>

            {isUploading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-electric-violet h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-electric-violet/10 border border-electric-violet/30 rounded-2xl p-6">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-electric-violet mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-white font-bold text-sm mb-2">Upload Guidelines</h3>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li>• Video files: MP4, WEBM, MKV, MOV</li>
                  <li>• Maximum video size: 500MB</li>
                  <li>• Thumbnail: JPEG, PNG, WEBP, GIF</li>
                  <li>• Maximum thumbnail size: 10MB</li>
                  <li>• Recommended resolution: 1920x1080 or higher</li>
                  <li>• For larger files, use video compression tools</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-glass-border rounded-2xl p-6">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-slate-300">Video</span>
                <span className={`text-xs font-semibold ${
                  uploadMode === 'url'
                    ? (videoUrl.trim() ? 'text-green-400' : 'text-slate-500')
                    : (videoFile ? 'text-green-400' : 'text-slate-500')
                }`}>
                  {uploadMode === 'url'
                    ? (videoUrl.trim() ? 'URL Set' : 'Required')
                    : (videoFile ? 'Ready' : 'Not Selected')
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-slate-300">Thumbnail</span>
                <span className={`text-xs font-semibold ${
                  uploadMode === 'url'
                    ? (thumbnailUrl.trim() ? 'text-green-400' : 'text-slate-500')
                    : (thumbnailFile ? 'text-green-400' : 'text-slate-500')
                }`}>
                  {uploadMode === 'url'
                    ? (thumbnailUrl.trim() ? 'URL Set' : 'Optional')
                    : (thumbnailFile ? 'Ready' : 'Optional')
                  }
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-sm text-slate-300">Title</span>
                <span className={`text-xs font-semibold ${title.trim() ? 'text-green-400' : 'text-slate-500'}`}>
                  {title.trim() ? 'Set' : 'Required'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
