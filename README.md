# Kassette Player

Kassette Player is a cassette-styled music player built with React and ElectronJS.

![Kassette Player Logo](https://github.com/CMDRKTM/KassettePlayer/assets/123240001/b9193409-3013-46a6-8835-a60003694b57)

## Features
- Import and enjoy your albums in seemless cassette-styled play. No swapping songs, only fastf and reverse.
- Enjoy the aesthetics of cassette, and more importantly- enjoy albums in the way intended.

## Installation

### Windows
- Download the installer or portable version from the [Windows Version Releases](https://github.com/CMDRKTM/KassettePlayer/releases).

### MacOS
- Download the DMG file from the [MacOS Version Releases](https://github.com/CMDRKTM/KassettePlayer/releases).
- Since the release is currently unsigned, follow these steps after downloading:
  
  **MacOS Install Instructions:**
  1. Open the DMG file and drag the application icon into the Applications folder.
  2. Open the system terminal and execute the following command:
     ```
     sudo xattr -r -d com.apple.quarantine /Applications/KassettePlayer.app
     ```
     Replace `/Applications/KassettePlayer.app` with the actual path to your application if it's different.

## Building from Source

### Prerequisites
- Node.js installed.

### Build Instructions
1. Clone the repository:
   ```
   git clone https://github.com/CMDRKTM/KassettePlayer.git
   cd KassettePlayer
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Build the application:
   ```
   npm run build
   ```
   Modify `package.json` to add `--mac` or `--win` flags for building specific versions.

## License

This project is licensed under the [MIT License](LICENSE).
