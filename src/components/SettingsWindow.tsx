import { useJukeboxStore } from '../store/useJukeboxStore';
import { AspectRatio } from '../types/settings';
import { cn } from '../lib/utils';

const SettingsWindow = () => {
  const { 
    settings, 
    updateSettings, 
    playlists, 
    queue, 
    clearQueue 
  } = useJukeboxStore();

  // Handle aspect ratio change
  const handleAspectRatioChange = (ratio: AspectRatio) => {
    updateSettings({ aspectRatio: ratio });
  };
  
  // Handle default playlist change
  const handleDefaultPlaylistChange = (playlistId: string | null) => {
    updateSettings({ defaultPlaylistId: playlistId });
  };
  
  // Handle random play toggle
  const handleRandomPlayChange = (value: boolean) => {
    updateSettings({ randomPlay: value });
  };
  
  // Handle clearing queue
  const handleClearQueue = () => {
    if (queue.length === 0) {
      alert('Your queue is already empty.');
      return;
    }
    
    if (window.confirm('Are you sure you want to clear your queue?')) {
      clearQueue();
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-2xl font-bold mb-6 skeuo-text">Settings</h2>
      
      <div className="space-y-6">
        {/* Aspect Ratio */}
        <div className="skeuo-panel">
          <h3 className="text-lg font-semibold mb-3">Display Aspect Ratio</h3>
          <p className="text-sm text-gray-400 mb-3">
            Choose the aspect ratio for the jukebox display. This affects the layout and number of videos shown.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleAspectRatioChange('4:3')}
              className={cn(
                'skeuo-button flex-1 py-3',
                settings.aspectRatio === '4:3' ? 'skeuo-button-primary' : ''
              )}
            >
              4:3 (Classic)
            </button>
            <button
              onClick={() => handleAspectRatioChange('16:9')}
              className={cn(
                'skeuo-button flex-1 py-3',
                settings.aspectRatio === '16:9' ? 'skeuo-button-primary' : ''
              )}
            >
              16:9 (Widescreen)
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <ul className="text-sm text-gray-400">
              <li className="mb-1">• 4:3: Shows 6 videos per row (24 total)</li>
              <li>• 16:9: Shows 8 videos per row (32 total)</li>
            </ul>
          </div>
        </div>
        
        {/* Playback Settings */}
        <div className="skeuo-panel">
          <h3 className="text-lg font-semibold mb-3">Playback Settings</h3>
          
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={settings.randomPlay}
                onChange={(e) => handleRandomPlayChange(e.target.checked)}
                className="skeuo-input h-4 w-4"
              />
              <span>Random Play</span>
            </label>
            <p className="text-sm text-gray-400 ml-6">
              Play videos in random order rather than sequential.
            </p>
          </div>
          
          <div>
            <label className="block mb-2">Default Playlist</label>
            <select
              value={settings.defaultPlaylistId || ''}
              onChange={(e) => handleDefaultPlaylistChange(e.target.value || null)}
              className="skeuo-input w-full"
            >
              <option value="">None</option>
              {playlists.map((playlist) => (
                <option key={playlist.id} value={playlist.id}>
                  {playlist.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-400 mt-1">
              This playlist will be selected by default when you open the jukebox.
            </p>
          </div>
        </div>
        
        {/* Queue Management */}
        <div className="skeuo-panel">
          <h3 className="text-lg font-semibold mb-3">Queue Management</h3>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="mb-1">Current Queue Length: {queue.length} videos</p>
              <p className="text-sm text-gray-400">
                Clear your queue to start fresh.
              </p>
            </div>
            
            <button
              onClick={handleClearQueue}
              className="skeuo-button"
              disabled={queue.length === 0}
            >
              Clear Queue
            </button>
          </div>
        </div>
        
        {/* About */}
        <div className="skeuo-panel">
          <h3 className="text-lg font-semibold mb-2">About JukeBox Tempo</h3>
          <p className="text-sm mb-2">
            Version 2.0.0
          </p>
          <p className="text-sm text-gray-400">
            JukeBox Tempo is a retro arcade-style jukebox for YouTube videos. Create your music library by adding YouTube playlists and enjoy your favorite music videos with a nostalgic interface.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsWindow;
