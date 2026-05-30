interface ChanceControlsProps {
  bigMoneyChance: number;
  eventChance: number;
  onBigMoneyChanceChange: (chance: number) => void;
  onEventChanceChange: (chance: number) => void;
}

export function ChanceControls({
  bigMoneyChance,
  eventChance,
  onBigMoneyChanceChange,
  onEventChanceChange
}: ChanceControlsProps) {
  return (
    <section className="panel controls-panel" aria-labelledby="chance-heading">
      <div className="section-heading">
        <h2 id="chance-heading">Chances</h2>
      </div>
      <ChanceSlider
        id="big-money"
        label="Platinum / Colony"
        value={bigMoneyChance}
        onChange={onBigMoneyChanceChange}
      />
      <ChanceSlider id="events" label="Events" value={eventChance} onChange={onEventChanceChange} />
    </section>
  );
}

interface ChanceSliderProps {
  id: string;
  label: string;
  value: number;
  onChange: (chance: number) => void;
}

function ChanceSlider({ id, label, value, onChange }: ChanceSliderProps) {
  return (
    <label className="slider-row" htmlFor={id}>
      <span>
        {label}
        <strong>{value}%</strong>
      </span>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
