import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import envConfig from '@/config/env';

const socket = ref(null);
const connected = ref(false);
const reconnecting = ref(false);

export function useRealtime() {
  const connect = () => {
    if (socket.value) {
      console.log('⚠️ Socket already exists, skipping connection');
      return;
    }

    const wsUrl = envConfig.wsUrl;
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    console.log('📦 Environment:', envConfig.env);
    
    socket.value = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 10000
    });

    socket.value.on('connect', () => {
      console.log('✅ WebSocket connected, ID:', socket.value.id);
      connected.value = true;
      reconnecting.value = false;
    });

    socket.value.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected, reason:', reason);
      connected.value = false;
    });

    socket.value.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      connected.value = false;
    });

    socket.value.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}...`);
      reconnecting.value = true;
    });

    socket.value.on('reconnect', (attemptNumber) => {
      console.log(`✅ WebSocket reconnected after ${attemptNumber} attempts`);
      connected.value = true;
      reconnecting.value = false;
    });

    socket.value.on('reconnect_failed', () => {
      console.log('❌ WebSocket reconnection failed after all attempts');
      reconnecting.value = false;
    });
  };

  const disconnect = () => {
    if (socket.value) {
      console.log('🔌 Disconnecting WebSocket...');
      socket.value.disconnect();
      socket.value = null;
      connected.value = false;
    }
  };

  const subscribeToProject = (projectId) => {
    if (socket.value && connected.value) {
      console.log('📡 Subscribing to project:', projectId);
      socket.value.emit('subscribe:project', projectId);
    } else {
      console.warn('⚠️ Cannot subscribe: socket not connected');
    }
  };

  const unsubscribeFromProject = (projectId) => {
    if (socket.value && connected.value) {
      console.log('📡 Unsubscribing from project:', projectId);
      socket.value.emit('unsubscribe:project', projectId);
    }
  };

  const subscribeToAll = () => {
    if (socket.value && connected.value) {
      console.log('📡 Subscribing to all updates');
      socket.value.emit('subscribe:all');
    } else {
      console.warn('⚠️ Cannot subscribe to all: socket not connected');
    }
  };

  const onNewError = (callback) => {
    if (socket.value) {
      socket.value.on('new-error', callback);
    }
  };

  const onNewIssue = (callback) => {
    if (socket.value) {
      socket.value.on('new-issue', callback);
    }
  };

  const onStatsUpdate = (callback) => {
    if (socket.value) {
      socket.value.on('stats-update', callback);
    }
  };

  const offNewError = (callback) => {
    if (socket.value) {
      socket.value.off('new-error', callback);
    }
  };

  const offNewIssue = (callback) => {
    if (socket.value) {
      socket.value.off('new-issue', callback);
    }
  };

  const offStatsUpdate = (callback) => {
    if (socket.value) {
      socket.value.off('stats-update', callback);
    }
  };

  return {
    socket,
    connected,
    reconnecting,
    connect,
    disconnect,
    subscribeToProject,
    unsubscribeFromProject,
    subscribeToAll,
    onNewError,
    onNewIssue,
    onStatsUpdate,
    offNewError,
    offNewIssue,
    offStatsUpdate
  };
}

// 全局实例（单例模式）
let globalRealtime = null;

export function useGlobalRealtime() {
  if (!globalRealtime) {
    console.log('🌐 Creating global realtime instance');
    globalRealtime = useRealtime();
    globalRealtime.connect();
  }
  return globalRealtime;
}
