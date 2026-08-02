# Sumedha Infra - SOP Mobile App

React Native (Expo) app that connects to the same Next.js backend.

## Setup

```bash
cd sop-mobile
npm install
```

## Run

```bash
npx expo start
```

Scan QR code with Expo Go app on your phone.

## Build for Stores

```bash
npx eas build --platform ios
npx eas build --platform android
```

## Backend

Uses the same `sop-platform` Next.js backend. Update `src/config.ts` with your backend URL.

## Test Accounts

Same as web: `ankit@sumedhainfra.com` / `admin123`
