import type { Root } from 'hast'
import { visit, SKIP } from 'unist-util-visit'

export default function rehypeArticle() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'mjx-container') return SKIP

      if (node.tagName === 'a' &&
        typeof node.properties.href === 'string' &&
        /^(https?:)?\/\//i.test(node.properties.href)) {
        node.properties.rel = ['nofollow', 'noopener', 'noreferrer']
        node.properties.target = '_blank'
        node.children.push({
          type: 'element',
          tagName: 'span',
          properties: { style: 'user-select:none' },
          children: [{ type: 'text', value: ' ↗' }]
        })
      }

      if (node.tagName === 'table' && parent && index !== undefined) {
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['article-table'] },
          children: [node]
        }
      }
    })
  }
}
