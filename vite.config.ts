import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
const isDev = process.env.NODE_ENV !== 'production';
console.log(isDev);
console.log(process.env.NODE_ENV);
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],

    // server: {
    //     host: true,
    //     port: 5173,
    //     strictPort: true,
    //     watch: {
    //         ignored: ['**/vendor/**', '**/node_modules/**'],
    //     },
    // },

    // server: {
    //     host: '0.0.0.0',
    //     port: 5173,
    //     strictPort: true,
    //     hmr: {
    //         host: 'localhost',
    //         port: 5173,
    //     },
    //     watch: {
    //         ignored: ['**/vendor/**', '**/node_modules/**'],
    //     },
    // },

    server: isDev
        ? {
              host: true,
              port: 5173,
              strictPort: true,
              hmr: {
                  host: 'localhost',
                  port: 5173,
                  protocol: 'ws',
              },
              watch: {
                  ignored: ['**/vendor/**', '**/node_modules/**'],
              },
          }
        : undefined,

    esbuild: {
        jsx: 'automatic',
    },
});
