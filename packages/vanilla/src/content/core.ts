// Shared definitions the cards reference: the two affinities and the surge
// seal. Mounts first so its ids exist before anything points at them.

import { content, on, replayCard } from '@rifted/sdk'

export const core = content()

export const berserk = core.affinity('berserk', {
	name: 'Berserk',
	art: { icon: 'assets/affinity/berserk.png', color: '#c0392b' },
})

export const weaver = core.affinity('weaver', {
	name: 'Weaver',
	art: { icon: 'assets/affinity/weaver.png', color: '#2980b9' },
})

// echo seal: replays its carrier card once per stack
export const surge = core.modifier('surge', {
	name: 'Surge',
	description: 'Echoes the sealed card { $echoes } more times.',
	render: ({ mod }) => ({ echoes: mod.stack }),
	hooks: [on('card_played', ({ mod }) => replayCard(mod.stack))],
})
