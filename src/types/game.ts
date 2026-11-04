/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ItemType =
  | 'x'
  | 'y'
  | 'weight_1'
  | 'weight_2'
  | 'weight_3'
  | 'weight_4'
  | 'weight_5'
  | 'weight_6'
  | 'weight_10'
  | 'item_a'
  | 'item_b';

export interface InventoryItemDefinition {
  type: ItemType;
  label: string;
  weight: number;
  isVariable?: boolean;
  varName?: 'x' | 'y';
  shape: 'box_x' | 'box_y' | 'gold_bar' | 'yellow_star' | 'green_crystal' | 'red_sphere' | 'blue_diamond' | 'silver_coin' | 'neon_battery';
  color: string;
  badgeColor: string;
  description: string;
}

export interface ScalePanItem {
  id: string;
  type: ItemType;
  label: string;
  weight: number; // if known or actual weight
  isMystery?: boolean;
  mysteryVar?: 'x' | 'y';
  icon?: string;
  color: string;
}

export interface PanState {
  xCount: number;
  yCount: number;
  constantWeight: number; // in kg or units
  itemsList?: ItemType[]; // optional explicit list of individual items
}

export interface ScaleState {
  id: string;
  title: string;
  subtitle?: string;
  leftPan: PanState;
  rightPan: PanState;
  targetBalanced?: boolean;
}

export type GameLevelId = 1 | 2 | 3 | 4 | 5 | 'sandbox';

export interface ChallengeProblem {
  id: string;
  levelId: GameLevelId;
  subLevelIndex: number;
  title: string;
  storyContext: string;
  secretX: number; // true hidden value of x
  secretY: number; // true hidden value of y
  unit: string; // 'kg', 'gram', 'ribu Rp'
  initialScales: {
    scale1: ScaleState;
    scale2?: ScaleState;
  };
  targetObjective: string;
  hints: string[];
  explanation: {
    title: string;
    steps: string[];
    conclusion: string;
  };
  // Specific to level 3 (elimination) & 4 (substitution)
  eliminationGuidance?: {
    multiplier1: number;
    multiplier2: number;
    eliminateVar: 'x' | 'y';
  };
  substitutionGuidance?: {
    isolatedVar: 'x' | 'y';
    expression: string;
  };
}

export type IslandZoneId =
  | 'beach'
  | 'number_forest'
  | 'equation_cave'
  | 'explorer_village'
  | 'math_temple'
  | 'treasure_cave';

export interface IslandZone {
  id: IslandZoneId;
  name: string;
  tagline: string;
  description: string;
  sealNumber?: number;
  color: string;
  accentColor: string;
  coordinates: { x: number; z: number };
}

export type EntityType = 'npc' | 'monolith' | 'chest' | 'graph_altar' | 'final_gate' | 'lore_stone' | 'coin';

export interface InteractableEntity {
  id: string;
  type: EntityType;
  zoneId: IslandZoneId;
  name: string;
  position: [number, number, number];
  interactionPrompt: string;
  missionLevel?: number; // 1 to 5
  description?: string;
  dialogue?: string[];
}

export interface GraphEquationProblem {
  id: string;
  title: string;
  storyContext: string;
  eq1: {
    label: string;
    a: number; // ax + by = c
    b: number;
    c: number;
    slopeIntercept: string; // y = mx + c format
    color: string;
  };
  eq2: {
    label: string;
    a: number;
    b: number;
    c: number;
    slopeIntercept: string;
    color: string;
  };
  intersectX: number;
  intersectY: number;
  hints: string[];
  explanation: string;
}

export interface PlayerStats {
  score: number;
  coins: number;
  level: number;
  xp: number;
  starsByLevel: Record<number, number>; // levelId -> stars (1-3)
  completedLevels: number[];
  badges: string[];
  totalCorrect: number;
  totalAttempts: number;
  hintsUsedCount: number;
  eliminationMasteryScore: number;
  substitutionMasteryScore: number;
  modelingMasteryScore: number;
  contextualMasteryScore: number;
  graphMasteryScore: number;
  playerName: string;
  sealsUnlocked: number[]; // [1, 2, 3, 4, 5]
  openedChests: string[];
  collectedCoinIds: string[];
  timeElapsedSeconds: number;
  currentZone: IslandZoneId;
}

export interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  iconName: string;
  requirement: string;
  color: string;
}
