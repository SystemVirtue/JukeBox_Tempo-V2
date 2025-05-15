import { VideoItem, LibraryPlaylist } from '../types/playlist';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Extracts playlist ID from various YouTube URL formats
 */
export const extractPlaylistId = (url: string): string | null => {
  // Handle youtube.com/playlist?list= format
  const playlistRegex = /(?:youtube\.com\/playlist\?list=)([^&]+)/;
  const playlistMatch = url.match(playlistRegex);
  
  if (playlistMatch) {
    return playlistMatch[1];
  }
  
  // Handle youtube.com/watch?v=VIDEO_ID&list= format
  const watchRegex = /(?:youtube\.com\/watch\?v=.+&list=)([^&]+)/;
  const watchMatch = url.match(watchRegex);
  
  if (watchMatch) {
    return watchMatch[1];
  }
  
  // Handle youtu.be/VIDEO_ID?list= format
  const shortRegex = /(?:youtu\.be\/.+\?list=)([^&]+)/;
  const shortMatch = url.match(shortRegex);
  
  if (shortMatch) {
    return shortMatch[1];
  }
  
  // If the URL is already a playlist ID
  if (/^[A-Za-z0-9_-]{13,}$/.test(url)) {
    return url;
  }
  
  return null;
};

/**
 * Fetches playlist details from YouTube API
 */
export const fetchPlaylistDetails = async (playlistId: string): Promise<{ title: string; count: number }> => {
  try {
    const response = await fetch(
      `${BASE_URL}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return {
        title: data.items[0].snippet.title,
        count: data.items[0].contentDetails.itemCount,
      };
    } else {
      throw new Error('Playlist not found');
    }
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    throw error;
  }
};

/**
 * Fetches all videos from a playlist with pagination handling
 */
export const fetchPlaylistVideos = async (
  playlistId: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<VideoItem[]> => {
  const videos: VideoItem[] = [];
  let nextPageToken: string | undefined = undefined;
  let totalLoaded = 0;
  let totalVideos = 0;
  
  try {
    // Get the playlist details for total count
    const details = await fetchPlaylistDetails(playlistId);
    totalVideos = details.count;
    
    do {
      const pageSize = 50; // Maximum allowed by YouTube API
      const url = `${BASE_URL}/playlistItems?part=snippet,contentDetails&maxResults=${pageSize}&playlistId=${playlistId}&key=${API_KEY}${
        nextPageToken ? `&pageToken=${nextPageToken}` : ''
      }`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        break;
      }
      
      // Process each video item
      const videoIds = data.items
        .map((item: any) => item.snippet?.resourceId?.videoId)
        .filter(Boolean)
        .join(',');
      
      // Fetch video details (duration, etc.) in a batch
      const videoDetailsResponse = await fetch(
        `${BASE_URL}/videos?part=contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
      );
      
      if (!videoDetailsResponse.ok) {
        throw new Error(`API Error: ${videoDetailsResponse.status}`);
      }
      
      const videoDetailsData = await videoDetailsResponse.json();
      const videoDetailsMap = new Map();
      
      videoDetailsData.items?.forEach((item: any) => {
        videoDetailsMap.set(item.id, {
          duration: item.contentDetails?.duration,
          // Extract any additional details needed
        });
      });
      
      // Map playlist items to our VideoItem format
      const pageVideos = data.items
        .filter((item: any) => item.snippet.title !== 'Deleted video' && item.snippet.title !== 'Private video')
        .map((item: any) => {
          const youtubeId = item.snippet?.resourceId?.videoId;
          const details = videoDetailsMap.get(youtubeId) || {};
          const title = item.snippet.title;
          
          // Attempt to extract artist and title
          let artist = '';
          let songTitle = title;
          
          // Common patterns: "Artist - Title", "Artist: Title", "Artist | Title"
          const patterns = [' - ', ': ', ' | '];
          for (const pattern of patterns) {
            if (title.includes(pattern)) {
              const parts = title.split(pattern);
              artist = parts[0].trim();
              songTitle = parts.slice(1).join(pattern).trim();
              break;
            }
          }
          
          return {
            id: item.id,
            youtubeId,
            title: songTitle,
            artist: artist,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            duration: details.duration ? formatDuration(details.duration) : undefined,
          };
        });
      
      videos.push(...pageVideos);
      totalLoaded += pageVideos.length;
      
      if (onProgress) {
        onProgress(totalLoaded, totalVideos);
      }
      
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);
    
    return videos;
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    throw error;
  }
};

/**
 * Fetch a single video's details from YouTube
 */
export const fetchVideoDetails = async (videoId: string): Promise<VideoItem | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      const title = item.snippet.title;
      
      // Attempt to extract artist and title
      let artist = '';
      let songTitle = title;
      
      // Common patterns: "Artist - Title", "Artist: Title", "Artist | Title"
      const patterns = [' - ', ': ', ' | '];
      for (const pattern of patterns) {
        if (title.includes(pattern)) {
          const parts = title.split(pattern);
          artist = parts[0].trim();
          songTitle = parts.slice(1).join(pattern).trim();
          break;
        }
      }
      
      return {
        id: item.id,
        youtubeId: item.id,
        title: songTitle,
        artist: artist,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        duration: formatDuration(item.contentDetails?.duration),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};

/**
 * Format ISO 8601 duration to readable format
 */
const formatDuration = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) {
    return '';
  }
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};
