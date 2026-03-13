import { useEffect } from 'react';
import { ErrorCatcherApp } from '../../../adapters/nextjs';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    ErrorCatcherApp.init({
      reportUrl: 'http://localhost:3001/api/errors/report',
      projectId: '69a69b5a6b650638ebe3d896',
      apiKey: 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37',
      environment: 'development',
      debug: true
    });
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
