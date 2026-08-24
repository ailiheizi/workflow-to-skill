import { defineConfig, type UserConfig } from 'tsdown'

const PACKAGE_ID = '@poiema/actweave'

const host: UserConfig = {
  name: PACKAGE_ID,
  entry: { index: 'src/host/index.ts' },
  outDir: 'lib',
  format: 'esm',
  platform: 'node',
  target: 'es2024',
  tsconfig: 'tsconfig.host.json',
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
}

export default defineConfig([host])
