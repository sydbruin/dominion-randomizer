interface SetupPanelProps {
  requirements: string[];
}

export function SetupPanel({ requirements }: SetupPanelProps) {
  return (
    <section className="panel" aria-labelledby="setup-heading">
      <div className="section-heading">
        <h2 id="setup-heading">Setup</h2>
      </div>
      {requirements.length > 0 ? (
        <ul className="setup-list">
          {requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No extra setup required.</p>
      )}
    </section>
  );
}
