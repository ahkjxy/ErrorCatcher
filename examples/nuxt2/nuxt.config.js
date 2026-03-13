export default {
  plugins: [
    { src: '../../plugins/nuxt2.client.js', mode: 'client' },
    { src: '../../plugins/nuxt2.server.js', mode: 'server' }
  ],

  publicRuntimeConfig: {
    errorCatcher: {
      reportUrl: 'http://localhost:3001/api/errors/report',
      projectId: '69a69b5a6b650638ebe3d896',
      apiKey: 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37',
      environment: 'development',
      debug: true
    }
  },

  build: {
    transpile: ['error-catcher']
  }
};
