/* The `Tabs` namespace, assembled here rather than in `tabs.tsx`: `UrlRoot`
   builds on `Root`, so re-exporting it from `tabs.tsx` would make a cycle and
   put react-router into the module graph of everything that uses the
   primitives. */
export * from "./tabs";
export { UrlRoot } from "./url-tabs-root";
