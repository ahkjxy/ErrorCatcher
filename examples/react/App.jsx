import React from 'react';
import { ErrorBoundary, useErrorTracker } from '../../adapters/react';

function TestComponent() {
  const tracker = useErrorTracker();
  
  const triggerError = () => {
    throw new Error('Test error from React component');
  };
  
  const triggerApiError = async () => {
    try {
      await fetch('http://localhost:3001/api/test-error');
    } catch (error) {
      tracker.report(error, {
        component: 'TestComponent',
        action: 'triggerApiError'
      });
    }
  };
  
  return (
    <div>
      <h1>React ErrorCatcher Example</h1>
      <button onClick={triggerError}>触发组件错误</button>
      <button onClick={triggerApiError}>触发API错误</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      reportUrl="http://localhost:3001/api/errors/report"
      projectId="69a69b5a6b650638ebe3d896"
      apiKey="ec_af9d006b050643d3bd21b39984a4a8172557279feac2d4e95005dfc997ecdf37"
      environment="development"
      debug={true}
      fallback={<div>出错了，请刷新页面</div>}
    >
      <TestComponent />
    </ErrorBoundary>
  );
}

export default App;
