export type Expansion =
  | 'Base'
  | 'Intrigue'
  | 'Prosperity'
  | 'Seaside'
  | 'Rising Sun'
  | 'Renaissance'
  | string;

export type CardSection =
  | 'Kingdom'
  | 'Event'
  | 'Prophecy'
  | 'Artifact'
  | 'Project'
  | 'Projects'
  | 'Landmark'
  | 'Way'
  | 'Ally'
  | 'Trait'
  | string;

export interface DominionCard {
  set: Expansion;
  edition: string;
  section: CardSection;
  name: string;
  coin_cost: number | null;
  debt_cost: number | null;
  types: string[];
  setup?: string[];
}

export interface RandomizerOptions {
  selectedExpansions: Expansion[];
  bigMoneyChance: number;
  eventChance: number;
}

export interface RandomizedKingdom {
  kingdomCards: DominionCard[];
  events: DominionCard[];
  prophecy: DominionCard | null;
  useColonies: boolean;
  setupRequirements: string[];
}
