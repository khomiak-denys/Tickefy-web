import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { randomUUID } from 'crypto';

setupZoneTestEnv();

// jsdom doesn't provide crypto.randomUUID — polyfill it from Node's crypto module
if (typeof globalThis.crypto.randomUUID !== 'function') {
  globalThis.crypto.randomUUID = randomUUID;
}
