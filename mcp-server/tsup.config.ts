import { defineConfig } from 'tsup'
import path from 'path'

const root = path.resolve(process.cwd(), '..')

const resolveCorePlugin = {
  name: 'resolve-core',
  setup(build: any) {
    build.onResolve({ filter: /^\.\.\/\.\.\/src\/core\// }, (args: any) => {
      const moduleName = args.path.replace('../../src/core/', '').replace(/\.js$/, '')
      const resolved = path.resolve(root, 'src', 'core', moduleName + '.ts')
      return { path: resolved }
    })
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  bundle: true,
  esbuildPlugins: [resolveCorePlugin],
})
