import { jsx, jsxs } from 'react/jsx-runtime'
import { useEffect, useMemo, useState } from 'react'

const VIEW_ID = 'rss-digest'
const VIEW_LABEL = 'RSS Digest'
const SKILL_COMMAND = '/rss-digest'
const inject = ['slots', 'sessions']

const styles = `
.actweave-rss-page{box-sizing:border-box;display:flex;flex-direction:column;gap:16px;height:100%;overflow:auto;padding:24px;color:var(--dsw-alias-content-primary,#202124);background:var(--dsw-alias-surface-primary,#fff)}
.actweave-rss-page *{box-sizing:border-box}
.actweave-rss-page__header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;max-width:980px;width:100%;margin:0 auto}
.actweave-rss-page__title{margin:0;font-size:20px;line-height:28px;font-weight:650}
.actweave-rss-page__subtitle{margin:4px 0 0;color:var(--dsw-alias-content-secondary,#666);font-size:13px;line-height:20px}
.actweave-rss-page__state{color:var(--dsw-alias-content-secondary,#666);font-size:12px;line-height:20px;white-space:nowrap}
.actweave-rss-page__form,.actweave-rss-page__result{max-width:980px;width:100%;margin:0 auto;border:1px solid var(--dsw-alias-border-primary,#dedede);border-radius:8px;background:var(--dsw-alias-surface-secondary,#fafafa)}
.actweave-rss-page__form{display:grid;grid-template-columns:minmax(0,1fr) 160px;gap:12px;padding:16px}
.actweave-rss-page__field{display:flex;flex-direction:column;gap:6px;min-width:0}
.actweave-rss-page__field--wide{grid-column:1/-1}
.actweave-rss-page__label{font-size:12px;font-weight:600;color:var(--dsw-alias-content-secondary,#666)}
.actweave-rss-page__input,.actweave-rss-page__textarea{width:100%;border:1px solid var(--dsw-alias-border-primary,#cfcfcf);border-radius:6px;background:var(--dsw-alias-surface-primary,#fff);color:inherit;font:inherit;font-size:13px;line-height:20px;padding:8px 10px;outline:none}
.actweave-rss-page__textarea{min-height:92px;resize:vertical}
.actweave-rss-page__input:focus,.actweave-rss-page__textarea:focus{border-color:var(--dsw-alias-state-info-primary,#4b72d8);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-state-info-primary,#4b72d8) 20%,transparent)}
.actweave-rss-page__actions{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:12px}
.actweave-rss-page__hint{font-size:12px;line-height:18px;color:var(--dsw-alias-content-tertiary,#888)}
.actweave-rss-page__button{border:0;border-radius:6px;padding:8px 14px;background:var(--dsw-alias-state-info-primary,#356ae6);color:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer}
.actweave-rss-page__button:disabled{opacity:.55;cursor:default}
.actweave-rss-page__error{grid-column:1/-1;margin:0;color:var(--dsw-alias-state-error-primary,#b42318);font-size:12px;line-height:18px}
.actweave-rss-page__result{padding:16px}
.actweave-rss-page__result-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px;font-size:14px;font-weight:650}
.actweave-rss-page__badge{font-size:11px;font-weight:500;color:var(--dsw-alias-content-secondary,#666)}
.actweave-rss-page__empty{margin:0;color:var(--dsw-alias-content-tertiary,#888);font-size:13px;line-height:20px}
.actweave-rss-page__node{border-top:1px solid var(--dsw-alias-border-secondary,#e9e9e9);padding:10px 0}
.actweave-rss-page__node:first-child{border-top:0;padding-top:0}
.actweave-rss-page__node-label{margin:0 0 5px;font-size:11px;line-height:16px;font-weight:650;color:var(--dsw-alias-content-tertiary,#888);text-transform:uppercase;letter-spacing:.04em}
.actweave-rss-page__node-text{margin:0;white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:20px}
@media (max-width:640px){.actweave-rss-page{padding:16px}.actweave-rss-page__form{grid-template-columns:1fr}.actweave-rss-page__field--wide,.actweave-rss-page__actions,.actweave-rss-page__error{grid-column:auto}.actweave-rss-page__header{display:block}.actweave-rss-page__state{display:block;margin-top:6px}}
`

function installStyles() {
  if (typeof document === 'undefined' || document.querySelector('style[data-actweave-rss-page]')) return
  const tag = document.createElement('style')
  tag.dataset.actweaveRssPage = ''
  tag.textContent = styles
  document.head.appendChild(tag)
}

function textFromContent(content) {
  if (!Array.isArray(content)) return ''
  return content.map(block => {
    if (block?.type === 'text' || block?.kind === 'text') return typeof block.text === 'string' ? block.text : ''
    if (block?.type === 'thinking' || block?.kind === 'reasoning') return typeof (block.thinking ?? block.text) === 'string' ? (block.thinking ?? block.text) : ''
    return ''
  }).filter(Boolean).join('')
}

function textFromNode(node) {
  if (node.kind === 'assistant' || node.kind === 'user' || node.kind === 'steering' || node.kind === 'context') {
    return textFromContent(node.kind === 'assistant' ? node.blocks : node.content)
  }
  if (node.kind === 'tool-result') return textFromContent(node.content)
  if (node.kind === 'command') return [node.name, node.args].filter(Boolean).join(' ')
  if (node.kind === 'turn-error') return node.message
  return ''
}

