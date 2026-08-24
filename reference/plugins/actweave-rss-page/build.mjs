import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const lib = resolve(root, 'lib')
await mkdir(lib, { recursive: true })
await writeFile(resolve(lib, 'index.js'), '/** Host half: the embedded view is browser-owned. */\nexport function apply() {}\n')

const result = await build({
  entryPoints: [resolve(root, 'src/client.js')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  external: ['react', 'react/jsx-runtime'],
  write: false,
  legalComments: 'none'
})
const code = result.outputFiles[0].text.trimEnd()
const indented = code.split('\n').map(line => line === '' ? '' : `\t\t${line}`).join('\n')
const output = `window.__ModuleLoader__.load({\n\tid: "@poiema/actweave-rss-page",\n\tfactory: (require) => {\n\t\tvar module = { exports: {} };\n\t\tvar exports = module.exports;\n${indented}\n\t\treturn module.exports;\n\t}\n});\n`
await writeFile(resolve(lib, 'client.js'), output)
