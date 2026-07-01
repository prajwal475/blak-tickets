import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: Number(process.env.PORT) || 5173, host: true },
  // Keep a single React instance so @react-three/fiber's renderer shares it
  // (otherwise <Canvas> throws "Invalid hook call / more than one copy of React").
  resolve: { dedupe: ['react', 'react-dom'] },
  optimizeDeps: { include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'] },
})
