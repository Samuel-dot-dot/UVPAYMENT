import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE /api/videos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // First, get the video to retrieve the file URLs
    const { data: video, error: fetchError } = await (supabaseAdmin as any)
      .from('videos')
      .select('video_url, thumbnail_url')
      .eq('id', id)
      .single();

    if (fetchError || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Extract filenames from URLs and delete files from storage
    if ((video as any).video_url) {
      try {
        const videoPath = (video as any).video_url.split('/').pop();
        if (videoPath) {
          console.log('Deleting video file:', videoPath);
          const { error: videoDeleteError } = await supabaseAdmin.storage
            .from('videos')
            .remove([videoPath]);

          if (videoDeleteError) {
            console.error('Error deleting video file:', videoDeleteError);
          }
        }
      } catch (err) {
        console.error('Error extracting video path:', err);
      }
    }

    if ((video as any).thumbnail_url) {
      try {
        const thumbnailPath = (video as any).thumbnail_url.split('/').pop();
        if (thumbnailPath) {
          console.log('Deleting thumbnail file:', thumbnailPath);
          const { error: thumbnailDeleteError } = await supabaseAdmin.storage
            .from('thumbnails')
            .remove([thumbnailPath]);

          if (thumbnailDeleteError) {
            console.error('Error deleting thumbnail file:', thumbnailDeleteError);
          }
        }
      } catch (err) {
        console.error('Error extracting thumbnail path:', err);
      }
    }

    // Delete the video record from the database
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('videos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting video from database:', deleteError);
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
    }

    console.log('Video deleted successfully:', id);
    return NextResponse.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/videos/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/videos/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Update the video in the database
    const { data: updatedVideo, error: updateError } = await (supabaseAdmin as any)
      .from('videos')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating video:', updateError);
      return NextResponse.json({ error: 'Failed to update video' }, { status: 500 });
    }

    if (!updatedVideo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    console.log('Video updated successfully:', id);
    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error('Error in PATCH /api/videos/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
