export interface ErrorCatcherConfig {
  // Required
  reportUrl: string;
  projectId?: string;
  
  // Optional - Basic
  apiKey?: string;
  environment?: string;
  release?: string;
  
  // Optional - Sampling & Performance
  sampleRate?: number;
  maxBatchSize?: number;
  delay?: number;
  maxRetries?: number;
  
  // Optional - Features
  debug?: boolean;
  autoStart?: boolean;
  autoIntegrate?: boolean;
  
  // Optional - Framework Integration
  vue?: any;
  react?: boolean;
  axios?: any;
  jquery?: boolean;
  router?: any;
  
  // Optional - Filtering
  ignoreUrls?: (string | RegExp)[];
  
  // Optional - Callbacks
  beforeSend?: (error: any) => any | false;
  onError?: (error: any) => void;
  
  // Optional - SSR
  fetch?: any;
  
  // Deprecated (for backward compatibility)
  dsn?: string;
  appName?: string;
  userId?: string;
  context?: Record<string, any>;
}

export interface UserInfo {
  id?: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

export interface Breadcrumb {
  category?: string;
  message?: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  data?: Record<string, any>;
  timestamp?: number;
}

export interface ReportContext {
  type?: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  pageUrl?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  contexts?: Record<string, any>;
  [key: string]: any;
}

export interface ErrorData {
  type: string;
  status?: number;
  statusText?: string;
  url?: string;
  method?: string;
  message?: string;
  stack?: string;
  timestamp: string;
  pageUrl?: string;
  userAgent?: string;
  projectId?: string;
  apiKey?: string;
  environment?: string;
  release?: string;
  user?: UserInfo;
  tags?: Record<string, string>;
  contexts?: Record<string, any>;
  extra?: Record<string, any>;
  breadcrumbs?: Breadcrumb[];
  [key: string]: any;
}

export class ErrorCatcher {
  constructor(config: ErrorCatcherConfig);
  
  // Core Methods
  init(): void;
  destroy(): void;
  report(error: Error, context?: ReportContext): void;
  
  // User Management
  setUser(user: UserInfo): void;
  
  // Tags Management
  setTag(key: string, value: string): void;
  setTags(tags: Record<string, string>): void;
  
  // Context Management
  setContext(key: string, value: any): void;
  
  // Extra Data
  setExtra(key: string, value: any): void;
  
  // Breadcrumbs
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  
  // Internal Properties (read-only)
  readonly config: ErrorCatcherConfig;
  readonly initialized: boolean;
  readonly isServer: boolean;
  readonly isBrowser: boolean;
}

export function initErrorTracker(config: ErrorCatcherConfig): ErrorCatcher;

export default ErrorCatcher;
