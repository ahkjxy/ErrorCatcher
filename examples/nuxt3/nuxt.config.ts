export default defineNuxtConfig({
  plugins: ['~/plugins/error-catcher'],
  
  app: {
    head: {
      script: [
        {
          src: '/ErrorCatcher.js',
          type: 'text/javascript'
        }
      ]
    }
  },
  
  runtimeConfig: {
    public: {
      errorCatcher: {
        reportUrl: 'http://localhost:3001/api/errors/report',
        projectId: '69ae7968cc87edb222a665dc',
        apiKey: 'ec_a3f6bf3d2bf6378b8bf13ee9b1889fc3c2c42e5acbb55e27a8bda26cd3d17060',
        environment: 'development',
        debug: true
      }
    }
  },
  
  devServer: {
    port: 3033
  },
  
  devtools: { enabled: true }
});
