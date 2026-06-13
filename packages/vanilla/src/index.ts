// Composition root: mount order = document order. Nothing is defined here.

import { cards } from './content/cards'
import { core } from './content/core'
import { world } from './content/world'
import { pkg } from './pkg'

pkg.use(core, cards, world)

export default pkg
