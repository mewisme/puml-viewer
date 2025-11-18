# PUML Viewer

A React Native application for viewing PlantUML diagrams. Built with Expo and React Native Reusables.

## Features

- Render PlantUML diagrams to PNG, SVG, and Text formats
- Preview rendered diagrams directly in the app
- Download PNG images
- View raw content in browser
- Zoom and pan PNG images
- Paste PUML code from clipboard
- Dark/Light theme support
- History management: Save and manage rendered diagrams
- Favorites: Mark diagrams as favorites for quick access
- Search and filter: Search history by content, filter by render type (PNG/SVG/Text)
- Statistics dashboard: View total renders, renders by type, and number of favorites
- QR code generation: Generate QR codes for diagrams with deeplink support
- Deeplink support: Open diagrams directly via `pv://` deeplinks
- Settings: Configure API URL and theme preferences
- Title editing: Add custom titles to history items
- Copy diagram code: Copy PUML code from history items

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Then press:
- `i` for iOS simulator (Mac only)
- `a` for Android emulator
- `w` for web browser

You can also scan the QR code with Expo Go app on your device.

## Project Structure

```
app/
  (tabs)/
    index.tsx        # Home screen - render PUML diagrams
    history.tsx      # History screen - manage saved diagrams
    settings.tsx      # Settings screen - configure API URL and theme
    about.tsx         # About screen - app information
  puml/
    [id].tsx         # Deeplink handler for PUML diagrams
components/
  ui/                # UI components
lib/
  app-config.ts      # App configuration
  history-context.tsx # History management context
  settings-context.tsx # Settings management context
  deeplink-utils.ts  # Deeplink utilities
```

## Technologies

- Expo Router
- React Native
- Nativewind (Tailwind CSS)
- React Native Reusables
- Expo File System
- Expo Clipboard
- React Native WebView
- React Native Image Viewing

## API

The app connects to the PUML Render Server API (default: `https://spuml.mewis.me`). The API URL can be configured in Settings.

Endpoints used:
- POST `/api/v1/render/{type}` - Render PUML to specified format
- GET `/api/v1/render/{type}/{id}/raw` - Get rendered content
- POST `/api/v1/puml` - Create new PUML entry and get ID
- GET `/api/v1/puml/{id}` - Get PUML code by ID

## License

Private
