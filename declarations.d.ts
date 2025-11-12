declare module 'react-zlib-js';

import { AppCheck } from 'firebase/app-check';

declare global {
  interface Window {
    firebaseAppCheck: AppCheck;
  }
}