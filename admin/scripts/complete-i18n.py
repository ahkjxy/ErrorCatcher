#!/usr/bin/env python3
"""
完整的 i18n 更新脚本
逐个文件检查并完成国际化配置
"""

import re
import os
from pathlib import Path

# 文本替换映射
REPLACEMENTS = {
    # 页面标题和描述
    r'>Dashboard<': r'>{{ t(\'dashboard.title\') }}<',
    r'>Projects<': r'>{{ t(\'projects.title\') }}<',
    r'>Errors<': r'>{{ t(\'errors.title\') }}<',
    r'>Issues<': r'>{{ t(\'issues.title\') }}<',
    r'>Alerts<': r'>{{ t(\'alerts.title\') }}<',
    r'>Notifications<': r'>{{ t(\'notifications.title\') }}<',
    r'>Users<': r'>{{ t(\'users.title\') }}<',
    r'>Profile<': r'>{{ t(\'profile.title\') }}<',
    r'>Settings<': r'>{{ t(\'settings.title\') }}<',
    
    # 通用按钮
    r'>Save<': r'>{{ t(\'common.save\') }}<',
    r'>Cancel<': r'>{{ t(\'common.cancel\') }}<',
    r'>Delete<': r'>{{ t(\'common.delete\') }}<',
    r'>Edit<': r'>{{ t(\'common.edit\') }}<',
    r'>Create<': r'>{{ t(\'common.create\') }}<',
    r'>Search<': r'>{{ t(\'common.search\') }}<',
    r'>Filter<': r'>{{ t(\'common.filter\') }}<',
    r'>Refresh<': r'>{{ t(\'common.refresh\') }}<',
    r'>Back<': r'>{{ t(\'common.back\') }}<',
    r'>Close<': r'>{{ t(\'common.close\') }}<',
    r'>Submit<': r'>{{ t(\'common.submit\') }}<',
    r'>Reset<': r'>{{ t(\'common.reset\') }}<',
    r'>Clear<': r'>{{ t(\'common.clear\') }}<',
    r'>View<': r'>{{ t(\'common.view\') }}<',
    
    # 状态
    r'>Enabled<': r'>{{ t(\'common.enabled\') }}<',
    r'>Disabled<': r'>{{ t(\'common.disabled\') }}<',
    r'>Active<': r'>{{ t(\'common.active\') }}<',
    r'>Inactive<': r'>{{ t(\'common.inactive\') }}<',
    r'>Loading\.\.\.<': r'>{{ t(\'common.loading\') }}<',
    
    # 常见短语
    r'>View All<': r'>{{ t(\'dashboard.viewAll\') }}<',
    r'>View all<': r'>{{ t(\'dashboard.viewAll\') }}<',
    r'>No data<': r'>{{ t(\'common.noData\') }}<',
    r'>No results<': r'>{{ t(\'common.noResults\') }}<',
    
    # 项目相关
    r'>Create Project<': r'>{{ t(\'projects.createProject\') }}<',
    r'>Edit Project<': r'>{{ t(\'projects.editProject\') }}<',
    r'>Delete Project<': r'>{{ t(\'projects.deleteProject\') }}<',
    r'>Project Name<': r'>{{ t(\'projects.projectName\') }}<',
    r'>No projects<': r'>{{ t(\'projects.noProjects\') }}<',
    
    # 告警相关
    r'>Create Alert<': r'>{{ t(\'alerts.createAlert\') }}<',
    r'>Edit Alert<': r'>{{ t(\'alerts.editAlert\') }}<',
    r'>Alert Name<': r'>{{ t(\'alerts.alertName\') }}<',
    r'>Priority<': r'>{{ t(\'alerts.priority\') }}<',
    r'>Critical<': r'>{{ t(\'alerts.critical\') }}<',
    r'>High<': r'>{{ t(\'alerts.high\') }}<',
    r'>Medium<': r'>{{ t(\'alerts.medium\') }}<',
    r'>Low<': r'>{{ t(\'alerts.low\') }}<',
    
    # 错误相关
    r'>Error Message<': r'>{{ t(\'errors.errorMessage\') }}<',
    r'>Error Type<': r'>{{ t(\'errors.errorType\') }}<',
    r'>Resolved<': r'>{{ t(\'errors.resolved\') }}<',
    r'>Unresolved<': r'>{{ t(\'errors.unresolved\') }}<',
    
    # 用户相关
    r'>Username<': r'>{{ t(\'users.username\') }}<',
    r'>Email<': r'>{{ t(\'users.email\') }}<',
    r'>Password<': r'>{{ t(\'users.password\') }}<',
    r'>Role<': r'>{{ t(\'users.role\') }}<',
    r'>Admin<': r'>{{ t(\'users.admin\') }}<',
    r'>User<': r'>{{ t(\'users.user\') }}<',
}

def add_use_i18n(content):
    """添加 useI18n 导入"""
    if 'useI18n' in content:
        return content
    
    # 查找 <script setup> 标签
    script_match = re.search(r'<script setup>(.*?)</script>', content, re.DOTALL)
    if not script_match:
        return content
    
    script_content = script_match.group(1)
    
    # 添加导入
    import_line = "import { useI18n } from 'vue-i18n';\nconst { t } = useI18n();\n"
    
    # 在第一个 import 之后添加
    first_import = re.search(r'(import .+?;)', script_content)
    if first_import:
        new_script = script_content.replace(
            first_import.group(1),
            first_import.group(1) + '\n' + import_line,
            1
        )
        content = content.replace(script_content, new_script)
    
    return content

def apply_replacements(content):
    """应用所有文本替换"""
    for pattern, replacement in REPLACEMENTS.items():
        content = re.sub(pattern, replacement, content)
    return content

def process_file(file_path):
    """处理单个文件"""
    print(f"\n处理: {file_path.name}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # 添加 useI18n
    content = add_use_i18n(content)
    
    # 应用替换
    content = apply_replacements(content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ 已更新")
        return True
    else:
        print(f"  ⊘ 无需更新")
        return False

def main():
    views_dir = Path('admin/src/views')
    vue_files = list(views_dir.glob('*.vue'))
    
    print(f"找到 {len(vue_files)} 个 Vue 文件\n")
    
    updated_count = 0
    for vue_file in sorted(vue_files):
        if process_file(vue_file):
            updated_count += 1
    
    print(f"\n完成！更新了 {updated_count} 个文件")

if __name__ == '__main__':
    main()
