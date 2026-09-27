import { CathedralStage } from './cathedral.js';
import { ForgeStage } from './forge.js';
import { CavesStage } from './caves.js';
import { BastionStage } from './bastion.js';

// The boss arenas, in the order of the stage select.
export const STAGES = [
  ['cathedral', CathedralStage],
  ['forge', ForgeStage],
  ['caves', CavesStage],
  ['bastion', BastionStage],
];
