import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LibraryPlaylist, VideoItem, QueueItem } from '../types/playlist'
import { Settings, TabType } from '../types/settings'

interface JukeboxState {
  // Playlist Management
  playlists: LibraryPlaylist[]
  addPlaylist: (playlist: LibraryPlaylist) => void
  removePlaylist: (id: string) => boolean
  updatePlaylist: (id: string, updates: Partial<LibraryPlaylist>) => void
  setPlaylistVideos: (id: string, videos: VideoItem[]) => void
  
  // Queue Management
  queue: QueueItem[]
  currentVideoIndex: number
  isPlaying: boolean
  addToQueue: (video: VideoItem, playlistId: string) => boolean
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  nextVideo: () => void
  previousVideo: () => void
  setCurrentVideoIndex: (index: number) => void
  setIsPlaying: (isPlaying: boolean) => void
  
  // UI & Settings
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
}

// Initial settings
const defaultSettings: Settings = {
  defaultPlaylistId: null,
  randomPlay: false,
  aspectRatio: '16:9',
}

export const useJukeboxStore = create<JukeboxState>()(
  persist(
    (set, get) => ({
      // Initial Playlist State
      playlists: [],
      addPlaylist: (playlist) => set((state) => ({ 
        playlists: [...state.playlists, playlist] 
      })),
      removePlaylist: (id) => {
        const { playlists } = get()
        // Don't allow removing the last playlist
        if (playlists.length <= 1) {
          return false
        }
        
        set((state) => ({
          playlists: state.playlists.filter(p => p.id !== id),
          // If we're removing the default playlist, reset that setting
          settings: state.settings.defaultPlaylistId === id
            ? { ...state.settings, defaultPlaylistId: null }
            : state.settings
        }))
        return true
      },
      updatePlaylist: (id, updates) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      setPlaylistVideos: (id, videos) => set((state) => ({
        playlists: state.playlists.map(p => 
          p.id === id ? { ...p, videos, videoCount: videos.length } : p
        )
      })),
      
      // Initial Queue State
      queue: [],
      currentVideoIndex: -1,
      isPlaying: false,
      addToQueue: (video, playlistId) => {
        const { queue } = get()
        // Check for duplicates
        const isDuplicate = queue.some(item => item.youtubeId === video.youtubeId)
        
        if (!isDuplicate) {
          const queueItem: QueueItem = { ...video, playlistId }
          set((state) => ({
            queue: [...state.queue, queueItem],
            // If this is the first video, set the current index to 0
            currentVideoIndex: state.queue.length === 0 ? 0 : state.currentVideoIndex
          }))
          return true
        }
        return false
      },
      removeFromQueue: (index) => set((state) => {
        const newQueue = [...state.queue]
        newQueue.splice(index, 1)
        
        // Adjust currentVideoIndex if necessary
        let newIndex = state.currentVideoIndex
        if (index < state.currentVideoIndex) {
          // If removing a video before the current one, shift the index down
          newIndex = Math.max(0, state.currentVideoIndex - 1)
        } else if (index === state.currentVideoIndex) {
          // If removing the current video, don't change the index
          // (effectively skipping to the next video)
        }
        
        if (newQueue.length === 0) {
          newIndex = -1
        } else if (newIndex >= newQueue.length) {
          newIndex = 0
        }
        
        return {
          queue: newQueue,
          currentVideoIndex: newIndex,
          isPlaying: newQueue.length > 0 && state.isPlaying
        }
      }),
      clearQueue: () => set({ 
        queue: [], 
        currentVideoIndex: -1, 
        isPlaying: false 
      }),
      nextVideo: () => set((state) => {
        const { queue, currentVideoIndex, settings } = state
        
        if (queue.length === 0) {
          return { currentVideoIndex: -1, isPlaying: false }
        }
        
        let nextIndex
        if (settings.randomPlay) {
          // Random play logic
          nextIndex = Math.floor(Math.random() * queue.length)
        } else {
          // Sequential play logic
          nextIndex = (currentVideoIndex + 1) % queue.length
        }
        
        return { currentVideoIndex: nextIndex }
      }),
      previousVideo: () => set((state) => {
        const { queue, currentVideoIndex, settings } = state
        
        if (queue.length === 0) {
          return { currentVideoIndex: -1, isPlaying: false }
        }
        
        let prevIndex
        if (settings.randomPlay) {
          // Random play logic
          prevIndex = Math.floor(Math.random() * queue.length)
        } else {
          // Sequential play logic
          prevIndex = currentVideoIndex - 1
          if (prevIndex < 0) prevIndex = queue.length - 1
        }
        
        return { currentVideoIndex: prevIndex }
      }),
      setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      
      // Initial UI & Settings State
      activeTab: 'jukebox',
      setActiveTab: (tab) => set({ activeTab: tab }),
      settings: defaultSettings,
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),
      
      // Initial Search State
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'jukebox-storage',
      partialize: (state) => ({
        playlists: state.playlists,
        queue: state.queue,
        settings: state.settings,
      }),
    }
  )
)
