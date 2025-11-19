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
- AI Explain: Get explanations of PlantUML diagrams using AI
- AI Optimize: Optimize PlantUML code using AI

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

- **Expo Router** - File-based routing
- **React Native** - Mobile framework
- **Nativewind** - Tailwind CSS for React Native
- **React Native Reusables** - UI component library
- **React Native Reanimated** - Animation library
- **Axios** - HTTP client
- **i18next** - Internationalization (supports English and Vietnamese)
- **Expo File System** - File operations
- **Expo Clipboard** - Clipboard access
- **Expo Media Library** - Media library access
- **React Native WebView** - WebView component
- **React Native Image Viewing** - Image viewing with zoom
- **React Native QR Code SVG** - QR code generation

## API

The app connects to the PUML Render Server API. The default API URL is `http://localhost:7235` (can be overridden with `EXPO_PUBLIC_API_URL` environment variable). The API URL can be configured in Settings.

**PUML Server Repository**: [https://github.com/mewisme/puml-server](https://github.com/mewisme/puml-server)

You can run the PUML server locally and configure the app to use it instead of the default server. This is useful for:
- Custom PlantUML configurations
- Offline development
- Testing new features
- Privacy-sensitive workflows

### Endpoints used:
- `POST /api/v1/render/{type}` - Render PUML to specified format (png, svg, text)
- `GET /api/v1/render/{type}/{id}/raw` - Get rendered content
- `POST /api/v1/puml` - Create new PUML entry and get ID
- `GET /api/v1/puml/{id}` - Get PUML code by ID
- `POST /api/v1/puml/generate` - Generate PUML diagram using AI
- `POST /api/v1/puml/explain` - Explain PUML diagram using AI
- `POST /api/v1/puml/optimize` - Optimize PUML code using AI

## Internationalization

The app supports multiple languages:
- English (en)
- Vietnamese (vi)

The language is automatically detected from device settings, but can be changed in Settings.

## License

MIT License - Copyright (c) 2025 Mew

See [LICENSE](LICENSE) for more information.
