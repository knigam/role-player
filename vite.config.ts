import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  build: {
    lib: {
      // The entry point for your library
      entry: path.resolve(__dirname, "src/index.tsx"),
      // The name of your library (e.g., 'my-library')
      name: "RolePlayer",
      // The formats you want to support (CommonJS and ES)
      fileName: (format) => `role-player.${format}.js`,
      formats: ["es", "cjs"], // ESM and CommonJS support
    },
    rollupOptions: {
      // Externalize dependencies to avoid bundling them
      external: ["react", "react-dom", "firebase"], // Add other dependencies you want to externalize
      output: {
        // Ensure the global variable is correct for the UMD format
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    // Minify for production
    minify: "esbuild",
    sourcemap: true, // Generate source maps for debugging
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // Optional: Alias for easier imports
    },
  },
});
