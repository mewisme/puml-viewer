# PUML Viewer

A React Native application for viewing PlantUML diagrams. Built with Expo and React Native Reusables.

## Features

- Render PlantUML diagrams to PNG, SVG, and Text formats
- Preview rendered diagrams directly in the app
- Download PNG images to device gallery (saved in "PUML Viewer" album)
- View raw content in browser
- Zoom and pan PNG images
- Paste PUML code from clipboard
- Auto render: Automatically render PUML code after 300ms of inactivity when format is valid
- Dark/Light theme support
- History management: Save and manage rendered diagrams
- Favorites: Mark diagrams as favorites for quick access
- Search and filter: Search history by content, filter by render type (PNG/SVG/Text)
- Statistics dashboard: View total renders, renders by type, and number of favorites
- QR code generation: Generate QR codes for diagrams with deeplink support
- Deeplink support: Open diagrams directly via `pv://` deeplinks (or `exp://` in development)
- Settings: Configure API URL, theme preferences, and AI settings
- Title editing: Add custom titles to history items
- Copy diagram code: Copy PUML code from history items
- AI Assistant: Generate PlantUML diagrams using AI with support for multiple providers (OpenAI, Google, MegaLLM, Custom)

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
    ai.tsx           # AI Assistant screen - generate PUML diagrams using AI
    history.tsx      # History screen - manage saved diagrams
    settings.tsx     # Settings screen - configure API URL, theme, and AI settings
    about.tsx        # About screen - app information
  puml/
    [id].tsx         # Deeplink handler for PUML diagrams
components/
  ui/                # UI components
  qr-code-modal.tsx  # QR code modal component
lib/
  app-config.ts      # App configuration
  api-client.ts      # Axios API client configuration
  history-context.tsx # History management context
  settings-context.tsx # Settings management context
  deeplink-utils.ts  # Deeplink utilities
```

## Technologies

- Expo Router
- React Native
- Nativewind (Tailwind CSS)
- React Native Reusables
- React Native Reanimated
- Axios
- Expo File System
- Expo Clipboard
- Expo Media Library
- React Native WebView
- React Native Image Viewing

## API

The app connects to the PUML Render Server API (default: `https://spuml.mewis.me`). The API URL can be configured in Settings.

**PUML Server Repository**: [https://github.com/mewisme/puml-server](https://github.com/mewisme/puml-server)

You can run the PUML server locally and configure the app to use it instead of the default server. This is useful for:
- Custom PlantUML configurations
- Offline development
- Testing new features
- Privacy-sensitive workflows

Endpoints used:
- POST `/api/v1/render/{type}` - Render PUML to specified format
- GET `/api/v1/render/{type}/{id}/raw` - Get rendered content
- POST `/api/v1/puml` - Create new PUML entry and get ID
- GET `/api/v1/puml/{id}` - Get PUML code by ID
- POST `/api/v1/puml/generate` - Generate PUML diagram using AI

## License

MIT License - Copyright (c) 2025 Mew

See [LICENSE](LICENSE) for more information.
