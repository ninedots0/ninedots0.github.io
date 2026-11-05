import type { Root, RootContent, Paragraph } from 'mdast'
import type { VFile } from 'vfile'

// Preserve content: remark-math treats same-line $$...$$ as inline math.
// Promote those nodes to display blocks, including inside list items.
export default function remarkDisplayMath() {
  return (tree: Root, file: VFile) => {
    const source = String(file.value)
    function walk(parent: { children?: unknown[] }) {
      if (!parent.children) return
      parent.children = parent.children.flatMap((child) => {
        const node = child as RootContent
        if (node.type !== 'paragraph') {
          walk(node as { children?: unknown[] })
          return [node]
        }
        const result: RootContent[] = []
        let pending: Paragraph['children'] = []
        const flush = () => {
          if (pending.length) result.push({ type: 'paragraph', children: pending })
          pending = []
        }
        for (const inline of node.children) {
          const start = inline.position?.start.offset
          if (inline.type === 'inlineMath' && start !== undefined && source.slice(start, start + 2) === '$$') {
            flush()
            result.push({ type: 'math', value: inline.value, data: {
              hName: 'pre', hChildren: [{ type: 'element', tagName: 'code', properties: { className: ['language-math', 'math-display'] }, children: [{ type: 'text', value: inline.value }] }]
            } })
          } else pending.push(inline)
        }
        flush()
        return result
      })
    }
    walk(tree)
  }
}
