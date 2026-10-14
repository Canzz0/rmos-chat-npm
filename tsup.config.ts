import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  // Kod karartma (hafif): terser ile sıkıştırma + isim kısaltma.
  // Public export isimleri ve tip tanımları (.d.ts) etkilenmez.
  minify: "terser",
  terserOptions: {
    // directives: false → "use client" banner'ını silmesini engeller (RSC/Next.js için şart)
    compress: { passes: 2, directives: false },
    mangle: true,
    format: { comments: false },
  },
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "firebase",
    "firebase/app",
    "firebase/auth",
    "firebase/firestore",
  ],
  banner: { js: '"use client";' },
});
