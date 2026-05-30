import type { Expansion } from '../types/cards';

interface ExpansionSelectorProps {
  expansions: Expansion[];
  selectedExpansions: Expansion[];
  onChange: (expansions: Expansion[]) => void;
}

export function ExpansionSelector({ expansions, selectedExpansions, onChange }: ExpansionSelectorProps) {
  const selected = new Set(selectedExpansions);

  function toggleExpansion(expansion: Expansion) {
    if (selected.has(expansion)) {
      onChange(selectedExpansions.filter((item) => item !== expansion));
      return;
    }

    onChange([...selectedExpansions, expansion]);
  }

  return (
    <section className="panel controls-panel" aria-labelledby="expansion-heading">
      <div className="section-heading">
        <h2 id="expansion-heading">Expansions</h2>
        <span>{selectedExpansions.length} selected</span>
      </div>
      <div className="expansion-grid">
        {expansions.map((expansion) => (
          <label className="check-row" key={expansion}>
            <input
              type="checkbox"
              checked={selected.has(expansion)}
              onChange={() => toggleExpansion(expansion)}
            />
            <span>{expansion}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
