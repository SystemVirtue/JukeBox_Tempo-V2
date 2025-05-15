# JukeBox Tempo V2

A retro arcade-style jukebox application for YouTube videos, built with React, TypeScript, and Vite.

## Features

- **Skeuomorphic UI**: Retro arcade-machine inspired interface with responsive design
- **YouTube Integration**: Add and manage multiple YouTube playlists
- **Video Queue**: Add videos to a playback queue with duplicate detection
- **Category Filtering**: Filter videos by category
- **Search**: Search across all your playlists
- **Aspect Ratio Toggle**: Switch between 4:3 and 16:9 display modes
- **Responsive Layout**: Properly scaled thumbnails and grid layout

## Tech Stack

- **React 18** with **TypeScript**
- **Vite** for fast development and optimized production builds
- **Zustand** for state management
- **React Query** for data fetching and caching
- **TailwindCSS** for styling
- **Express.js** for production server

## Getting Started

### Prerequisites

- Node.js 18 or higher
- YouTube Data API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/JukeBox_Tempo-V2.git
cd JukeBox_Tempo-V2
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory and add your YouTube API key
```
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
```

4. Start the development server
```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```

## Deployment

This project is configured for deployment on Render.com. See `render.yaml` for configuration details.

## UI Features

- **Red Border Container**: A 4mm thick red border container with rounded corners frames the main UI
- **Wider Thumbnails**: 1.8:1 aspect ratio thumbnails for better music video previews
- **Categories Footer**: Categories positioned in a footer below the video grid
- **Adaptive Layout**: 
  - 4:3 ratio: 6 columns × 4 rows (24 thumbnails)
  - 16:9 ratio: 8 columns × 4 rows (32 thumbnails)

## License

MIT