function displayNodes(snapshot) {
  return snapshot.nodes.filter(node => {
    if (node.kind === 'assistant' || node.kind === 'tool-result' || node.kind === 'turn-error') return true
    return node.kind === 'user' && textFromNode(node).startsWith(SKILL_COMMAND)
  }).map(node => ({
    key: `${node.kind}-${node.seq}`,
    label: node.kind === 'assistant' ? 'Agent result' : node.kind === 'tool-result' ? `Tool result${node.call?.name ? ` · ${node.call.name}` : ''}` : node.kind === 'turn-error' ? 'Turn error' : 'Request',
    text: textFromNode(node)
  })).filter(node => node.text.trim() !== '')
}

function promptFor({ sources, focus, maxItems }) {
  const values = {
    sources: sources.split(/\r?\n/u).map(value => value.trim()).filter(Boolean),
    focus: focus.trim(),
    maxHighlights: Number.parseInt(maxItems, 10) || 4,
    includeActions: false
  }
  return `${SKILL_COMMAND}\nCreate a traceable digest for the supplied RSS and Atom URLs.\nInputs (JSON):\n${JSON.stringify(values, null, 2)}`
}

function RssDigestView({ useSession, submit }) {
  installStyles()
  const snapshot = useSession(value => value)
  const [sources, setSources] = useState('https://example.com/feed.xml')
  const [focus, setFocus] = useState('')
  const [maxItems, setMaxItems] = useState('4')
  const [submitting, setSubmitting] = useState(false)
  const [awaitingNodeCount, setAwaitingNodeCount] = useState(null)
  const [error, setError] = useState('')
  const nodes = useMemo(() => displayNodes(snapshot), [snapshot])
  useEffect(() => {
    if (awaitingNodeCount !== null && (snapshot.running || nodes.length > awaitingNodeCount)) {
      setAwaitingNodeCount(null)
    }
  }, [awaitingNodeCount, nodes.length, snapshot.running])
  const run = async event => {
    event.preventDefault()
    setSubmitting(true)
    setAwaitingNodeCount(nodes.length)
    setError('')
    try {
      const result = await submit(promptFor({ sources, focus, maxItems }))
      if (!result.ok) {
        setAwaitingNodeCount(null)
        setError(result.error?.message ?? 'DSH rejected the request.')
      }
    } catch (reason) {
      setAwaitingNodeCount(null)
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setSubmitting(false)
    }
  }
  const working = submitting || awaitingNodeCount !== null || snapshot.running
  return jsxs('section', {
    className: 'actweave-rss-page',
    'aria-label': VIEW_LABEL,
    children: [
      jsxs('header', {
        className: 'actweave-rss-page__header',
        children: [
          jsxs('div', { children: [jsx('h1', { className: 'actweave-rss-page__title', children: VIEW_LABEL }), jsx('p', { className: 'actweave-rss-page__subtitle', children: 'Run the standard RSS Skill through this DSH Session.' })] }),
          jsx('span', { className: 'actweave-rss-page__state', role: 'status', children: working ? 'Running…' : snapshot.openState === 'loading' ? 'Loading session…' : 'Ready' })
        ]
      }),
      jsxs('form', {
        className: 'actweave-rss-page__form',
        onSubmit: run,
        children: [
          jsxs('label', { className: 'actweave-rss-page__field actweave-rss-page__field--wide', children: [jsx('span', { className: 'actweave-rss-page__label', children: 'RSS / Atom URLs' }), jsx('textarea', { className: 'actweave-rss-page__textarea', value: sources, onChange: event => setSources(event.target.value), placeholder: 'One HTTP(S) feed per line', required: true })] }),
          jsxs('label', { className: 'actweave-rss-page__field', children: [jsx('span', { className: 'actweave-rss-page__label', children: 'Focus topic' }), jsx('input', { className: 'actweave-rss-page__input', value: focus, onChange: event => setFocus(event.target.value), placeholder: 'Optional' })] }),
          jsxs('label', { className: 'actweave-rss-page__field', children: [jsx('span', { className: 'actweave-rss-page__label', children: 'Highlights' }), jsx('input', { className: 'actweave-rss-page__input', type: 'number', min: '1', max: '20', value: maxItems, onChange: event => setMaxItems(event.target.value) })] }),
          error && jsx('p', { className: 'actweave-rss-page__error', role: 'alert', children: error }),
          jsxs('div', { className: 'actweave-rss-page__actions', children: [jsx('span', { className: 'actweave-rss-page__hint', children: 'The button sends an ordinary /rss-digest prompt.' }), jsx('button', { className: 'actweave-rss-page__button', type: 'submit', disabled: working || snapshot.openState !== 'open', children: working ? 'Running…' : 'Run RSS digest' })] })
        ]
      }),
      jsxs('section', { className: 'actweave-rss-page__result', 'aria-live': 'polite', children: [jsxs('h2', { className: 'actweave-rss-page__result-title', children: [jsx('span', { children: 'Session output' }), jsx('span', { className: 'actweave-rss-page__badge', children: `${nodes.length} event${nodes.length === 1 ? '' : 's'}` })] }), nodes.length === 0 ? jsx('p', { className: 'actweave-rss-page__empty', children: 'Run the Skill to see the Agent response and typed tool results here.' }) : nodes.map(node => jsxs('article', { className: 'actweave-rss-page__node', children: [jsx('p', { className: 'actweave-rss-page__node-label', children: node.label }), jsx('p', { className: 'actweave-rss-page__node-text', children: node.text })] }, node.key))] })
    ]
  })
}

function apply(ctx) {
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: VIEW_ID,
    order: 20,
    label: () => VIEW_LABEL,
    inject: sessionId => {
      const session = ctx.sessions.binding(sessionId)?.session
      if (session === undefined) throw new Error(`actweave-rss-page: session "${sessionId}" is unavailable`)
      return {
        submit: text => session.prompt([{ type: 'text', text }], 'queue')
      }
    }
  }, RssDigestView))
}

export { apply, inject }
