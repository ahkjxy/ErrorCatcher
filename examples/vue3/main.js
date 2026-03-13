import { createApp } from 'vue';
import { ErrorCatcherPlugin } from '../../adapters/vue3';
import App from './App.vue';

const app = createApp(App);

app.use(ErrorCatcherPlugin, {
  reportUrl: 'http://localhost:3001/api/errors/report',
  projectId: '69a69b5a6b650638ebe3d896',
  apiKey: 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37',
  environment: 'development',
  debug: true,
  sampleRate: 1,
  context: {
    version: '1.0.0'
  }
});

app.mount('#app');
