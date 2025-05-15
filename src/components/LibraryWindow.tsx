import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useJukeboxStore } from '../store/useJukeboxStore';
import { LibraryPlaylist } from '../types/playlist';
import { extractPlaylistId, fetchPlaylistDetails, fetchPlaylistVideos } from '../services/playlist.service';
import { generateId } from '../lib/utils';
import { PlusCircle, Trash, Edit, Check, X, AlertCircle, Loader2 } from 'lucide-react';

const LibraryWindow = () => {
  const { 
    playlists, 
    addPlaylist, 
    removePlaylist, 
    updatePlaylist, 
    setPlaylistVideos 
  } = useJukeboxStore();

  // Local state
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [loadingPlaylistId, setLoadingPlaylistId] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [urlError, setUrlError] = useState('');

  // Handle adding new playlist
  const handleAddPlaylist = async () => {
    // Reset errors
    setIsValidUrl(true);
    setUrlError('');
    
    // Extract playlist ID from URL
    const playlistId = extractPlaylistId(playlistUrl);
    
    if (!playlistId) {
      setIsValidUrl(false);
      setUrlError('Invalid YouTube playlist URL');
      return;
    }
    
    // Check if playlist already exists
    const exists = playlists.some(p => {
      const existingId = extractPlaylistId(p.url);
      return existingId === playlistId;
    });
    
    if (exists) {
      setIsValidUrl(false);
      setUrlError('This playlist is already in your library');
      return;
    }
    
    try {
      // Fetch playlist details
      const details = await fetchPlaylistDetails(playlistId);
      
      // Create new playlist object
      const newPlaylist: LibraryPlaylist = {
        id: generateId(),
        name: details.title,
        url: playlistUrl,
        enabled: true,
        videoCount: details.count,
        videos: [],
      };
      
      // Add to store
      addPlaylist(newPlaylist);
      
      // Clear input
      setPlaylistUrl('');
      
      // Load videos
      loadPlaylistVideos(newPlaylist.id, playlistId);
    } catch (error) {
      console.error('Error adding playlist:', error);
      setIsValidUrl(false);
      setUrlError('Could not fetch playlist details. Please check the URL and try again.');
    }
  };
  
  // Handle loading videos for a playlist
  const loadPlaylistVideos = async (playlistId: string, youtubePlaylistId: string) => {
    setLoadingPlaylistId(playlistId);
    setLoadingProgress(0);
    
    try {
      // Fetch videos with progress tracking
      const videos = await fetchPlaylistVideos(
        youtubePlaylistId,
        (loaded, total) => {
          const progress = Math.floor((loaded / total) * 100);
          setLoadingProgress(progress);
        }
      );
      
      // Update the store with the videos
      setPlaylistVideos(playlistId, videos);
    } catch (error) {
      console.error('Error loading playlist videos:', error);
    } finally {
      setLoadingPlaylistId(null);
      setLoadingProgress(0);
    }
  };
  
  // Handle removing a playlist
  const handleRemovePlaylist = (id: string) => {
    // Ask for confirmation
    if (window.confirm('Are you sure you want to remove this playlist from your library?')) {
      const success = removePlaylist(id);
      if (!success) {
        alert('Cannot remove the last playlist from your library.');
      }
    }
  };
  
  // Handle editing a playlist
  const handleEditClick = (playlist: LibraryPlaylist) => {
    setEditingPlaylistId(playlist.id);
    setEditName(playlist.name);
  };
  
  // Save playlist edit
  const handleSaveEdit = (id: string) => {
    updatePlaylist(id, { name: editName });
    setEditingPlaylistId(null);
  };
  
  // Cancel playlist edit
  const handleCancelEdit = () => {
    setEditingPlaylistId(null);
  };
  
  // Toggle playlist enabled state
  const handleToggleEnabled = (id: string, currentState: boolean) => {
    updatePlaylist(id, { enabled: !currentState });
  };
  
  // Reload playlist videos
  const handleReloadPlaylist = (playlist: LibraryPlaylist) => {
    const playlistId = extractPlaylistId(playlist.url);
    if (playlistId) {
      loadPlaylistVideos(playlist.id, playlistId);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-2xl font-bold mb-6 skeuo-text">Your Music Library</h2>
      
      {/* Add Playlist Form */}
      <div className="skeuo-panel mb-6">
        <h3 className="text-lg font-semibold mb-3">Add YouTube Playlist</h3>
        
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm mb-1">
              YouTube Playlist URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={playlistUrl}
                onChange={(e) => {
                  setPlaylistUrl(e.target.value);
                  setIsValidUrl(true);
                  setUrlError('');
                }}
                placeholder="https://www.youtube.com/playlist?list=..."
                className={`skeuo-input flex-1 ${!isValidUrl ? 'border-red-500' : ''}`}
              />
              <button
                onClick={handleAddPlaylist}
                className="skeuo-button-primary flex items-center gap-1"
                disabled={!playlistUrl}
              >
                <PlusCircle size={16} />
                Add
              </button>
            </div>
            {!isValidUrl && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                {urlError || 'Please enter a valid YouTube playlist URL'}
              </p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              Example: https://www.youtube.com/playlist?list=PLw-VjHDlEOgvtnnnqWlTqByAtC7tXBg6D
            </p>
          </div>
        </div>
      </div>
      
      {/* Playlist List */}
      <div className="flex-1 overflow-auto">
        <h3 className="text-lg font-semibold mb-3">Your Playlists</h3>
        
        {playlists.length === 0 ? (
          <div className="skeuo-panel text-center py-10">
            <p className="text-gray-400">You don't have any playlists yet.</p>
            <p className="text-gray-400 text-sm mt-1">Add a YouTube playlist to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="skeuo-panel flex flex-col">
                <div className="flex justify-between items-center">
                  {editingPlaylistId === playlist.id ? (
                    <div className="flex-1 flex gap-2 items-center">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="skeuo-input flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(playlist.id)}
                        className="skeuo-button p-2"
                        title="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="skeuo-button p-2"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={playlist.enabled}
                          onChange={() => handleToggleEnabled(playlist.id, playlist.enabled)}
                          className="skeuo-input h-4 w-4"
                        />
                        <h4 className="font-semibold">{playlist.name}</h4>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 break-all">
                        {playlist.url}
                      </p>
                    </div>
                  )}
                  
                  {editingPlaylistId !== playlist.id && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditClick(playlist)}
                        className="skeuo-button p-2"
                        title="Edit Playlist"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleRemovePlaylist(playlist.id)}
                        className="skeuo-button p-2"
                        title="Remove Playlist"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">
                        <span className="text-gray-400">Videos: </span>
                        <span>{playlist.videoCount}</span>
                      </p>
                    </div>
                    
                    {loadingPlaylistId === playlist.id ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">Loading... {loadingProgress}%</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReloadPlaylist(playlist)}
                        className="skeuo-button text-sm py-1"
                      >
                        Reload Videos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryWindow;
