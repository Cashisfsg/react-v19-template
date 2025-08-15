import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src")
        }
    }
});
