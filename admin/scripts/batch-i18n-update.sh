#!/bin/bash

# 批量更新所有视图文件以支持 i18n
# 使用方法: bash admin/scripts/batch-i18n-update.sh

echo "开始批量更新视图文件..."

# 定义视图文件目录
VIEWS_DIR="admin/src/views"

# 遍历所有 .vue 文件
for file in $VIEWS_DIR/*.vue; do
    filename=$(basename "$file")
    
    # 跳过已经有 useI18n 的文件
    if grep -q "useI18n" "$file"; then
        echo "⊘ 跳过 $filename (已有 i18n)"
        continue
    fi
    
    echo "✓ 处理 $filename..."
    
    # 创建临时文件
    temp_file="${file}.tmp"
    
    # 读取文件内容并添加 useI18n 导入
    awk '
    /<script setup>/ {
        print
        print "import { useI18n } from '\''vue-i18n'\'';"
        print "const { t } = useI18n();"
        print ""
        next
    }
    { print }
    ' "$file" > "$temp_file"
    
    # 替换常见文本
    sed -i.bak \
        -e 's/>Dashboard</>{{ t('\''dashboard.title'\'') }}</g' \
        -e 's/>Projects</>{{ t('\''projects.title'\'') }}</g' \
        -e 's/>Errors</>{{ t('\''errors.title'\'') }}</g' \
        -e 's/>Issues</>{{ t('\''issues.title'\'') }}</g' \
        -e 's/>Alerts</>{{ t('\''alerts.title'\'') }}</g' \
        -e 's/>Notifications</>{{ t('\''notifications.title'\'') }}</g' \
        -e 's/>Save</>{{ t('\''common.save'\'') }}</g' \
        -e 's/>Cancel</>{{ t('\''common.cancel'\'') }}</g' \
        -e 's/>Delete</>{{ t('\''common.delete'\'') }}</g' \
        -e 's/>Edit</>{{ t('\''common.edit'\'') }}</g' \
        -e 's/>Create</>{{ t('\''common.create'\'') }}</g' \
        -e 's/>Back</>{{ t('\''common.back'\'') }}</g' \
        -e 's/>Close</>{{ t('\''common.close'\'') }}</g' \
        -e 's/>Loading\.\.\.</>{{ t('\''common.loading'\'') }}</g' \
        -e 's/>Enabled</>{{ t('\''common.enabled'\'') }}</g' \
        -e 's/>Disabled</>{{ t('\''common.disabled'\'') }}</g' \
        "$temp_file"
    
    # 替换原文件
    mv "$temp_file" "$file"
    rm -f "${file}.bak"
    
    echo "  ✓ 完成 $filename"
done

echo ""
echo "✓ 所有文件处理完成！"
echo ""
echo "下一步："
echo "1. 检查更新的文件"
echo "2. 启动开发服务器测试"
echo "3. 根据需要添加更多翻译"
