// Release script: for every content pack in packages/*, generate its typed
// bridge package (@rifted/<namespace>) from the built gcf.json and publish it
// to npm with provenance. The content sources themselves are private and
// never published — only the bridges are.
//
// `bun run build` must run first (the workflow does this) so each pack has a
// dist/gcf.json. The bridge version tracks the content pack's package.json
// version (managed by changesets). Already-published versions are skipped, so
// the script is safe to re-run.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const REPO = 'https://github.com/rifted-game/content.git'
const packagesDir = join(process.cwd(), 'packages')

function run(cmd: string, args: string[], cwd?: string): void {
	const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd })
	if (res.status !== 0) {
		console.error(`Command failed: ${cmd} ${args.join(' ')}`)
		process.exit(1)
	}
}

/** is this exact version already on npm? makes the release idempotent */
function alreadyPublished(name: string, version: string): boolean {
	const res = spawnSync('npm', ['view', `${name}@${version}`, 'version'], {
		encoding: 'utf-8',
		shell: true,
	})
	return res.status === 0 && res.stdout.trim() === version
}

let published = 0
for (const dir of readdirSync(packagesDir)) {
	const pkgDir = join(packagesDir, dir)
	const manifestPath = join(pkgDir, 'package.json')
	const gcfPath = join(pkgDir, 'dist', 'gcf.json')
	if (!existsSync(manifestPath) || !existsSync(gcfPath)) continue

	const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
	const version: string = manifest.version
	const namespace: string = JSON.parse(readFileSync(gcfPath, 'utf-8')).namespace
	const bridgeName = `@rifted/${namespace}`

	if (alreadyPublished(bridgeName, version)) {
		console.log(`Skipping ${bridgeName}@${version} — already on npm`)
		continue
	}

	// generate the bridge into a temp dir
	const out = mkdtempSync(join(tmpdir(), `rifted-bridge-${namespace}-`))
	console.log(`Generating ${bridgeName}@${version} from ${dir}/dist/gcf.json…`)
	run('bun', ['x', 'rifted', 'typegen', gcfPath, '--package', '--name', bridgeName, '--out', out])

	// stamp the publishable manifest: version from the content pack, provenance,
	// repository (required for --provenance) and public access
	const bridgeManifestPath = join(out, 'package.json')
	const bridge = JSON.parse(readFileSync(bridgeManifestPath, 'utf-8'))
	bridge.version = version
	bridge.repository = { type: 'git', url: `git+${REPO}`, directory: `packages/${dir}` }
	bridge.publishConfig = { access: 'public', provenance: true }
	writeFileSync(bridgeManifestPath, `${JSON.stringify(bridge, null, '\t')}\n`)

	// No --provenance: sigstore only attests public source repos, and this repo
	// is private. The bridge is typed metadata (refs/handles), not executable
	// code, so provenance adds little here. Re-add it if the repo goes public.
	console.log(`Publishing ${bridgeName}@${version}…`)
	run('npm', ['publish', '--access', 'public'], out)
	published++

	// tag the release so the repo history points at each published bridge
	run('git', ['tag', `${bridgeName}@${version}`])
}

if (published === 0) {
	console.log('Nothing to publish — every bridge version is already on npm.')
} else {
	console.log(`Published ${published} bridge package(s).`)
	run('git', ['push', '--tags'])
}
