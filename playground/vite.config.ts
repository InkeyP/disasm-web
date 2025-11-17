/* eslint-disable import/no-extraneous-dependencies */
import path from 'path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VitePWA } from 'vite-plugin-pwa'
import Unocss from 'unocss/vite'
import { presetIcons, presetWind } from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import url from '@rollup/plugin-url'
import fs from 'fs'

export default defineConfig({
  base: './',
  build: {
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      external: ['module'],
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        manualChunks: {
          capstone: ['capstone-wasm'],
          keystone: ['keystone-wasm'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['capstone-wasm', 'keystone-wasm'],
  },
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      'capstone-wasm/dist/capstone.wasm': path.resolve(__dirname, '../node_modules/capstone-wasm/dist/capstone.wasm'),
      'keystone-wasm/dist/keystone.wasm': path.resolve(__dirname, '../node_modules/keystone-wasm/dist/keystone.wasm'),
    },
  },
  plugins: [
    {
      name: 'inline-wasm-as-data-uri',
      enforce: 'pre',
      load(id) {
        if (id.endsWith('capstone.wasm') || id.endsWith('keystone.wasm')) {
          const data = fs.readFileSync(id)
          const base64 = data.toString('base64')
          return `export default "data:application/wasm;base64,${base64}";`
        }
        return null
      },
    },
    Vue(),
    Components({
      dts: true,
    }),
    Unocss({
      presets: [
        presetWind(),
        presetIcons({
          extraProperties: {
            color: 'currentColor',
          },
        }),
      ],
      transformers: [
        transformerVariantGroup(),
      ],
    }),
    url({
      include: ['**/*.wasm'],
      limit: Infinity,
    }),
    VitePWA({
      manifest: false,
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: [
          '**/*.{js,css,html,png,jpg,jpeg,svg,ico,json,wasm}',
        ],
      },
    }),
  ],
})
