// The vanilla package identity. Nothing else lives here, so importing it from
// any content file is side-effect-free.
//
// `version: 1` is the GCF document version — the integer mods compare against
// in `requires: [vanilla]`. The npm semver of the published @rifted/vanilla
// bridge is separate (managed by changesets); bump this only when the document
// gains content that mods may depend on.

import { Pkg } from '@rifted/sdk'

export const pkg = Pkg('vanilla', {
	version: 1,
	name: 'Rifted',
	semver: '0.1.0',
	authors: ['rifted'],
	defaultLocale: 'en',
})
