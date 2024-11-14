import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
  console.info(`*** Running in ${mode} mode ***`);

  return {
    plugins: [
      react(),
      basicSsl(),
      checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        },
        overlay: {
          initialIsOpen: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': '/src',
        src: '/src',
      },
    },
    server: {
      port: 8080,
    },
    build: {
      outDir: 'out',
    },
    base: '/',
  };
});
