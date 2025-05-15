export interface VideoItem {
  id: string;
  youtubeId: string;
  artist: string;
  title: string;
  thumbnail: string;
  duration?: string;
  categoryId?: string;
}

export interface LibraryPlaylist {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  videoCount: number;
  videos: VideoItem[];
}

export interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface QueueItem extends VideoItem {
  playlistId: string;
}
