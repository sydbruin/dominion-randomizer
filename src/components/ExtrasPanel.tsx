import { RefreshCw } from 'lucide-react';
import type { DominionCard, RandomizedKingdom } from '../types/cards';
import { formatCost } from './CardGrid';

interface ExtrasPanelProps {
  result: RandomizedKingdom;
  onRerollEvent: (cardName: string) => void;
  onRerollProject: (cardName: string) => void;
  onRerollProphecy: () => void;
}

export function ExtrasPanel({ result, onRerollEvent, onRerollProject, onRerollProphecy }: ExtrasPanelProps) {
  return (
    <section className="panel" aria-labelledby="extras-heading">
      <div className="section-heading">
        <h2 id="extras-heading">Additional Cards</h2>
      </div>
      <div className="extras-list">
        {result.useColonies && <ExtraItem label="Big Money" value="Platinum and Colony" />}
        {result.events.map((event) => (
          <ExtraCard key={event.name} label="Event" card={event} onReroll={() => onRerollEvent(event.name)} />
        ))}
        {result.projects.map((project) => (
          <ExtraCard key={project.name} label="Project" card={project} onReroll={() => onRerollProject(project.name)} />
        ))}
        {result.prophecy && <ExtraCard label="Prophecy" card={result.prophecy} onReroll={onRerollProphecy} />}
        {!result.useColonies && result.events.length === 0 && result.projects.length === 0 && !result.prophecy && (
          <p className="muted">No additional cards selected.</p>
        )}
      </div>
    </section>
  );
}

function ExtraCard({ label, card, onReroll }: { label: string; card: DominionCard; onReroll: () => void }) {
  return <ExtraItem label={label} value={`${card.name} (${formatCost(card)})`} onReroll={onReroll} />;
}

function ExtraItem({ label, value, onReroll }: { label: string; value: string; onReroll?: () => void }) {
  return (
    <div className="extra-item">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {onReroll && (
        <button
          className="icon-button"
          type="button"
          onClick={onReroll}
          aria-label={`Reroll ${value}`}
          title={`Reroll ${value}`}
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
