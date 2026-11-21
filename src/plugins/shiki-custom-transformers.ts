import { h } from 'hastscript'
import type { ShikiTransformer } from 'shiki'

export const wrapCodeBlock: ShikiTransformer = {
  name: 'wrap-code-block',
  pre(node) {
    const pre = h('pre', node.children)
    const title = this.options.meta?.__raw?.match(/(?:^|\s)title=(?:"([^"]+)"|'([^']+)')/)
    node.tagName = 'div'
    node.children = title
      ? [h('div.title', title[1] ?? title[2]), pre]
      : [pre]
  }
}
