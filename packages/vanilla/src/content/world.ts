// Enemies, the encounters that field them, and the Act I map.

import { block, content, intent, phase } from '@rifted/sdk'

import { bash, jab, ward } from './cards'

export const world = content()

export const goblin = world.enemy('goblin', {
	name: 'Goblin',
	hp: 16,
	phases: [phase({ steps: [intent.attack(4)] })],
})

export const slime = world.enemy('slime', {
	name: 'Slime',
	hp: 12,
	phases: [phase({ steps: [intent.attack(3)] })],
})

export const brute = world.enemy('brute', {
	name: 'Brute',
	hp: 36,
	art: {
		sprite: 'assets/mobs/brute.png',
		anim_attack: 'brute_smash',
		sound_hit: 'assets/sfx/smash.ogg',
	},
	phases: [
		phase('wind-up', {
			until: ({ self }) => self.hpPercent.lt(40),
			steps: [intent.charge(), intent.attack(7)],
		}),
		phase('rage', {
			onEnter() {
				block(6)
			},
			steps: [intent.attack(9)],
		}),
	],
})

const loot = { pool: [bash, ward, jab], offer: 3, picks: 1 }
const goblinFight = world.encounter('goblin', { enemies: [goblin], loot })
const slimeFight = world.encounter('slime', { enemies: [slime], loot })
const bruteFight = world.encounter('brute', { enemies: [brute], loot: { ...loot, picks: 2 } })

world.map('act1', {
	name: 'Act I',
	floors: 6,
	width: 5,
	paths: 6,
	fanout: 3,
	rules: {
		combat: { weight: 60 },
		shop: { weight: 10, minFloor: 2, noAdjacent: true },
		rest: { weight: 8, minFloor: 2, noAdjacent: true },
		elite: { weight: 14, minFloor: 2, noAdjacent: true },
	},
	forceFloors: { [-1]: 'rest' },
	content: {
		combat: [goblinFight, slimeFight],
		elite: [bruteFight],
	},
	tethers: {
		pairwise: { chance: 0.9, min: 1, minFloor: 2 },
		anchor: 'boss',
	},
})
