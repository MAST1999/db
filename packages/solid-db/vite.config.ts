import { defineConfig, mergeConfig } from "vitest/config"
import { tanstackViteConfig } from "@tanstack/config/vite"
import solidPlugin from "vite-plugin-solid"
import packageJson from "./package.json"

const config = defineConfig({
  plugins: [solidPlugin()],
  test: {
    name: packageJson.name,
    dir: `./tests`,
    environment: `jsdom`,
    setupFiles: [`./tests/test-setup.ts`],
    coverage: { enabled: true, provider: `istanbul`, include: [`src/**/*`] },
    typecheck: { enabled: true },
  },
})

export default mergeConfig(
  config,
  tanstackViteConfig({
    entry: `./src/index.ts`,
    srcDir: `./src`,
    cjs: false,
  })
)
