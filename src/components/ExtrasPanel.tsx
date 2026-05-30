import type { DominionCard, RandomizedKingdom } from '../types/cards';
import { formatCost } from './CardGrid';

interface ExtrasPanelProps {
  result: RandomizedKingdom;
}

export function ExtrasPanel({ result }: ExtrasPanelProps) {
  return (
    <section className="panel" aria-labelledby="extras-heading">
      <div className="section-heading">
        <h2 id="extras-heading">Additional Cards</h2>
      </div>
      <div className="extras-list">
        {result.useColonies && <ExtraItem label="Big Money" value="Platinum and Colony" />}
        {result.events.map((event) => (
          <ExtraCard key={event.name} label="Event" card={event} />
        ))}
        {result.prophecy && <ExtraCard label="Prophecy" card={result.prophecy} />}
        {!result.useColonies && result.events.length === 0 && !result.prophecy && (
          <p className="muted">No additional cards selected.</p>
        )}
      </div>
    </section>
  );
}

function ExtraCard({ label, card }: { label: string; card: DominionCard }) {
  return <ExtraItem label={label} value={`${card.name} (${formatCost(card)})`} />;
}

function ExtraItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="extra-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
