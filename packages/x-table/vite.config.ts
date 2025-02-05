import { defineConfig } from "vite";
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "XTable",
      fileName: "index",
    },
    // rollupOptions: {
    //   // https://rollupjs.org/configuration-options/
    //   input: {
    //     "x-table": "src/index.ts",
    //   },
    //   output: {
    //     dir: "dist",
    //     entryFileNames: "[name].js",
    //     format: "es",
    //   },
    // },
  },
  plugins: [dts()],
});
