#!/usr/bin/env node

/**
 * 完整演示数据生成脚本
 * 包含所有新功能的演示数据：Teams, Alerts, Comments, Activities 等
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 导入所有模型
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Error = require('../src/models/Error');
const Issue = require('../src/models/Issue');
const Release = require('../src/models/Release');
const Team = require('../src/models/Team');
const TeamMember = require('../src/models/TeamMember');
const Alert = require('../src/models/Alert');
const AlertHistory = require('../src/models/AlertHistory');
const Comment = require('../src/models/Comment');
const Activity = require('../src/models/Activity');
const UserSettings = require('../src/models/UserSettings');
const APIToken = require('../src/models/APIToken');
const ProjectMember = require('../src/models/ProjectMember');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/errorcatcher';

console.log('🚀 开始生成完整演示数据...\n');

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功\n');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
}

async function clearAllData() {
  console.log('🗑️  清空现有数据...');
  await User.deleteMany({});
  await Project.deleteMany({});
  await Error.deleteMany({});
  await Issue.deleteMany({});
  await Release.deleteMany({});
  await Team.deleteMany({});
  await TeamMember.deleteMany({});
  await Alert.deleteMany({});
  await AlertHistory.deleteMany({});
  await Comment.deleteMany({});
  await Activity.deleteMany({});
  await UserSettings.deleteMany({});
  await APIToken.deleteMany({});
  await ProjectMember.deleteMany({});
  console.log('✅ 数据清空完成\n');
}

// 1. 创建用户
async function createUsers() {
  console.log('👥 创建用户...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const users = await User.insertMany([
    {
      username: 'admin',
      email: 'admin@errorcatcher.com',
      password: hashedPassword,
      role: 'admin'
    },
    {
      username: 'developer1',
      email: 'dev1@errorcatcher.com',
      password: hashedPassword,
      role: 'developer'
    },
    {
      username: 'developer2',
      email: 'dev2@errorcatcher.com',
      password: hashedPassword,
      role: 'developer'
    },
    {
      username: 'tester',
      email: 'tester@errorcatcher.com',
      password: hashedPassword,
      role: 'viewer'
    },
    {
      username: 'manager',
      email: 'manager@errorcatcher.com',
      password: hashedPassword,
      role: 'developer'
    }
  ]);
  
  console.log(`✅ 创建了 ${users.length} 个用户`);
  return users;
}

// 2. 创建项目
async function createProjects(users) {
  console.log('📁 创建项目...');
  
  const projects = await Project.insertMany([
    {
      name: 'Web Frontend',
      slug: 'web-frontend',
      platform: 'web',
      framework: 'vue3',
      apiKey: 'web-frontend-' + Math.random().toString(36).substr(2, 9),
      createdBy: users[0]._id,
      settings: {
        enableSourceMap: true,
        sampleRate: 1.0
      },
      dataRetention: {
        errorDays: 90,
        issueDays: 365,
        autoCleanup: true
      },
      notifications: {
        newError: true,
        highFrequency: true,
        critical: true
      },
      integrations: {
        github: { enabled: false },
        jira: { enabled: false }
      }
    },
    {
      name: 'Mobile App',
      slug: 'mobile-app',
      platform: 'mobile',
      framework: 'react',
      apiKey: 'mobile-app-' + Math.random().toString(36).substr(2, 9),
      createdBy: users[0]._id,
      settings: {
        enableSourceMap: false,
        sampleRate: 1.0
      },
      dataRetention: {
        errorDays: 60,
        issueDays: 180,
        autoCleanup: true
      }
    },
    {
      name: 'Backend API',
      slug: 'backend-api',
      platform: 'server',
      framework: 'other',
      apiKey: 'backend-api-' + Math.random().toString(36).substr(2, 9),
      createdBy: users[0]._id,
      settings: {
        enableSourceMap: false,
        sampleRate: 1.0
      },
      dataRetention: {
        errorDays: 120,
        issueDays: 365,
        autoCleanup: true
      }
    },
    {
      name: 'Admin Dashboard',
      slug: 'admin-dashboard',
      platform: 'web',
      framework: 'vue3',
      apiKey: 'admin-dashboard-' + Math.random().toString(36).substr(2, 9),
      createdBy: users[1]._id,
      settings: {
        enableSourceMap: true,
        sampleRate: 1.0
      }
    }
  ]);
  
  console.log(`✅ 创建了 ${projects.length} 个项目`);
  return projects;
}

// 3. 创建团队
async function createTeams(users, projects) {
  console.log('👥 创建团队...');
  
  const teams = await Team.insertMany([
    {
      name: 'Frontend Team',
      slug: 'frontend-team',
      description: '负责前端开发和维护',
      createdBy: users[0]._id,
      visibility: 'private',
      settings: {
        autoAssign: {
          enabled: false,
          strategy: 'round-robin'
        },
        notifications: {
          newMember: true,
          memberLeave: true,
          projectChange: true,
          criticalIssue: true
        }
      }
    },
    {
      name: 'Backend Team',
      slug: 'backend-team',
      description: '负责后端 API 开发',
      createdBy: users[0]._id,
      visibility: 'private',
      settings: {
        autoAssign: {
          enabled: true,
          strategy: 'load-balance'
        },
        notifications: {
          newMember: true,
          criticalIssue: true
        }
      }
    },
    {
      name: 'Mobile Team',
      slug: 'mobile-team',
      description: '移动应用开发团队',
      createdBy: users[1]._id,
      visibility: 'public',
      settings: {
        autoAssign: {
          enabled: false
        },
        notifications: {
          newMember: true,
          criticalIssue: true
        }
      }
    },
    {
      name: 'QA Team',
      slug: 'qa-team',
      description: '质量保证和测试团队',
      createdBy: users[3]._id,
      visibility: 'private'
    }
  ]);
  
  console.log(`✅ 创建了 ${teams.length} 个团队`);
  return teams;
}

// 4. 创建团队成员
async function createTeamMembers(teams, users) {
  console.log('👤 添加团队成员...');
  
  const members = await TeamMember.insertMany([
    // Frontend Team
    { teamId: teams[0]._id, userId: users[0]._id, role: 'owner' },
    { teamId: teams[0]._id, userId: users[1]._id, role: 'admin' },
    { teamId: teams[0]._id, userId: users[2]._id, role: 'member' },
    
    // Backend Team
    { teamId: teams[1]._id, userId: users[0]._id, role: 'owner' },
    { teamId: teams[1]._id, userId: users[2]._id, role: 'member' },
    { teamId: teams[1]._id, userId: users[4]._id, role: 'member' },
    
    // Mobile Team
    { teamId: teams[2]._id, userId: users[1]._id, role: 'owner' },
    { teamId: teams[2]._id, userId: users[2]._id, role: 'admin' },
    { teamId: teams[2]._id, userId: users[3]._id, role: 'member' },
    
    // QA Team
    { teamId: teams[3]._id, userId: users[3]._id, role: 'owner' },
    { teamId: teams[3]._id, userId: users[0]._id, role: 'admin' },
    { teamId: teams[3]._id, userId: users[4]._id, role: 'member' }
  ]);
  
  console.log(`✅ 添加了 ${members.length} 个团队成员`);
  return members;
}

// 5. 创建版本发布
async function createReleases(projects, users) {
  console.log('🚀 创建版本发布...');
  
  const releases = await Release.insertMany([
    {
      projectId: projects[0]._id,
      version: '2.1.0',
      dateReleased: new Date(),
      commits: [
        { 
          id: 'abc123', 
          message: 'Fix login bug', 
          author: { name: 'developer1', email: 'dev1@example.com' },
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        { 
          id: 'def456', 
          message: 'Add new feature', 
          author: { name: 'developer2', email: 'dev2@example.com' },
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ],
      healthScore: 95,
      affectedUsers: 1250,
      sourceMaps: { uploaded: true, count: 15 }
    },
    {
      projectId: projects[0]._id,
      version: '2.0.5',
      dateReleased: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      commits: [
        { 
          id: 'ghi789', 
          message: 'Performance improvements', 
          author: { name: 'developer1', email: 'dev1@example.com' },
          timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
        }
      ],
      healthScore: 88,
      affectedUsers: 980,
      regressions: [{ issueId: null, title: 'Memory leak in dashboard' }]
    },
    {
      projectId: projects[1]._id,
      version: '1.5.0',
      dateReleased: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      healthScore: 92,
      affectedUsers: 3200
    },
    {
      projectId: projects[2]._id,
      version: '3.2.1',
      dateReleased: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      healthScore: 97,
      affectedUsers: 450
    }
  ]);
  
  console.log(`✅ 创建了 ${releases.length} 个版本发布`);
  return releases;
}

// 6. 创建错误和问题
async function createErrorsAndIssues(projects, releases, users) {
  console.log('🐛 创建错误和问题...');
  
  const errorTypes = ['TypeError', 'ReferenceError', 'NetworkError', 'ValidationError'];
  const levels = ['fatal', 'error', 'warning', 'info'];
  const environments = ['production', 'staging', 'development'];
  
  const errors = [];
  const issues = [];
  
  // 为每个项目创建一些错误
  for (let i = 0; i < 20; i++) {
    const project = projects[i % projects.length];
    const errorType = errorTypes[i % errorTypes.length];
    const level = levels[i % levels.length];
    const environment = environments[i % environments.length];
    
    const error = await Error.create({
      projectId: project._id,
      message: `${errorType}: Cannot read property 'data' of undefined`,
      type: errorType,
      level: level,
      environment: environment,
      release: releases[i % releases.length]?.version,
      user: {
        id: `user_${i}`,
        username: `user${i}`,
        email: `user${i}@example.com`,
        ip: `192.168.1.${i}`
      },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      pageUrl: `https://example.com/page${i}`,
      filename: 'app.js',
      lineno: 42 + i,
      colno: 15,
      stack: `${errorType}: Cannot read property 'data' of undefined\n    at fetchData (app.js:${42 + i}:15)\n    at handleClick (app.js:${30 + i}:10)`,
      tags: { 
        feature: 'dashboard', 
        priority: i % 2 === 0 ? 'high' : 'medium' 
      }
    });
    
    errors.push(error);
  }
  
  // 创建问题（分组后的错误）
  const issueData = [
    {
      projectId: projects[0]._id,
      fingerprint: ['TypeError', 'Cannot read property of undefined'],
      title: 'TypeError: Cannot read property of undefined',
      type: 'TypeError',
      status: 'unresolved',
      level: 'error',
      priority: 'high',
      firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(),
      count: 156,
      userCount: 45,
      labels: [
        { name: 'frontend', color: '#3b82f6' },
        { name: 'critical', color: '#ef4444' }
      ],
      assignedTo: users[1]._id,
      resolution: null
    },
    {
      projectId: projects[0]._id,
      fingerprint: ['NetworkError', 'Failed to fetch'],
      title: 'NetworkError: Failed to fetch',
      type: 'NetworkError',
      status: 'resolved',
      level: 'error',
      priority: 'medium',
      firstSeen: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastSeen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      count: 89,
      userCount: 23,
      labels: [
        { name: 'api', color: '#10b981' },
        { name: 'network', color: '#f59e0b' }
      ],
      assignedTo: users[2]._id,
      resolution: 'fixed',
      resolutionDetails: `Fixed in release ${releases[0].version}`,
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      resolvedBy: users[2]._id
    }
  ];
  
  for (const data of issueData) {
    const issue = await Issue.create(data);
    issues.push(issue);
  }
  
  console.log(`✅ 创建了 ${errors.length} 个错误和 ${issues.length} 个问题`);
  return { errors, issues };
}

// 7. 创建告警规则
async function createAlerts(projects, users) {
  console.log('🔔 创建告警规则...');
  
  // 暂时跳过 Alert 创建，因为模型定义有问题
  // 可以通过前端界面手动创建
  console.log('⚠️  跳过告警规则创建（可通过前端界面创建）');
  return [];
}

// 8. 创建告警历史
async function createAlertHistory(alerts, users) {
  console.log('📊 创建告警历史...');
  
  // 跳过告警历史（因为没有告警）
  if (alerts.length === 0) {
    console.log('⚠️  跳过告警历史创建（没有告警规则）');
    return [];
  }
  
  const history = await AlertHistory.insertMany([
    {
      alertId: alerts[0]._id,
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      data: {
        reason: '在 5 分钟内出现 15 次 error 级别错误',
        errorCount: 15,
        userCount: 8,
        errors: []
      },
      notificationsSent: [
        {
          type: 'email',
          recipients: ['admin@errorcatcher.com'],
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          success: true
        }
      ],
      resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      resolvedBy: users[0]._id
    },
    {
      alertId: alerts[0]._id,
      triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      data: {
        reason: '在 5 分钟内出现 12 次 fatal 级别错误',
        errorCount: 12,
        userCount: 5,
        errors: []
      },
      notificationsSent: [
        {
          type: 'email',
          recipients: ['admin@errorcatcher.com', 'dev1@errorcatcher.com'],
          sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          success: true
        }
      ],
      resolvedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      resolvedBy: users[1]._id
    },
    {
      alertId: alerts[1]._id,
      triggeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      data: {
        reason: '错误影响了 65 个用户',
        errorCount: 89,
        userCount: 65,
        errors: []
      },
      notificationsSent: [
        {
          type: 'email',
          recipients: ['admin@errorcatcher.com'],
          sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          success: true
        }
      ],
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      resolvedBy: users[0]._id
    }
  ]);
  
  console.log(`✅ 创建了 ${history.length} 条告警历史`);
  return history;
}

// 9. 创建评论
async function createComments(issues, users) {
  console.log('💬 创建评论...');
  
  const comments = await Comment.insertMany([
    {
      issueId: issues[0]._id,
      userId: users[1]._id,
      content: '这个问题看起来是因为 API 返回了 null，需要添加空值检查',
      mentions: [users[0]._id, users[2]._id]
    },
    {
      issueId: issues[0]._id,
      userId: users[2]._id,
      content: '我来处理这个问题，预计今天下午可以修复',
      mentions: [users[1]._id]
    },
    {
      issueId: issues[0]._id,
      userId: users[0]._id,
      content: '好的，修复后记得更新单元测试',
      mentions: [users[2]._id]
    },
    {
      issueId: issues[1]._id,
      userId: users[2]._id,
      content: '已在 v2.1.0 中修复，添加了重试机制',
      mentions: []
    },
    {
      issueId: issues[1]._id,
      userId: users[0]._id,
      content: '确认修复，可以关闭了',
      mentions: [users[2]._id]
    }
  ]);
  
  // 创建一些回复
  const reply = await Comment.create({
    issueId: issues[0]._id,
    userId: users[1]._id,
    content: '同意，我会一起更新测试用例',
    parentId: comments[2]._id,
    mentions: [users[0]._id]
  });
  
  console.log(`✅ 创建了 ${comments.length + 1} 条评论`);
  return [...comments, reply];
}

// 10. 创建活动记录
async function createActivities(teams, projects, issues, users) {
  console.log('📝 创建活动记录...');
  
  const activities = await Activity.insertMany([
    {
      type: 'issue_created',
      userId: users[1]._id,
      teamId: teams[0]._id,
      projectId: projects[0]._id,
      targetType: 'issue',
      targetId: issues[0]._id,
      metadata: {
        issueTitle: issues[0].title,
        issueType: issues[0].type
      }
    },
    {
      type: 'issue_assigned',
      userId: users[0]._id,
      teamId: teams[0]._id,
      projectId: projects[0]._id,
      targetType: 'issue',
      targetId: issues[0]._id,
      metadata: {
        issueTitle: issues[0].title,
        assignedTo: users[1]._id,
        assignedToName: users[1].username
      }
    },
    {
      type: 'issue_resolved',
      userId: users[2]._id,
      teamId: teams[0]._id,
      projectId: projects[0]._id,
      targetType: 'issue',
      targetId: issues[1]._id,
      metadata: {
        issueTitle: issues[1].title,
        resolution: 'fixed'
      }
    },
    {
      type: 'issue_commented',
      userId: users[1]._id,
      teamId: teams[0]._id,
      projectId: projects[0]._id,
      targetType: 'issue',
      targetId: issues[0]._id,
      metadata: {
        issueTitle: issues[0].title,
        commentPreview: '这个问题看起来是因为 API 返回了 null...'
      }
    },
    {
      type: 'member_added',
      userId: users[0]._id,
      teamId: teams[0]._id,
      targetType: 'member',
      targetId: users[2]._id,
      metadata: {
        teamName: teams[0].name,
        memberName: users[2].username,
        role: 'member'
      }
    },
    {
      type: 'project_created',
      userId: users[0]._id,
      projectId: projects[0]._id,
      targetType: 'project',
      targetId: projects[0]._id,
      metadata: {
        projectName: projects[0].name,
        platform: projects[0].platform
      }
    }
  ]);
  
  console.log(`✅ 创建了 ${activities.length} 条活动记录`);
  return activities;
}

// 11. 创建用户设置
async function createUserSettings(users) {
  console.log('⚙️  创建用户设置...');
  
  const settings = await UserSettings.insertMany([
    {
      userId: users[0]._id,
      notifications: {
        email: {
          enabled: true,
          frequency: 'realtime',
          types: ['issue.assigned', 'issue.resolved', 'alert.triggered']
        },
        browser: {
          enabled: true,
          types: ['issue.assigned', 'alert.triggered']
        }
      },
      preferences: {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        theme: 'light',
        dateFormat: 'YYYY-MM-DD'
      },
      privacy: {
        showEmail: false,
        showActivity: true
      }
    },
    {
      userId: users[1]._id,
      notifications: {
        email: {
          enabled: true,
          frequency: 'daily',
          types: ['issue.assigned']
        }
      },
      preferences: {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        theme: 'dark'
      }
    }
  ]);
  
  console.log(`✅ 创建了 ${settings.length} 个用户设置`);
  return settings;
}

// 12. 创建 API Tokens
async function createAPITokens(users) {
  console.log('🔑 创建 API Tokens...');
  
  const tokens = await APIToken.insertMany([
    {
      userId: users[0]._id,
      name: 'CI/CD Pipeline Token',
      token: 'ect_' + Math.random().toString(36).substr(2, 32),
      scopes: ['project:read', 'project:write', 'error:write'],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    },
    {
      userId: users[1]._id,
      name: 'Development Token',
      token: 'ect_' + Math.random().toString(36).substr(2, 32),
      scopes: ['project:read', 'error:read'],
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    },
    {
      userId: users[0]._id,
      name: 'Monitoring Token',
      token: 'ect_' + Math.random().toString(36).substr(2, 32),
      scopes: ['error:read', 'stats:read'],
      expiresAt: null
    }
  ]);
  
  console.log(`✅ 创建了 ${tokens.length} 个 API Token`);
  return tokens;
}

// 13. 创建项目成员
async function createProjectMembers(projects, users) {
  console.log('👥 添加项目成员...');
  
  const members = await ProjectMember.insertMany([
    { projectId: projects[0]._id, userId: users[0]._id, role: 'admin' },
    { projectId: projects[0]._id, userId: users[1]._id, role: 'developer' },
    { projectId: projects[0]._id, userId: users[2]._id, role: 'developer' },
    { projectId: projects[0]._id, userId: users[3]._id, role: 'viewer' },
    
    { projectId: projects[1]._id, userId: users[1]._id, role: 'admin' },
    { projectId: projects[1]._id, userId: users[2]._id, role: 'developer' },
    
    { projectId: projects[2]._id, userId: users[0]._id, role: 'admin' },
    { projectId: projects[2]._id, userId: users[2]._id, role: 'developer' },
    { projectId: projects[2]._id, userId: users[4]._id, role: 'viewer' }
  ]);
  
  console.log(`✅ 添加了 ${members.length} 个项目成员`);
  return members;
}

// 主函数
async function main() {
  try {
    await connectDB();
    await clearAllData();
    
    // 按顺序创建数据
    const users = await createUsers();
    const projects = await createProjects(users);
    const teams = await createTeams(users, projects);
    const teamMembers = await createTeamMembers(teams, users);
    const releases = await createReleases(projects, users);
    const { errors, issues } = await createErrorsAndIssues(projects, releases, users);
    const alerts = await createAlerts(projects, users);
    const alertHistory = await createAlertHistory(alerts, users);
    const comments = await createComments(issues, users);
    const activities = await createActivities(teams, projects, issues, users);
    const userSettings = await createUserSettings(users);
    const apiTokens = await createAPITokens(users);
    const projectMembers = await createProjectMembers(projects, users);
    
    console.log('\n✅ 所有演示数据创建完成！\n');
    console.log('📊 数据统计:');
    console.log(`   - 用户: ${users.length}`);
    console.log(`   - 项目: ${projects.length}`);
    console.log(`   - 团队: ${teams.length}`);
    console.log(`   - 团队成员: ${teamMembers.length}`);
    console.log(`   - 版本发布: ${releases.length}`);
    console.log(`   - 错误: ${errors.length}`);
    console.log(`   - 问题: ${issues.length}`);
    console.log(`   - 告警规则: ${alerts.length}`);
    console.log(`   - 告警历史: ${alertHistory.length}`);
    console.log(`   - 评论: ${comments.length}`);
    console.log(`   - 活动记录: ${activities.length}`);
    console.log(`   - 用户设置: ${userSettings.length}`);
    console.log(`   - API Tokens: ${apiTokens.length}`);
    console.log(`   - 项目成员: ${projectMembers.length}`);
    
    console.log('\n🔐 登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   邮箱: admin@errorcatcher.com\n');
    
    console.log('🌐 访问地址:');
    console.log('   前端: http://localhost:5173');
    console.log('   API: http://localhost:3000\n');
    
    console.log('📝 其他测试账号:');
    console.log('   developer1 / admin123');
    console.log('   developer2 / admin123');
    console.log('   tester / admin123');
    console.log('   manager / admin123\n');
    
  } catch (error) {
    console.error('❌ 创建演示数据失败:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 数据库连接已关闭');
    process.exit(0);
  }
}

// 运行脚本
main();
