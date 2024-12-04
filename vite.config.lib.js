const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'ReactNotificationsLibrary',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react-markdown', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-markdown': 'ReactMarkdown',
          'lucide-react': 'LucideReact'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css';
          return assetInfo.name;
        }
      }
    },
    sourcemap: true,
    minify: 'terser',
    cssCodeSplit: false
  }
});
