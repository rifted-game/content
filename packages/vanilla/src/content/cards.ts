// The starter cards: three attacks, two guards, and the emberseal craft.

import { block, content, dmg } from '@rifted/sdk'

import { berserk, surge, weaver } from './core'

export const cards = content()

const attack = (id: string, name: string, base: number, art?: Record<string, string>) =>
	cards.card(id, {
		name,
		description: 'Deal { $dmg } damage.',
		cooldown: 1,
		scale: 'flat',
		tags: ['attack'],
		affinity: berserk,
		params: { base },
		render: ({ params }) => ({ dmg: params.base.scaled() }),
		...(art ? { art } : {}),
		onPlay({ params }) {
			dmg('selected', params.base)
		},
	})

const guard = (id: string, name: string, base: number) =>
	cards.card(id, {
		name,
		description: 'Gain { $block } block.',
		cooldown: 1,
		scale: 'flat',
		affinity: weaver,
		params: { base },
		render: ({ params }) => ({ block: params.base.scaled() }),
		onPlay({ params }) {
			block(params.base)
		},
	})

export const strike = attack('strike', 'Strike', 6, {
	icon: 'assets/cards/strike.png',
	sound: 'assets/sfx/slash.ogg',
	glow: '#c0392b',
})
export const jab = attack('jab', 'Jab', 4)
export const bash = attack('bash', 'Bash', 9)
export const guardCard = guard('guard', 'Guard', 5)
export const ward = guard('ward', 'Ward', 8)

// craft: sacrifice this card to seal surge onto another one
export const emberseal = cards.card('emberseal', {
	name: 'Emberseal',
	description: 'Seal surge onto another card.',
	cooldown: 1,
	seal: surge,
	affinity: weaver,
	art: { icon: 'assets/cards/emberseal.png' },
	onPlay() {
		block(0)
	},
})
