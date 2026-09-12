# SpaceRing

Max Margorskyi’s personal website: an interactive Three.js space station and portfolio. The homepage includes a `.works` link to the separate portfolio site.

## Local development

Install Node.js and npm, then run these commands from the project folder:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173). The development server also listens on the local network. Append `#debug` to enable the scene controls.

```sh
npm run build
```

The production build is written to `dist/`, including source maps. The current project has no automated test or lint scripts. Build and browser checks are the available validation steps.

## Project structure

- `src/index.html` and `src/style.css`: page metadata, markup, and styles.
- `src/script.js`: application entry point.
- `src/Experience/`: scene lifecycle, camera, renderer, utilities, shaders, and world objects.
- `src/Experience/sources.js`: texture resource definitions.
- `static/`: portfolio textures and bundled Draco codecs, copied into the build.
- `vite.config.js`: Vite configuration with GLSL imports, `src/` as the root, and `static/` as public assets.

## Deployment

The existing `npm run deploy` command invokes `vercel --prod` and publishes a production deployment. Only run it after intentionally selecting and verifying the Vercel account and project. Local Vercel linkage is stored in `.vercel/`, which is excluded from Git and was not included in this project copy. Building locally does not deploy the site.

## Source and attribution

This project began with a Three.js Journey exercise starter. The project name and documentation describe the personal website; they do not transfer ownership of course material, libraries, or portfolio imagery.

Bundled Draco files are third-party assets. Preserve their notices and [Draco documentation](static/draco/README.md), which links to the Apache 2.0 license. Dependencies retain their respective licenses. No blanket license is granted here for third-party code or artwork.

## Repository hygiene

Git excludes dependencies, build output, local Vercel state, environment files, private key files, logs, and operating-system metadata. Keep credentials out of source and public assets. Everything in `static/` is shipped publicly, and production source maps expose application source. Portfolio imagery remains part of the site; its redistribution rights should be established before publishing a public source repository.
