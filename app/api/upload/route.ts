import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { supabaseAdmin } from '@/lib/supabase';

// Helper function to convert Google Drive sharing link to direct/embed link
function convertGoogleDriveUrl(url: string): string {
  // Match Google Drive file ID from various URL formats
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const fileId = match[1];
      // Return direct download link (works better for video players)
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }

  // Return original URL if not a Google Drive link
  return url;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or owner
    if (!['admin', 'owner'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type');

    // Check if this is URL mode (JSON) or file mode (FormData)
    if (contentType?.includes('application/json')) {
      // URL Mode - Direct link to video
      const body = await request.json();
      const { videoUrl, thumbnailUrl, title, description, isPublished } = body;

      // Validation
      if (!videoUrl || !videoUrl.trim()) {
        return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
      }

      if (!title || title.trim().length === 0) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }

      if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      // Convert Google Drive URLs to direct links
      const processedVideoUrl = convertGoogleDriveUrl(videoUrl.trim());
      const processedThumbnailUrl = thumbnailUrl?.trim() ? convertGoogleDriveUrl(thumbnailUrl.trim()) : null;

      console.log('Original video URL:', videoUrl.trim());
      console.log('Processed video URL:', processedVideoUrl);

      // Insert link metadata into database
      const { data: dbData, error: dbError } = await supabaseAdmin
        .from('videos')
        .insert({
          title: title.trim(),
          description: description?.trim() || null,
          video_url: processedVideoUrl,
          thumbnail_url: processedThumbnailUrl,
          is_published: isPublished || false,
          content_type: 'link', // Mark as link type
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        return NextResponse.json(
          { error: `Failed to save video: ${dbError.message}` },
          { status: 500 }
        );
      }

      console.log('Video added successfully:', dbData);

      return NextResponse.json({
        success: true,
        video: dbData,
        message: 'Video added successfully',
      });
    }

    // File Mode - Original upload logic
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const isPublished = formData.get('isPublished') === 'true';

    // Validation
    if (!videoFile) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Validate video file type
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/x-matroska', 'video/quicktime'];
    if (!validVideoTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: 'Invalid video format. Accepted: MP4, WEBM, MKV, MOV' },
        { status: 400 }
      );
    }

    // Validate thumbnail file type (if provided)
    if (thumbnailFile) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validImageTypes.includes(thumbnailFile.type)) {
        return NextResponse.json(
          { error: 'Invalid thumbnail format. Accepted: JPEG, PNG, WEBP, GIF' },
          { status: 400 }
        );
      }

      const maxThumbnailSize = 10 * 1024 * 1024; // 10MB
      if (thumbnailFile.size > maxThumbnailSize) {
        return NextResponse.json({ error: 'Thumbnail file too large (max 10MB)' }, { status: 400 });
      }
    }

    // Validate video file size
    const maxVideoSize = 500 * 1024 * 1024; // 500MB (reduced for stability)
    if (videoFile.size > maxVideoSize) {
      return NextResponse.json({
        error: 'Video file too large. Maximum size is 500MB. For larger files, please compress your video or split it into smaller parts.'
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate unique filenames
    const timestamp = Date.now();
    const videoExt = videoFile.name.split('.').pop();
    const videoFileName = `${timestamp}-${title.replace(/[^a-z0-9]/gi, '_')}.${videoExt}`;

    let thumbnailFileName = '';
    if (thumbnailFile) {
      const thumbnailExt = thumbnailFile.name.split('.').pop();
      thumbnailFileName = `${timestamp}-${title.replace(/[^a-z0-9]/gi, '_')}.${thumbnailExt}`;
    }

    // Upload video file
    console.log('Uploading video file:', videoFileName);
    const videoBuffer = await videoFile.arrayBuffer();
    const { data: videoData, error: videoError } = await supabaseAdmin.storage
      .from('videos')
      .upload(videoFileName, videoBuffer, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (videoError) {
      console.error('Video upload error:', videoError);
      return NextResponse.json(
        { error: `Failed to upload video: ${videoError.message}` },
        { status: 500 }
      );
    }

    // Upload thumbnail file (if provided)
    let thumbnailUrl: string | null = null;
    if (thumbnailFile) {
      console.log('Uploading thumbnail file:', thumbnailFileName);
      const thumbnailBuffer = await thumbnailFile.arrayBuffer();
      const { data: thumbnailData, error: thumbnailError } = await supabaseAdmin.storage
        .from('thumbnails')
        .upload(thumbnailFileName, thumbnailBuffer, {
          contentType: thumbnailFile.type,
          upsert: false,
        });

      if (thumbnailError) {
        console.error('Thumbnail upload error:', thumbnailError);
        // Clean up video if thumbnail upload fails
        await supabaseAdmin.storage.from('videos').remove([videoFileName]);
        return NextResponse.json(
          { error: `Failed to upload thumbnail: ${thumbnailError.message}` },
          { status: 500 }
        );
      }

      // Get thumbnail public URL
      const { data: thumbnailUrlData } = supabaseAdmin.storage
        .from('thumbnails')
        .getPublicUrl(thumbnailFileName);
      thumbnailUrl = thumbnailUrlData.publicUrl;
    }

    // Get video public URL
    const { data: videoUrlData } = supabaseAdmin.storage.from('videos').getPublicUrl(videoFileName);
    const videoUrl = videoUrlData.publicUrl;

    console.log('Video URL:', videoUrl);
    console.log('Thumbnail URL:', thumbnailUrl);

    // Insert video metadata into database
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        title,
        description: description || null,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        is_published: isPublished,
        content_type: 'video', // Mark as video type
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded files if database insert fails
      await supabaseAdmin.storage.from('videos').remove([videoFileName]);
      if (thumbnailFileName) {
        await supabaseAdmin.storage.from('thumbnails').remove([thumbnailFileName]);
      }
      return NextResponse.json(
        { error: `Failed to save video metadata: ${dbError.message}` },
        { status: 500 }
      );
    }

    console.log('Video uploaded successfully:', dbData);

    return NextResponse.json({
      success: true,
      video: dbData,
      message: 'Video uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
