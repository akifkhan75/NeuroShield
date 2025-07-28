
# NeuroShield: Local Development Guide

This guide provides instructions on how to set up and run the NeuroShield application locally on both iOS and Android platforms. The application consists of a React Native frontend and a Node.js (Express) backend.

## Prerequisites

Ensure you have the following software installed on your system.

### General
- **Node.js**: LTS version (e.g., 18.x or newer) is recommended.
- **npm** or **Yarn**: For package management.
- **React Native CLI**: `npm install -g react-native-cli`
- **Watchman** (Recommended for macOS): `brew install watchman`

### For iOS Development
- **macOS**: Required to build and run iOS apps.
- **Xcode**: Install the latest version from the Mac App Store.
- **CocoaPods**: `sudo gem install cocoapods`

### For Android Development
- **Android Studio**: Install the latest version.
- **Java Development Kit (JDK)**: Version 11 or newer is recommended.
- **Android SDK & Emulator**: Set up via the Android Studio SDK Manager. Ensure you have at least one virtual device configured.

---

## Setup Instructions

Follow these steps to get the project running.

### 1. Install Frontend Dependencies

First, install the necessary npm packages for the React Native application.

```bash
# Navigate to the project's root directory
cd /path/to/your/project

# Install dependencies
npm install
```

### 2. Configure Backend Server

The backend server requires its own dependencies and an environment file for the API key.

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install server dependencies:**
    ```bash
    npm install express cors dotenv @google/genai ts-node typescript @types/express @types/cors
    ```

3.  **Create an environment file:**
    Create a new file named `.env` inside the `server` directory.

4.  **Add your Gemini API Key:**
    Open the `.env` file and add your Google Gemini API key. The file should contain:
    ```
    API_KEY=your_gemini_api_key_here
    ```
    Replace `your_gemini_api_key_here` with your actual key.

---

## Running the Application

To run the app, you must start both the backend server and the frontend client.

### Step 1: Start the Backend Server

The server handles API requests and communication with the Gemini AI service.

1.  **Open a terminal window.**
2.  **Navigate to the `server` directory.**
3.  **Run the server:**
    ```bash
    npx ts-node server.ts
    ```
4.  You should see the message `Server is running on http://localhost:3001`. **Keep this terminal window open.**

### Step 2: Run the React Native App

With the backend running, you can now launch the mobile app.

1.  **Open a new terminal window.**
2.  **Navigate to the project's root directory.**

#### For iOS

1.  **Install iOS Pods:**
    ```bash
    cd ios && pod install && cd ..
    ```
2.  **Run the app:**
    ```bash
    npm run ios
    # OR
    npx react-native run-ios
    ```
    This will build the app, install it on an iOS Simulator, and start the Metro bundler.

#### For Android

1.  **Start an Android Emulator:**
    Open Android Studio, go to the Virtual Device Manager, and start one of your emulators. Alternatively, connect a physical Android device with USB debugging enabled.

2.  **Run the app:**
    ```bash
    npm run android
    # OR
    npx react-native run-android
    ```
    This will build the app, install it on your emulator/device, and start the Metro bundler.

---

## Troubleshooting

- **"Could not connect to development server"**: Ensure the Metro bundler is running in its own terminal. You can start it manually with `npm start`. Also, ensure your device/emulator and computer are on the same Wi-Fi network.
- **Build fails**: Try clearing the cache: `npm start -- --reset-cache`.
- **Android Network Issues**: The app is configured to find the backend at `http://10.0.2.2:3001` on Android, which is the standard alias for your computer's `localhost` from the Android emulator. If you are using a physical device, you may need to use your computer's local network IP address instead.
- **Pods issue on M1/M2 Macs**: If `pod install` fails, you might need to run it via Rosetta: `arch -x86_64 pod install`.
