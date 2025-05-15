import { useState, useRef, useEffect } from 'react';
import { useJukeboxStore } from '../store/useJukeboxStore';
import { VideoItem, QueueItem, Category } from '../types/playlist';
import { Search, Music, Disc3, Radio, Mic2, Film } from 'lucide-react';
import { cn } from '../lib/utils';

// Define categories with icons
const defaultCategories: Category[] = [
  { id: 'all', name: 'All', icon: <Music size={16} /> },
  { id: 'rock', name: 'Rock', icon: <Disc3 size={16} /> },
  { id: 'pop', name: 'Pop', icon: <Radio size={16} /> },
  { id: 'hiphop', name: 'Hip Hop', icon: <Mic2 size={16} /> },
  { id: 'other', name: 'Other', icon: <Film size={16} /> },
];

interface JukeboxWindowProps {
  queue: QueueItem[];
  currentVideoIndex: number;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const JukeboxWindow = ({ queue, currentVideoIndex, isPlaying, setIsPlaying }: JukeboxWindowProps) => {
  const { 
    playlists, 
    searchQuery, 
    setSearchQuery, 
    addToQueue,
    settings, 
    nextVideo 
  } = useJukeboxStore();
  
  // Local state for UI
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [showAddToQueueDialog, setShowAddToQueueDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // YouTube player ref
  const playerRef = useRef<HTMLIFrameElement>(null);
  
  // Video grid configuration based on aspect ratio
  const gridColumns = settings.aspectRatio === '4:3' ? 6 : 8;
  const videosPerPage = gridColumns * 4; // 4 rows
  
  // Filter and paginate videos based on search query and active category
  useEffect(() => {
    // Combine all videos from all playlists
    let allVideos = playlists
      .filter(playlist => playlist.enabled)
      .flatMap(playlist => playlist.videos)
      .filter(Boolean);
    
    // Apply category filter if applicable
    if (activeCategory !== 'all') {
      allVideos = allVideos.filter(video => video.categoryId === activeCategory);
    }
    
    // Apply search filter if applicable
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      allVideos = allVideos.filter(video => 
        video.title.toLowerCase().includes(query) || 
        video.artist.toLowerCase().includes(query)
      );
    }
    
    // Calculate pagination
    const totalItems = allVideos.length;
    const calculatedTotalPages = Math.ceil(totalItems / videosPerPage);
    
    setTotalPages(calculatedTotalPages || 1);
    
    // Adjust current page if needed
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1);
    }
    
    // Paginate the videos
    const start = (currentPage - 1) * videosPerPage;
    const paginatedVideos = allVideos.slice(start, start + videosPerPage);
    
    setFilteredVideos(paginatedVideos);
  }, [playlists, searchQuery, activeCategory, currentPage, settings.aspectRatio, videosPerPage]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Handle video selection
  const handleVideoClick = (video: VideoItem) => {
    const isCurrentlyPlaying = 
      queue.length > 0 && 
      currentVideoIndex < queue.length && 
      queue[currentVideoIndex]?.youtubeId === video.youtubeId;
    
    const isInQueue = queue.some(queueVideo => queueVideo.youtubeId === video.youtubeId);
    
    setSelectedVideo(video);
    
    if (isCurrentlyPlaying) {
      alert('This video is currently playing!');
    } else if (isInQueue) {
      alert('This video is already in the queue!');
    } else {
      setShowAddToQueueDialog(true);
    }
  };
  
  // Handle adding to queue
  const handleAddToQueue = () => {
    if (selectedVideo) {
      // Find the playlist that contains this video
      const playlist = playlists.find(p => 
        p.videos.some(v => v.youtubeId === selectedVideo.youtubeId)
      );
      
      if (playlist) {
        addToQueue(selectedVideo, playlist.id);
        setShowAddToQueueDialog(false);
      }
    }
  };
  
  // Handle YouTube player events
  const onPlayerStateChange = (event: MessageEvent) => {
    if (event.data && event.data.event === 'onStateChange') {
      if (event.data.info === 0) { // Video ended
        window.postMessage({ type: 'VIDEO_ENDED' }, '*');
      }
    }
  };
  
  useEffect(() => {
    window.addEventListener('message', onPlayerStateChange);
    return () => {
      window.removeEventListener('message', onPlayerStateChange);
    };
  }, []);
  
  // Current video to play
  const currentVideo = queue[currentVideoIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Header with search */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold skeuo-text">JukeBox Tempo</h1>
          
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="skeuo-input w-full pl-10"
            />
            <Search className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 overflow-hidden p-4">
          {/* Video player section */}
          {currentVideo && (
            <div className="mb-4 bg-black rounded-md overflow-hidden">
              <iframe
                ref={playerRef}
                width="100%"
                height={settings.aspectRatio === '4:3' ? '300' : '360'}
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?enablejsapi=1&autoplay=${isPlaying ? '1' : '0'}&controls=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              <div className="p-3 bg-gray-800">
                <h3 className="text-lg font-semibold">{currentVideo.title}</h3>
                <p className="text-gray-400">{currentVideo.artist}</p>
                
                <div className="flex gap-2 mt-2">
                  <button 
                    className="skeuo-button-primary"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button 
                    className="skeuo-button"
                    onClick={nextVideo}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Video grid */}
          <div className={`grid grid-cols-${gridColumns} gap-4`}>
            {filteredVideos.map((video, index) => (
              <div 
                key={`${video.youtubeId}-${index}`}
                onClick={() => handleVideoClick(video)}
                className="skeuo-panel cursor-pointer hover:shadow-lg transition-all"
                style={{ width: '180px', margin: '0 auto' }}
              >
                <div className="p-3">
                  {/* Wider thumbnails (1.8/1 ratio) */}
                  <div className="relative rounded-md overflow-hidden mb-3" style={{ aspectRatio: '1.8/1' }}>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="skeuo-thumbnail-img w-full h-full object-cover"
                    />
                    {video.duration && (
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {video.duration}
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-1">{video.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{video.artist}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={cn(
                    "skeuo-button",
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "skeuo-button min-w-[40px]",
                        page === currentPage ? "skeuo-button-primary" : ""
                      )}
                    >
                      {page}
                    </button>
                  ),
                )}
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={cn(
                    "skeuo-button",
                    currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Categories Footer */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <h3 className="text-sm uppercase text-gray-400 mb-2 skeuo-text">Categories</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {defaultCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2",
                  activeCategory === category.id
                    ? "skeuo-button-primary"
                    : "skeuo-button"
                )}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Add to Queue Dialog */}
      {showAddToQueueDialog && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="skeuo-panel max-w-md w-full">
            <h3 className="text-xl mb-4">Add to Queue</h3>
            
            <div className="flex items-start gap-4 mb-4">
              <img 
                src={selectedVideo.thumbnail} 
                alt={selectedVideo.title} 
                className="w-24 h-auto rounded-md"
              />
              <div>
                <h4 className="font-semibold">{selectedVideo.title}</h4>
                <p className="text-sm text-gray-400">{selectedVideo.artist}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="skeuo-button"
                onClick={() => setShowAddToQueueDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="skeuo-button-primary"
                onClick={handleAddToQueue}
              >
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JukeboxWindow;
