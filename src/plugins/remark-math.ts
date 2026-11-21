import type {} from 'remark-parse'
import { mathFromMarkdown } from 'mdast-util-math'
import type { Processor } from 'unified'
import { math } from './math-syntax/syntax.js'

// Use the upstream micromark math tokenizer with the MathJax renderer.
export default function remarkMath(this: Processor) {
  const data = this.data()
  data.micromarkExtensions ??= []
  data.fromMarkdownExtensions ??= []
  data.micromarkExtensions.push(math())
  data.fromMarkdownExtensions.push(mathFromMarkdown())
}
