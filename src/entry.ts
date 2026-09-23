// iife/cjs usage extends the esm default export, so import it all.
import component, * as namedExports from "./entry.esm";

// Attach named exports directly to the component. IIFE/CJS only expose one
// global variable, with named exports hanging off it (eg. plugin.namedExport).
Object.entries(namedExports).forEach(([exportName, exported]) => {
  if (exportName !== "default")
    (component as unknown as Record<string, unknown>)[exportName] = exported;
});

export default component;
