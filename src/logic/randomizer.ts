import type { DominionCard, Expansion, RandomizedKingdom, RandomizerOptions } from '../types/cards';

type RandomSource = () => number;

const KINGDOM_SIZE = 10;
const MAX_EVENTS = 2;
export const EXPANSION_DISPLAY_ORDER: Expansion[] = [
  'Base',
  'Intrigue',
  'Prosperity',
  'Seaside',
  'Rising Sun',
  'Renaissance'
];

export function getAvailableExpansions(cards: DominionCard[]): Expansion[] {
  return Array.from(new Set(cards.map((card) => card.set))).sort(compareExpansions);
}

export function filterCardsByExpansions(cards: DominionCard[], expansions: Expansion[]): DominionCard[] {
  const selected = new Set(expansions);
  return cards.filter((card) => selected.has(card.set));
}

export function randomizeKingdom(
  cards: DominionCard[],
  options: RandomizerOptions,
  random: RandomSource = Math.random
): RandomizedKingdom {
  const eligibleCards = filterCardsByExpansions(cards, options.selectedExpansions);
  const kingdomPool = eligibleCards.filter((card) => card.section === 'Kingdom');

  if (kingdomPool.length < KINGDOM_SIZE) {
    throw new Error(`At least ${KINGDOM_SIZE} Kingdom cards are required for the selected expansions.`);
  }

  const kingdomCards = drawUnique(kingdomPool, KINGDOM_SIZE, random);
  const events = chooseEvents(eligibleCards, options.eventChance, random);
  const prophecy = chooseProphecyIfNeeded(eligibleCards, kingdomCards, random);
  const useColonies = rollPercent(options.bigMoneyChance, random);

  return {
    kingdomCards,
    events,
    prophecy,
    useColonies,
    setupRequirements: determineSetupRequirements({ kingdomCards, events, prophecy, useColonies })
  };
}

export function rerollKingdomCard(
  cards: DominionCard[],
  current: RandomizedKingdom,
  cardName: string,
  options: RandomizerOptions,
  random: RandomSource = Math.random
): RandomizedKingdom {
  const eligibleCards = filterCardsByExpansions(cards, options.selectedExpansions);
  const currentNames = new Set(current.kingdomCards.map((card) => card.name));
  currentNames.delete(cardName);

  const replacementPool = eligibleCards.filter(
    (card) => card.section === 'Kingdom' && !currentNames.has(card.name) && card.name !== cardName
  );

  if (replacementPool.length === 0) {
    return current;
  }

  const replacement = drawUnique(replacementPool, 1, random)[0];
  const kingdomCards = current.kingdomCards.map((card) => (card.name === cardName ? replacement : card));
  const prophecy = chooseProphecyAfterReroll(eligibleCards, kingdomCards, current.prophecy, random);

  return {
    ...current,
    kingdomCards,
    prophecy,
    setupRequirements: determineSetupRequirements({
      kingdomCards,
      events: current.events,
      prophecy,
      useColonies: current.useColonies
    })
  };
}

export function determineSetupRequirements(result: Omit<RandomizedKingdom, 'setupRequirements'>): string[] {
  const requirements = new Set<string>();

  for (const card of result.kingdomCards) {
    for (const setup of card.setup ?? []) {
      if (setup && setup.toLowerCase() !== 'none') {
        requirements.add(normalizeSetupLabel(setup));
      }
    }
  }

  if (result.useColonies) {
    requirements.add('Use Platinum and Colony');
  }

  if (result.events.length > 0) {
    requirements.add('Use selected Event cards');
  }

  if (result.prophecy) {
    requirements.add(`Use Prophecy: ${result.prophecy.name}`);
    requirements.add('Use Sun tokens for Omens and Prophecy');
  }

  return Array.from(requirements).sort();
}

function chooseEvents(cards: DominionCard[], chance: number, random: RandomSource): DominionCard[] {
  const eventPool = cards.filter((card) => card.section === 'Event');
  const desiredCount = Array.from({ length: MAX_EVENTS }).filter(() => rollPercent(chance, random)).length;

  if (desiredCount === 0 || eventPool.length === 0) {
    return [];
  }

  return drawUnique(eventPool, Math.min(desiredCount, MAX_EVENTS, eventPool.length), random);
}

function chooseProphecyIfNeeded(
  cards: DominionCard[],
  kingdomCards: DominionCard[],
  random: RandomSource
): DominionCard | null {
  if (!kingdomCards.some((card) => card.types.includes('Omen'))) {
    return null;
  }

  const prophecyPool = cards.filter((card) => card.section === 'Prophecy');
  return prophecyPool.length > 0 ? drawUnique(prophecyPool, 1, random)[0] : null;
}

function chooseProphecyAfterReroll(
  cards: DominionCard[],
  kingdomCards: DominionCard[],
  currentProphecy: DominionCard | null,
  random: RandomSource
): DominionCard | null {
  const hasOmen = kingdomCards.some((card) => card.types.includes('Omen'));

  if (!hasOmen) {
    return null;
  }

  if (currentProphecy) {
    return currentProphecy;
  }

  return chooseProphecyIfNeeded(cards, kingdomCards, random);
}

function drawUnique<T>(items: T[], count: number, random: RandomSource): T[] {
  const pool = [...items];
  const drawn: T[] = [];

  while (drawn.length < count && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    drawn.push(pool.splice(index, 1)[0]);
  }

  return drawn;
}

function rollPercent(percent: number, random: RandomSource): boolean {
  return random() * 100 < clamp(percent, 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalizeSetupLabel(label: string): string {
  return label === 'Villager' ? 'Villagers' : label;
}

function compareExpansions(left: Expansion, right: Expansion): number {
  const leftIndex = getExpansionSortIndex(left);
  const rightIndex = getExpansionSortIndex(right);

  if (leftIndex !== rightIndex) {
    return leftIndex - rightIndex;
  }

  return left.localeCompare(right);
}

function getExpansionSortIndex(expansion: Expansion): number {
  const index = EXPANSION_DISPLAY_ORDER.indexOf(expansion);
  return index === -1 ? EXPANSION_DISPLAY_ORDER.length : index;
}
