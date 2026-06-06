import { describe, expect, it } from 'vitest';
import { randomizeKingdom, rerollEvent, rerollKingdomCard, rerollProject, rerollProphecy } from './randomizer';
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
  { set: 'Base', edition: 'test', section: 'Projects', name: 'City Gate', coin_cost: 3, debt_cost: null, types: ['Projects'] },
  { set: 'Base', edition: 'test', section: 'Projects', name: 'Pageant', coin_cost: 3, debt_cost: null, types: ['Projects'] },
  { set: 'Base', edition: 'test', section: 'Projects', name: 'Fair', coin_cost: 4, debt_cost: null, types: ['Projects'] },
  { set: 'Base', edition: 'test', section: 'Prophecy', name: 'Good Times', coin_cost: null, debt_cost: null, types: ['Prophecy'] },
  { set: 'Base', edition: 'test', section: 'Prophecy', name: 'Hard Times', coin_cost: null, debt_cost: null, types: ['Prophecy'] }
];

describe('randomizeKingdom', () => {
  it('draws 10 unique kingdom cards from selected expansions', () => {
    const result = randomizeKingdom(
      cards,
      { selectedExpansions: ['Base'], bigMoneyChance: 0, eventChance: 0, projectChance: 0 },      undefined,      () => 0
    );

    expect(result.kingdomCards).toHaveLength(10);
    expect(new Set(result.kingdomCards.map((card) => card.name)).size).toBe(10);
    expect(result.events).toHaveLength(0);
    expect(result.projects).toHaveLength(0);
    expect(result.useColonies).toBe(false);
  });

  it('caps events at two, projects at two, and events plus projects at three', () => {
    const result = randomizeKingdom(
      cards,
      { selectedExpansions: ['Base'], bigMoneyChance: 100, eventChance: 100, projectChance: 100 },
      undefined,
      () => 0
    );

    expect(result.events.length).toBeLessThanOrEqual(2);
    expect(result.projects.length).toBeLessThanOrEqual(2);
    expect(result.events.length + result.projects.length).toBe(3);
    expect(result.useColonies).toBe(false);
    expect(result.setupRequirements).not.toContain('Use Platinum and Colony');
    expect(result.setupRequirements).toContain('Use selected Project cards');
  });

  it('chooses a prophecy when an Omen card is selected', () => {
    const result = randomizeKingdom(
      cards,
      { selectedExpansions: ['Base'], bigMoneyChance: 0, eventChance: 0, projectChance: 0 },
      undefined,
      () => 0.99
    );

    expect(result.kingdomCards.some((card) => card.types.includes('Omen'))).toBe(true);
    expect(result.prophecy?.name).toBe('Hard Times');
    expect(result.setupRequirements).toContain('Use Prophecy: Hard Times');
  });

  it('rerolls one kingdom card without duplicating the existing kingdom', () => {
    const result = randomizeKingdom(
      cards,
      { selectedExpansions: ['Base'], bigMoneyChance: 0, eventChance: 0, projectChance: 0 },
      undefined,
      () => 0
    );
    const rerolled = rerollKingdomCard(cards, result, result.kingdomCards[0].name, {
      selectedExpansions: ['Base'],
      bigMoneyChance: 0,
      eventChance: 0,
      projectChance: 0
    });

    expect(rerolled.kingdomCards).toHaveLength(10);
    expect(new Set(rerolled.kingdomCards.map((card) => card.name)).size).toBe(10);
    expect(rerolled.kingdomCards.map((card) => card.name)).not.toContain(result.kingdomCards[0].name);
  });

  it('rerolls events, projects, and prophecy from their own pools', () => {
    const result = randomizeKingdom(
      cards,
      { selectedExpansions: ['Base'], bigMoneyChance: 0, eventChance: 100, projectChance: 100 },
      undefined,
      () => 0
    );
    const options = { selectedExpansions: ['Base'], bigMoneyChance: 0, eventChance: 100, projectChance: 100 };

    const eventReroll = rerollEvent(cards, result, result.events[0].name, options, () => 0.99);
    expect(eventReroll.events).toHaveLength(result.events.length);
    expect(new Set(eventReroll.events.map((card) => card.name)).size).toBe(result.events.length);
    expect(eventReroll.events.map((card) => card.name)).not.toContain(result.events[0].name);
    expect(eventReroll.events.every((card) => card.section === 'Event')).toBe(true);

    const projectReroll = rerollProject(cards, result, result.projects[0].name, options, () => 0.99);
    expect(projectReroll.projects).toHaveLength(result.projects.length);
    expect(new Set(projectReroll.projects.map((card) => card.name)).size).toBe(result.projects.length);
    expect(projectReroll.projects.map((card) => card.name)).not.toContain(result.projects[0].name);
    expect(projectReroll.projects.every((card) => card.section === 'Projects')).toBe(true);

    const prophecyReroll = rerollProphecy(
      cards,
      { ...result, prophecy: cards.find((card) => card.name === 'Good Times') ?? null },
      options,
      () => 0
    );
    expect(prophecyReroll.prophecy?.name).toBe('Hard Times');
    expect(prophecyReroll.setupRequirements).toContain('Use Prophecy: Hard Times');
  });
});
