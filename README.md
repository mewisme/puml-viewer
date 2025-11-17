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
  index.tsx          # Main screen
components/
  ui/                # UI components
lib/
  utils.ts           # Utility functions
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

The app connects to the PUML Render Server API at `https://spuml.mewis.me`.

Endpoints used:
- POST `/api/v1/render/{type}` - Render PUML to specified format
- GET `/api/v1/render/{type}/{id}/raw` - Get rendered content

## License

Private
