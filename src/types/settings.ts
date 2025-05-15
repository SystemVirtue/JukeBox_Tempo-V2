export type AspectRatio = '4:3' | '16:9'

export interface Settings {
  defaultPlaylistId: string | null
  randomPlay: boolean
  aspectRatio: AspectRatio
}

export type TabType = 'jukebox' | 'library' | 'settings'
