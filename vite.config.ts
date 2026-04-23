import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const proxyTarget = 'https://clinic-be-xdfd.onrender.com';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': { target: proxyTarget, changeOrigin: true, secure: true },
      '/users': { target: proxyTarget, changeOrigin: true, secure: true },
      '/doctors': { target: proxyTarget, changeOrigin: true, secure: true },
      '/doctor-services': { target: proxyTarget, changeOrigin: true, secure: true },
      '/doctor-work-schedules': { target: proxyTarget, changeOrigin: true, secure: true },
      '/services': { target: proxyTarget, changeOrigin: true, secure: true },
      '/service-categories': { target: proxyTarget, changeOrigin: true, secure: true },
      '/appointments': { target: proxyTarget, changeOrigin: true, secure: true },
      '/patients': { target: proxyTarget, changeOrigin: true, secure: true },
      '/medical-records': { target: proxyTarget, changeOrigin: true, secure: true },
      '/prescriptions': { target: proxyTarget, changeOrigin: true, secure: true },
      '/payment-discounts': { target: proxyTarget, changeOrigin: true, secure: true },
      '/statistics': { target: proxyTarget, changeOrigin: true, secure: true },
      '/blog-posts': { target: proxyTarget, changeOrigin: true, secure: true },
      '/notifications': { target: proxyTarget, changeOrigin: true, secure: true },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
