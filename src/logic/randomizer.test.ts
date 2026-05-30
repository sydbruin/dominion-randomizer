import { describe, expect, it } from 'vitest';
import { randomizeKingdom, rerollKingdomCard } from './randomizer';
import type { DominionCard } from '../types/cards';

const kingdomCards: DominionCard[] = Array.from({ length: 12 }, (_, index) => ({
  set: 'Base',
  edition: 'test',
  section: 'Kingdom',
  name: `Card ${index + 1}`,
  coin_cost: index + 2,
  debt_cost: 0,
  types: ['Action'],
  setup: ['None']
}));

const cards: DominionCard[] = [
  ...kingdomCards,
  {
    set: 'Base',
    edition: 'test',
    section: 'Kingdom',
    name: 'Witchy',
    coin_cost: 5,
    debt_cost: 0,
    types: ['Action', 'Attack', 'Omen'],
    setup: ['Curse']
  },
  { set: 'Base', edition: 'test', section: 'Event', name: 'Festival Day', coin_cost: 4, debt_cost: 0, types: ['Event'] },
  { set: 'Base', edition: 'test', section: 'Event', name: 'Market Day', coin_cost: 5, debt_cost: 0, types: ['Event'] },
  { set: 'Base', edition: 'test', section: 'Event', name: 'Trade Day', coin_cost: 6, debt_cost: 0, types: ['Event'] },
  { set: 'Base', edition: 'test', section: 'Prophecy', name: 'Good Times', coin_cost: null, debt_cost: null, types: ['Prophecy'] }
];

describe('randomizeKingdom', () => {
  it('draws 10 unique kingdom cards from selected expansions', () => {
    const result = randomizeKingdom(cards, { selectedExpansions: ['Base'], bigMoneyChance: 0, eventChance: 0 }, () => 0);

    expect(result.kingdomCards).toHaveLength(10);
    expect(new Set(result.kingdomCards.map((card) => card.name)).size).toBe(10);
    expect(result.events).toHaveLength(0);
    expect(result.useColonies).toBe(false);
  });

  it('caps events at two and applies big money chance', () => {
    const result = randomizeKingdom(cards, { selectedExpansions: ['Base'], bigMoneyChance: 100, eventChance: 100 }, () => 0);

    expect(result.events).toHaveLength(2);
    expect(result.useColonies).toBe(true);
    expect(result.setupRequirements).toContain('Use Platinum and Colony');
    expect(result.setupRequirements).toContain('Use selected Event cards');
  });

  it('chooses a prophecy when an Omen card is selected', () => {
    const result = randomizeKingdom(cards, { selectedExpansions: ['Base'], bigMoneyChance: 0, eventChance: 0 }, () => 0.99);

    expect(result.kingdomCards.some((card) => card.types.includes('Omen'))).toBe(true);
    expect(result.prophecy?.name).toBe('Good Times');
    expect(result.setupRequirements).toContain('Use Prophecy: Good Times');
  });

  it('rerolls one kingdom card without duplicating the existing kingdom', () => {
    const result = randomizeKingdom(cards, { selectedExpansions: ['Base'], bigMoneyChance: 0, eventChance: 0 }, () => 0);
    const rerolled = rerollKingdomCard(cards, result, result.kingdomCards[0].name, {
      selectedExpansions: ['Base'],
      bigMoneyChance: 0,
      eventChance: 0
    });

    expect(rerolled.kingdomCards).toHaveLength(10);
    expect(new Set(rerolled.kingdomCards.map((card) => card.name)).size).toBe(10);
    expect(rerolled.kingdomCards.map((card) => card.name)).not.toContain(result.kingdomCards[0].name);
  });
});
