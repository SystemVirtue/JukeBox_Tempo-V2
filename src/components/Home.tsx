import { useEffect } from 'react';
import { useJukeboxStore } from '../store/useJukeboxStore';
import { Tab, TabList, TabContent } from './ui/Tabs';
import JukeboxWindow from './JukeboxWindow';
import LibraryWindow from './LibraryWindow';
import SettingsWindow from './SettingsWindow';
import { Music, Library, Settings } from 'lucide-react';

const Home = () => {
  const { 
    activeTab, 
    setActiveTab, 
    settings, 
    playlists,
    queue,
    currentVideoIndex,
    isPlaying,
    setIsPlaying,
    nextVideo
  } = useJukeboxStore();

  // Effect to handle video ended event
  useEffect(() => {
    // Subscribe to message events from JukeboxWindow
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'VIDEO_ENDED') {
        nextVideo();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [nextVideo]);

  // Automatically start with the default playlist if available
  useEffect(() => {
    if (playlists.length === 0) {
      // If there are no playlists, switch to the library tab
      setActiveTab('library');
    } else if (queue.length === 0 && settings.defaultPlaylistId) {
      // If there's a default playlist and queue is empty, switch to jukebox
      setActiveTab('jukebox');
    }
  }, [playlists.length, queue.length, settings.defaultPlaylistId, setActiveTab]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* Application content */}
      <main className="flex-1 flex flex-col overflow-hidden p-4">
        <div className={`skeuo-container mx-auto ${settings.aspectRatio === '4:3' ? 'aspect-4/3' : 'aspect-16/9'}`}>
          <div className="h-full flex flex-col bg-gradient-to-b from-gray-800 to-gray-900">
            {/* Tab Content */}
            <TabContent className="flex-1 overflow-hidden">
              {/* Jukebox Tab */}
              <div className={activeTab === 'jukebox' ? 'block h-full' : 'hidden'}>
                <JukeboxWindow 
                  queue={queue}
                  currentVideoIndex={currentVideoIndex}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                />
              </div>
              
              {/* Library Tab */}
              <div className={activeTab === 'library' ? 'block h-full' : 'hidden'}>
                <LibraryWindow />
              </div>
              
              {/* Settings Tab */}
              <div className={activeTab === 'settings' ? 'block h-full' : 'hidden'}>
                <SettingsWindow />
              </div>
            </TabContent>
            
            {/* Tab Navigation */}
            <TabList className="flex justify-center border-t border-gray-700 bg-gray-900 p-2">
              <Tab
                active={activeTab === 'jukebox'}
                onClick={() => setActiveTab('jukebox')}
                icon={<Music size={20} />}
                label="Jukebox"
              />
              <Tab
                active={activeTab === 'library'}
                onClick={() => setActiveTab('library')}
                icon={<Library size={20} />}
                label="Library"
              />
              <Tab
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
                icon={<Settings size={20} />}
                label="Settings"
              />
            </TabList>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
