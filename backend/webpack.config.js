const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@middleware': path.resolve(__dirname, 'src/middleware'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@db': path.resolve(__dirname, 'src/db')
    }
  }
}; 