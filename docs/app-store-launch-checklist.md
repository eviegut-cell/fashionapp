# Mi Moda App Store launch checklist

## 1. Production configuration
- Fill in the Expo app identity in app.json
- Set a real bundle identifier and package name
- Configure production app metadata and privacy disclosures
- Ensure the app icon and splash assets are production-ready

## 2. Backend foundation
- Create a Supabase project
- Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env
- Add actual auth tables for users, posts, comments, and votes
- Add storage buckets for outfit photos and thread images
- Add RLS policies for safe, moderated data access

## 3. Safety and moderation
- Add automated moderation on post creation
- Add user reporting flow
- Block nudity and harmful words before publishing
- Add content review workflow for sensitive cases

## 4. App validation
- Run npm install
- Run npm run doctor
- Test on iOS and Android simulators
- Validate performance and scrolling on mid-range devices
- Check camera/photo library permission flow

## 5. Build and submission
- Run npx expo login
- Run eas build --platform ios
- Run eas build --platform android
- Submit to TestFlight and Google Play internal / closed testing
- Complete App Store Connect and Play Console metadata
- Submit the production release after final QA

## 6. Launch readiness
- Privacy policy and terms page
- Email support contact
- Community guidelines
- Crash reporting and analytics
- App review checklist signed off before public launch
