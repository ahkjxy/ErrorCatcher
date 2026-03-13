const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, authenticate } = require('../middleware/auth');

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.username === username ? '用户名已存在' : '邮箱已被注册' 
      });
    }

    // 创建用户
    const user = new User({
      username,
      email,
      password,
      role: role || 'developer'
    });

    await user.save();

    // 生成 token
    const token = generateToken(user._id);

    res.status(201).json({
      message: '注册成功',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 检查账号状态
    if (user.status !== 'active') {
      return res.status(401).json({ error: '账号已被禁用' });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 token
    const token = generateToken(user._id);

    res.json({
      message: '登录成功',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: req.user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 获取用户资料（别名）
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json(req.user.toJSON());
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// 更新用户信息
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { email, avatar } = req.body;
    const user = req.user;

    if (email) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: '更新成功',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 更新用户资料（别名）
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { email, avatar } = req.body;
    const user = req.user;

    if (email) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      message: '更新成功',
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

// 修改密码
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '请填写所有字段' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码至少6位' });
    }

    // 验证旧密码
    const isMatch = await req.user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(401).json({ error: '原密码错误' });
    }

    // 更新密码
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    res.status(500).json({ error: '密码修改失败' });
  }
});

// 登出（客户端删除 token 即可，这里只是记录）
router.post('/logout', authenticate, async (req, res) => {
  try {
    // 可以在这里记录登出日志
    res.json({ message: '登出成功' });
  } catch (error) {
    res.status(500).json({ error: '登出失败' });
  }
});

// 删除账户
router.delete('/account', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // 删除用户
    await User.findByIdAndDelete(userId);
    
    res.json({ message: '账户已删除' });
  } catch (error) {
    console.error('删除账户错误:', error);
    res.status(500).json({ error: '删除账户失败' });
  }
});

module.exports = router;
