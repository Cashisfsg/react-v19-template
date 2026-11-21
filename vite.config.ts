import { reactRouter } from "@react-router/dev/vite";
import { Features } from "lightningcss";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [reactRouter()],
    css: {
        /* The same CSS pipeline in dev as in the build. By default dev runs
           PostCSS and only the build runs Lightning CSS, so whatever the
           build rewrites (as it once did to `:dir()`) breaks in production
           alone. */
        transformer: "lightningcss",
        lightningcss: {
            /* Lightning CSS rewrites `:dir(rtl)` into a list of `:lang()`s for
               browsers older than the build target, and that list reads only
               the page's language, never a `dir` set on an ancestor. Kept as
               written, `:dir()` follows the inherited direction. */
            exclude: Features.DirSelector
        }
    },
    /* `~/*` comes from the paths in tsconfig.json, which Vite reads itself. */
    resolve: {
        tsconfigPaths: true
    }
});
