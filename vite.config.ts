import path from "path";

import { reactRouter } from "@react-router/dev/vite";
import { Features } from "lightningcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
    plugins: [reactRouter(), tsconfigPaths()],
    css: {
        lightningcss: {
            /* Lightning CSS rewrites `:dir(rtl)` into a list of `:lang()`s for
               browsers older than the build target, and that list reads only
               the page's language, never a `dir` set on an ancestor. Kept as
               written, `:dir()` follows the inherited direction. */
            exclude: Features.DirSelector
        }
    },
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src")
        }
    }
});
