import { type AppCheck } from 'firebase/app-check';

declare global {
  interface Window {
    firebaseAppCheck: AppCheck;
  }
}