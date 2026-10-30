import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Compiler } from 'inkjs/full'

/** Compiles .ink story files to ink's JSON when they're imported. */
function ink(): Plugin {
  return {
    name: 'ink',
    transform(source, id) {
      if (!id.endsWith('.ink')) return
      const compiler = new Compiler(source)
      const story = compiler.Compile()
      if (compiler.errors.length) this.error(compiler.errors.join('\n'))
      compiler.warnings.forEach((w) => this.warn(w))
      return { code: `export default ${JSON.stringify(story.ToJson())}`, map: null }
    },
  }
}

export default defineConfig({
  plugins: [ink(), react(), tailwindcss()],
})
