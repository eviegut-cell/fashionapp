# Mi Moda

A fashion community app for sharing outfit photos, collecting quick Love or Pass votes, and discussing styling ideas. Built with Expo and React Native for iOS, Android, and web.

## Highlights

- Separate quick-vote and discussion feeds
- Photo-first outfit posts with occasion categories
- One-choice Love or Pass voting with visible totals
- Account screens backed by a Supabase auth service layer
- Content checks for explicit and harmful language
- Responsive preview through Expo for web

## Tech Stack

- Expo SDK 58, React Native 0.88, React 19, TypeScript
- Supabase client and SecureStore session persistence
- Vitest unit tests

## Run Locally

```bash
npm install
npx expo start
```

Press `w` to open the web preview, or scan the terminal QR code with Expo Go on a phone connected to the same network.

## Checks

```bash
npx expo-doctor
npx tsc --noEmit
npm test
```

## Project Status

The UI and local interaction flows are implemented. Supabase auth and database schema scaffolding are included, but live accounts and persisted community content require configuring a Supabase project and its environment variables. Moderation currently provides client-side text checks and should be paired with server-side enforcement before public launch.

## Repository

[Mi Moda on GitHub](https://github.com/eviegut-cell/fashionapp)