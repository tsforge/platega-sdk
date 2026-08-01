import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Only source specs: compiled copies in build/ must never be picked up
        include: ['src/**/*.spec.ts'],
    },
});
