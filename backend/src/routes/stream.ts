import express from 'express';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';
import { storage } from '../index';
import { logger } from '../utils/logger';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { sanitize } from 'sanitize-filename';

const router = express.Router();

// Get video stream
router.get('/:id', async (req: AuthRequest, res, next) => {
  let videoStream: any = null;
  try {
    const { id } = req.params;
    const { quality = '720p' } = req.query;

    // Sanitize the video ID to prevent path traversal
    const sanitizedId = sanitize(id);
    if (sanitizedId !== id) {
      throw new AppError('Invalid video ID', 400);
    }

    // Validate quality parameter
    const validQualities = ['1080p', '720p', '480p', '360p'];
    if (!validQualities.includes(quality as string)) {
      throw new AppError('Invalid quality parameter', 400);
    }

    // Get video file from storage
    const videoFile = storage.bucket().file(`videos/${sanitizedId}`);
    const exists = await videoFile.exists();

    if (!exists[0]) {
      throw new AppError('Video not found', 404);
    }

    // Get video metadata
    const [metadata] = await videoFile.getMetadata();
    const contentType = metadata.contentType;

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');

    // Handle range request for streaming
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : metadata.size - 1;
      const chunksize = end - start + 1;
      videoStream = videoFile.createReadStream({ start, end });

      res.setHeader('Content-Range', `bytes ${start}-${end}/${metadata.size}`);
      res.setHeader('Content-Length', chunksize);
      res.setHeader('Accept-Ranges', 'bytes');
      res.status(206);

      videoStream.pipe(res);
    } else {
      // If no range requested, stream the entire file
      videoStream = videoFile.createReadStream();
      videoStream.pipe(res);
    }

    // Handle errors
    videoStream.on('error', (error: Error) => {
      logger.error('Streaming error:', error);
      if (!res.headersSent) {
        next(new AppError('Error streaming video', 500));
      }
      videoStream.destroy();
    });

    // Handle client disconnect
    req.on('close', () => {
      if (videoStream) {
        videoStream.destroy();
      }
    });
  } catch (error) {
    if (videoStream) {
      videoStream.destroy();
    }
    next(error instanceof AppError ? error : new AppError('Error streaming video', 500));
  }
});

// Get video manifest for adaptive streaming
router.get('/:id/manifest', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const sanitizedId = sanitize(id);
    if (sanitizedId !== id) {
      throw new AppError('Invalid video ID', 400);
    }

    const manifestPath = path.resolve(process.cwd(), 'manifests', `${sanitizedId}.m3u8`);

    // Check if manifest exists and is not too old (24 hours)
    if (fs.existsSync(manifestPath)) {
      const stats = fs.statSync(manifestPath);
      const hoursOld = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
      if (hoursOld < 24) {
        return res.sendFile(manifestPath);
      }
    }

    // Generate manifest if it doesn't exist or is too old
    await generateManifest(sanitizedId);
    res.sendFile(manifestPath);
  } catch (error) {
    next(new AppError('Error getting video manifest', 500));
  }
});

// Generate video manifest for adaptive streaming
async function generateManifest(videoId: string) {
  const videoFile = storage.bucket().file(`videos/${videoId}`);
  const tempDir = path.resolve(process.cwd(), 'temp');
  const tempPath = path.resolve(tempDir, videoId);
  const manifestPath = path.resolve(process.cwd(), 'manifests', `${videoId}.m3u8`);

  // Ensure directories exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  if (!fs.existsSync(path.dirname(manifestPath))) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  }

  try {
    // Download video to temp directory
    await videoFile.download({ destination: tempPath });

    // Generate different quality versions
    const qualities = [
      { name: '1080p', height: 1080 },
      { name: '720p', height: 720 },
      { name: '480p', height: 480 },
      { name: '360p', height: 360 },
    ];

    const segmentsDir = path.resolve(process.cwd(), 'segments', videoId);
    if (!fs.existsSync(segmentsDir)) {
      fs.mkdirSync(segmentsDir, { recursive: true });
    }

    // Generate segments for each quality
    await Promise.all(
      qualities.map(
        (quality) =>
          new Promise((resolve, reject) => {
            ffmpeg(tempPath)
              .outputOptions([
                `-c:v libx264`,
                `-c:a aac`,
                `-hls_time 10`,
                `-hls_playlist_type vod`,
                `-hls_segment_filename ${segmentsDir}/${quality.name}_%03d.ts`,
                `-filter:v scale=-2:${quality.height}`,
              ])
              .output(`${segmentsDir}/${quality.name}.m3u8`)
              .on('end', resolve)
              .on('error', reject)
              .run();
          })
      )
    );

    // Generate master manifest
    const masterManifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=854x480
480p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=500000,RESOLUTION=640x360
360p.m3u8`;

    fs.writeFileSync(manifestPath, masterManifest);
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

// Clean up old manifest files periodically
setInterval(() => {
  const manifestsDir = path.resolve(process.cwd(), 'manifests');
  if (fs.existsSync(manifestsDir)) {
    const files = fs.readdirSync(manifestsDir);
    const now = Date.now();
    files.forEach((file) => {
      const filePath = path.join(manifestsDir, file);
      const stats = fs.statSync(filePath);
      const hoursOld = (now - stats.mtimeMs) / (1000 * 60 * 60);
      if (hoursOld > 24) {
        fs.unlinkSync(filePath);
      }
    });
  }
}, 60 * 60 * 1000); // Run every hour

export default router; 