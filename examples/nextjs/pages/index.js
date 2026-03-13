import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [errorCount, setErrorCount] = useState(0);

  const triggerJsError = () => {
    throw new Error('这是一个测试 JS 错误');
  };

  const triggerPromiseError = () => {
    Promise.reject(new Error('这是一个测试 Promise 错误'));
  };

  const triggerApiError = async () => {
    try {
      await fetch('http://localhost:3001/api/not-found');
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const manualReport = () => {
    if (typeof window !== 'undefined' && window.ErrorCatcherApp) {
      const tracker = window.ErrorCatcherApp.init({
        reportUrl: 'http://localhost:3001/api/errors/report',
        projectId: '69a69b5a6b650638ebe3d896',
        apiKey: 'ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37'
      });
      tracker?.report(new Error('手动上报的错误'), {
        page: 'index',
        action: 'manualReport'
      });
      setErrorCount(errorCount + 1);
      alert('错误已手动上报！');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Next.js ErrorCatcher Example</h1>
      
      <div className={styles.info}>
        <p>这个示例展示了如何在 Next.js 项目中使用 ErrorCatcher。</p>
        <p>打开浏览器控制台查看错误捕获日志。</p>
      </div>

      <div className={styles.buttons}>
        <button onClick={triggerJsError}>触发 JS 错误</button>
        <button onClick={triggerPromiseError}>触发 Promise 错误</button>
        <button onClick={triggerApiError}>触发 API 错误</button>
        <button onClick={manualReport}>手动上报</button>
      </div>

      <div className={styles.status}>
        <p>错误已捕获: {errorCount}</p>
      </div>
    </div>
  );
}
