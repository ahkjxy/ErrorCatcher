// MongoDB 初始化脚本
// 此脚本在 MongoDB 容器首次启动时自动执行

// 切换到应用数据库
db = db.getSiblingDB('error-catcher');

// 创建应用用户
db.createUser({
  user: 'admin',
  pwd: process.env.DB_PASSWORD || 'password123',
  roles: [
    {
      role: 'readWrite',
      db: 'error-catcher'
    },
    {
      role: 'dbAdmin',
      db: 'error-catcher'
    }
  ]
});

print('✅ 用户创建成功: error_catcher_user');

// 创建集合
db.createCollection('users');
db.createCollection('user_settings');
db.createCollection('projects');
db.createCollection('project_members');
db.createCollection('teams');
db.createCollection('team_members');
db.createCollection('errors');
db.createCollection('error_analyses');
db.createCollection('issues');
db.createCollection('alerts');
db.createCollection('alert_history');
db.createCollection('notification_configs');
db.createCollection('notification_templates');
db.createCollection('ai_configs');
db.createCollection('api_tokens');
db.createCollection('comments');
db.createCollection('activities');

print('✅ 集合创建成功');

// 创建索引
// users 集合
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });
db.users.createIndex({ createdAt: -1 });

// user_settings 集合
db.user_settings.createIndex({ userId: 1 }, { unique: true });

// projects 集合
db.projects.createIndex({ apiKey: 1 }, { unique: true });
db.projects.createIndex({ owner: 1 });
db.projects.createIndex({ status: 1 });
db.projects.createIndex({ platform: 1 });
db.projects.createIndex({ environment: 1 });
db.projects.createIndex({ createdAt: -1 });

// project_members 集合
db.project_members.createIndex({ userId: 1, projectId: 1 }, { unique: true });
db.project_members.createIndex({ projectId: 1 });
db.project_members.createIndex({ userId: 1 });
db.project_members.createIndex({ role: 1 });

// teams 集合
db.teams.createIndex({ name: 1 }, { unique: true });
db.teams.createIndex({ owner: 1 });
db.teams.createIndex({ createdAt: -1 });

// team_members 集合
db.team_members.createIndex({ userId: 1, teamId: 1 }, { unique: true });
db.team_members.createIndex({ teamId: 1 });
db.team_members.createIndex({ userId: 1 });
db.team_members.createIndex({ role: 1 });

// errors 集合（重要）
db.errors.createIndex({ projectId: 1, timestamp: -1 });
db.errors.createIndex({ issueId: 1 });
db.errors.createIndex({ resolved: 1 });
db.errors.createIndex({ projectId: 1, resolved: 1, timestamp: -1 });
db.errors.createIndex({ type: 1 });
db.errors.createIndex({ level: 1 });
db.errors.createIndex({ environment: 1 });
db.errors.createIndex({ fingerprint: 1 });
db.errors.createIndex({ 'user.id': 1 });
db.errors.createIndex({ createdAt: -1 });
db.errors.createIndex({ projectId: 1, createdAt: -1 });

// error_analyses 集合（AI 分析）
db.error_analyses.createIndex({ errorId: 1 }, { unique: true });
db.error_analyses.createIndex({ projectId: 1, analyzedAt: -1 });
db.error_analyses.createIndex({ category: 1 });
db.error_analyses.createIndex({ confidence: -1 });
db.error_analyses.createIndex({ success: 1 });
db.error_analyses.createIndex({ model: 1 });

// issues 集合（重要）
db.issues.createIndex({ projectId: 1, status: 1 });
db.issues.createIndex({ fingerprint: 1 }, { unique: true });
db.issues.createIndex({ projectId: 1, lastSeen: -1 });
db.issues.createIndex({ projectId: 1, count: -1 });
db.issues.createIndex({ assignee: 1 });
db.issues.createIndex({ status: 1 });
db.issues.createIndex({ level: 1 });
db.issues.createIndex({ environment: 1 });

// alerts 集合
db.alerts.createIndex({ projectId: 1 });
db.alerts.createIndex({ enabled: 1 });
db.alerts.createIndex({ type: 1 });
db.alerts.createIndex({ priority: 1 });

// alert_history 集合
db.alert_history.createIndex({ alertId: 1, triggeredAt: -1 });
db.alert_history.createIndex({ projectId: 1, triggeredAt: -1 });
db.alert_history.createIndex({ status: 1 });

// notification_configs 集合
db.notification_configs.createIndex({ projectId: 1 });
db.notification_configs.createIndex({ type: 1 });
db.notification_configs.createIndex({ enabled: 1 });

// notification_templates 集合
db.notification_templates.createIndex({ projectId: 1 });
db.notification_templates.createIndex({ type: 1 });

// ai_configs 集合（AI 配置）
db.ai_configs.createIndex({ configType: 1 }, { unique: true });
db.ai_configs.createIndex({ provider: 1 });
db.ai_configs.createIndex({ enabled: 1 });
db.ai_configs.createIndex({ updatedAt: -1 });

// api_tokens 集合
db.api_tokens.createIndex({ token: 1 }, { unique: true });
db.api_tokens.createIndex({ projectId: 1 });
db.api_tokens.createIndex({ userId: 1 });
db.api_tokens.createIndex({ status: 1 });
db.api_tokens.createIndex({ expiresAt: 1 });

// comments 集合
db.comments.createIndex({ issueId: 1, createdAt: -1 });
db.comments.createIndex({ userId: 1 });
db.comments.createIndex({ projectId: 1 });

// activities 集合
db.activities.createIndex({ projectId: 1, createdAt: -1 });
db.activities.createIndex({ userId: 1, createdAt: -1 });
db.activities.createIndex({ type: 1 });
db.activities.createIndex({ targetType: 1, targetId: 1 });

print('✅ 索引创建成功');

// 创建 TTL 索引（自动删除过期数据）
// API Tokens - 过期后自动删除
db.api_tokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Alert History - 保留 90 天
db.alert_history.createIndex({ triggeredAt: 1 }, { expireAfterSeconds: 7776000 });

// Activities - 保留 180 天
db.activities.createIndex({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

print('✅ TTL 索引创建成功');

print('🎉 MongoDB 初始化完成！');
print('📊 已创建 17 个集合');
print('🔍 已创建 60+ 个索引');
print('⏰ 已配置 3 个 TTL 索引');

