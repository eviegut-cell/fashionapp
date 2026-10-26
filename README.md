# Mi Moda

A luxe, RHODE-inspired fashion social app concept built with Expo and React Native.

## Features

- Photo-first outfit posting with a visible upload flow
- Quick-vote feed with Love and Pass reactions
- Discussion thread feed for deeper styling conversations
- Profile creation and sign-in flow
- Moderation guardrails to block nudity and harmful language before posting
- A warm, tactile editorial aesthetic for a premium fashion audience

## Run locally

1. Install dependencies:
   npm install
2. Start the app:
   npm start
3. Open the Expo dev tools or use a simulator/emulator to preview the app.

## Production readiness foundation

This project now includes the app-store release foundation for Expo projects:

- release app config in app.json
- EAS build profiles in eas.json
- environment variable template for Supabase and backend config
- secure storage setup for auth/session persistence
- moderation utility for content safety checks
- start of a backend-ready architecture for authentication and data storage

## Required next steps before App Store submission

1. Create a Supabase project and add your credentials to .env
2. Run npm install and npm run doctor
3. Create an Expo account and initialize EAS with eas login
4. Configure projectId in app.json or via eas build
5. Build with eas build --platform ios and eas build --platform android
6. Submit through App Store Connect / Google Play

## Included screens

- Quick feed: fast outfit reactions and photo voting
- Thread feed: outfit advice and community discussion
- Profile: account creation, sign-in, and sign-out
- Safety filters: automatic moderation for explicit or harmful content

## Notes

This is still a front-end prototype with backend-ready scaffolding. For true production publishing, connect a real auth + database backend, add moderation and storage, then build with EAS before App Store submission.
