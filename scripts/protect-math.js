/**
 * 公式保护：Hexo 的 marked 渲染器遵循 CommonMark，
 * 会把公式中的 \{ \} \; \_ 等反斜杠转义吞掉（如 $\{x\}$ -> ${x}$），
 * 导致 MathJax 收到的 LaTeX 残缺。
 * 渲染前把 $...$ / $$...$$ 整段替换为自带内容编码的无状态占位符，
 * 渲染完成后解码还原（多文章并发渲染安全）。
 */
'use strict'

function token(math) {
  // hex 编码只含 0-9a-f，绝不触发 CommonMark 转义/链接
  return `@@MJX:${Buffer.from(math, 'utf8').toString('hex')}:@@`
}

function protect(content) {
  if (typeof content !== 'string') return content
  return content
    .replace(/\$\$[\s\S]+?\$\$/g, token)
    .replace(/\$[^\$\n]+?\$/g, token)
}

function restore(content) {
  if (typeof content !== 'string') return content
  return content.replace(/@@MJX:([0-9a-f]+):@@/g, (m, hex) => {
    try {
      return Buffer.from(hex, 'hex').toString('utf8')
    } catch (e) {
      return m
    }
  })
}

hexo.extend.filter.register('before_post_render', function (data) {
  // 渲染管线中原始 markdown 位于 data.content
  const src = data.content || ''
  data.content = protect(data.content)
  const tokens = (data.content.match(/@@MJX:/g) || []).length
  if (tokens > 0) console.log(`[protect] ${data.source} len=${src.length} tokens=${tokens}`)
})

hexo.extend.filter.register('after_post_render', function (data) {
  const left = (data.content.match(/@@MJX:/g) || []).length
  data.content = restore(data.content)
  if (left > 0) console.log(`[restore] ${data.source} left_tokens=${left}`)
})