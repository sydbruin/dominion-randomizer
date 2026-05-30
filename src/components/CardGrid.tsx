import { RefreshCw } from 'lucide-react';
import type { DominionCard } from '../types/cards';

interface CardGridProps {
  cards: DominionCard[];
  onRerollCard: (cardName: string) => void;
}

const EXPANSION_DISPLAY_ORDER = ['Base', 'Intrigue', 'Prosperity', 'Seaside', 'Rising Sun', 'Renaissance'];

export function CardGrid({ cards, onRerollCard }: CardGridProps) {
  const groupedCards = groupCardsByExpansion(cards);

  return (
    <section className="panel kingdom-panel" aria-labelledby="kingdom-heading">
      <div className="section-heading">
        <h2 id="kingdom-heading">Kingdom</h2>
        <span>{cards.length} cards</span>
      </div>
      <div className="kingdom-groups">
        {groupedCards.map(([expansion, expansionCards]) => (
          <div className="kingdom-group" key={expansion}>
            <h3>{expansion}</h3>
            <div className="card-grid">
              {expansionCards.map((card) => (
                <article className="kingdom-card" key={card.name}>
                  <div>
                    <div className="card-meta">{card.set}</div>
                    <h4>{card.name}</h4>
                  </div>
                  <div className="type-list">
                    {card.types.map((type) => (
                      <span key={type}>{type}</span>
                    ))}
                  </div>
                  <div className="card-footer">
                    <span>{formatCost(card)}</span>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => onRerollCard(card.name)}
                      aria-label={`Reroll ${card.name}`}
                      title={`Reroll ${card.name}`}
                    >
                      <RefreshCw size={16} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function groupCardsByExpansion(cards: DominionCard[]): Array<[string, DominionCard[]]> {
  const groups = new Map<string, DominionCard[]>();

  for (const card of cards) {
    groups.set(card.set, [...(groups.get(card.set) ?? []), card]);
  }

  return Array.from(groups.entries()).sort(([left], [right]) => {
    const leftIndex = getExpansionSortIndex(left);
    const rightIndex = getExpansionSortIndex(right);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.localeCompare(right);
  });
}

function getExpansionSortIndex(expansion: string): number {
  const index = EXPANSION_DISPLAY_ORDER.indexOf(expansion);
  return index === -1 ? EXPANSION_DISPLAY_ORDER.length : index;
}

export function formatCost(card: DominionCard): string {
  const coinCost = card.coin_cost === null ? '' : `$${card.coin_cost}`;
  const debtCost = card.debt_cost ? `${card.debt_cost} debt` : '';
  return [coinCost, debtCost].filter(Boolean).join(' + ') || 'No cost';
}
