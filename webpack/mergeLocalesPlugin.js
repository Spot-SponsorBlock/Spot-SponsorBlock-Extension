/* eslint-disable @typescript-eslint/no-var-requires */
const { readFile, readdir, writeFile, mkdir } = require("fs/promises");
const path = require("path");
let logger;

const readFileContents = (filePath) =>
  readFile(filePath, "utf8").then(data => JSON.parse(data));

const upstreamDir  = "public/_locales-sources/upstream";
const overridesDir = "public/_locales-sources/overrides";
const outDir = "public/_locales";

class mergeLocalesPlugin {
  apply(compiler) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    compiler.hooks.beforeCompile.tapAsync("mergeLocalesPlugin", async (_, callback) => {
      logger = compiler.getInfrastructureLogger('mergeLocalesPlugin');
      logger.log('Merging locales...');

      // Read top-level locale directories from upstream and overrides
      const upstreamDirs = (await readdir(upstreamDir, { withFileTypes: true }).catch(() => []))
        .filter(d => d.isDirectory()).map(d => d.name);

      const overridesDirs = (await readdir(overridesDir, { withFileTypes: true }).catch(() => []))
        .filter(d => d.isDirectory()).map(d => d.name);

      // Union of all locale names
      const locales = Array.from(new Set([...upstreamDirs, ...overridesDirs]));

      for (const locale of locales) {
        const upstreamLocalePath = path.join(upstreamDir, locale);
        const overridesLocalePath = path.join(overridesDir, locale);
        const outLocalePath = path.join(outDir, locale);

        // ensure output directory exists
        await mkdir(outLocalePath, { recursive: true });

        // list files in each locale folder
        const upstreamFiles = (await readdir(upstreamLocalePath, { withFileTypes: true }).catch(() => []))
          .filter(f => f.isFile()).map(f => f.name);

        const overridesFiles = (await readdir(overridesLocalePath, { withFileTypes: true }).catch(() => []))
          .filter(f => f.isFile()).map(f => f.name);

        // union of file names
        const files = Array.from(new Set([...upstreamFiles, ...overridesFiles]));

        for (const fileName of files) {
          const upstreamFile = path.join(upstreamLocalePath, fileName);
          const overridesFile = path.join(overridesLocalePath, fileName);
          const outFile = path.join(outLocalePath, fileName);

          // read JSON content if file exists, otherwise fall back to {}
          const upstreamJson = await readFileContents(upstreamFile).catch(() => ({}));
          const overridesJson = await readFileContents(overridesFile).catch(() => ({}));

          // keys from overridesJson replace upstreamJson keys
          const merged = Object.assign({}, upstreamJson, overridesJson);

          await writeFile(outFile, JSON.stringify(merged, null, 2) + '\n', 'utf8');
        }
      }

      logger.info(`Locales merged into ${outDir}`);
      callback();
    });
  }
}

module.exports = mergeLocalesPlugin;