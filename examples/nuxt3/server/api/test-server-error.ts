/**
 * 服务端 API 错误测试
 * 访问此端点会触发服务端错误
 */
export default defineEventHandler(() => {
  console.log('[Server API] 触发服务端错误...')
  
  // 触发一个 TypeError
  const obj: any = null
  return obj.property.value // 这会抛出错误
})
