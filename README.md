# rifted content

First-party content for [Rifted](https://github.com/rifted-game/rifted),
authored with [`@rifted/sdk`](https://www.npmjs.com/package/@rifted/sdk).

Each pack under `packages/*` is an ordinary mod: it builds a `gcf.json` the
engine loads and a `.rmod` for distribution. On release, every pack also
publishes a **typed bridge** to npm (`@rifted/<namespace>`) so other mods can
depend on its content with full type-safety:

```ts
import * as vanilla from '@rifted/vanilla'

const pkg = Pkg('mymod', { requires: [vanilla] })
pkg.card('zealot', { affinity: vanilla.affinities.berserk, /* ... */ })
```

## packages

- [`packages/vanilla`](./packages/vanilla) — the base game (`vanilla:` namespace),
  published as the [`@rifted/vanilla`](https://www.npmjs.com/package/@rifted/vanilla) bridge

## development

```bash
bun install
bun run build      # each pack → dist/gcf.json (+ dist/locales/*.ftl)
bun run pack       # each pack → dist/<name>-<version>.rmod
bun run typecheck
```

The `.rmod` archives produced by `bun run pack` are what the game server
loads. CI uploads them as build artifacts on every push.

## releasing

Versioning uses [changesets](https://github.com/changesets/changesets):

1. `bun changeset` — pick the affected pack(s) and bump type
2. commit the generated `.changeset/*.md`
3. merge to `main`; a "release content" PR is opened automatically

Merging that PR builds each pack, generates its typed bridge and publishes it
to npm (`scripts/publish.ts`). The bridge version tracks the pack's
`package.json` version; the GCF document version (`Pkg({ version })`, what mods
compare against in `requires`) is bumped by hand when the content gains
something mods may depend on.

## license

Code is MIT (see [LICENSE](./LICENSE)). Game assets under `packages/*/assets`
are not covered by it.
