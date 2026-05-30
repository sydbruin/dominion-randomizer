import { useEffect, useMemo, useState } from 'react';
import { Dices, RefreshCw } from 'lucide-react';
import rawCards from '../cards.json';
import { CardGrid } from './components/CardGrid';
import { ChanceControls } from './components/ChanceControls';
import { ExpansionSelector } from './components/ExpansionSelector';
import { ExtrasPanel } from './components/ExtrasPanel';
import { SetupPanel } from './components/SetupPanel';
import {
  getAvailableExpansions,
  randomizeKingdom,
  rerollKingdomCard
} from './logic/randomizer';
import type { DominionCard, Expansion, RandomizedKingdom } from './types/cards';

const cards = rawCards as DominionCard[];
const SELECTED_EXPANSIONS_KEY = 'dominion.selectedExpansions';
const DEFAULT_EXPANSIONS: Expansion[] = ['Base', 'Intrigue', 'Prosperity', 'Seaside', 'Rising Sun', 'Renaissance'];

function App() {
  const availableExpansions = useMemo(() => getAvailableExpansions(cards), []);
  const [selectedExpansions, setSelectedExpansions] = useState<Expansion[]>(() => {
    const saved = localStorage.getItem(SELECTED_EXPANSIONS_KEY);
    if (!saved) {
      return DEFAULT_EXPANSIONS.filter((expansion) => availableExpansions.includes(expansion));
    }

    try {
      const parsed = JSON.parse(saved) as Expansion[];
      return parsed.filter((expansion) => availableExpansions.includes(expansion));
    } catch {
      return DEFAULT_EXPANSIONS.filter((expansion) => availableExpansions.includes(expansion));
    }
  });
  const [bigMoneyChance, setBigMoneyChance] = useState(30);
  const [eventChance, setEventChance] = useState(35);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RandomizedKingdom | null>(null);

  const options = useMemo(
    () => ({ selectedExpansions, bigMoneyChance, eventChance }),
    [selectedExpansions, bigMoneyChance, eventChance]
  );

  useEffect(() => {
    localStorage.setItem(SELECTED_EXPANSIONS_KEY, JSON.stringify(selectedExpansions));
  }, [selectedExpansions]);

  useEffect(() => {
    generateKingdom();
  }, []);

  function generateKingdom() {
    try {
      setError(null);
      setResult(randomizeKingdom(cards, options));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to generate a Kingdom.');
    }
  }

  function handleSelectedExpansionsChange(expansions: Expansion[]) {
    setSelectedExpansions(expansions);
  }

  function handleRerollCard(cardName: string) {
    if (!result) {
      return;
    }

    try {
      setError(null);
      setResult(rerollKingdomCard(cards, result, cardName, options));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to reroll that card.');
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p>Dominion</p>
          <h1>Kingdom Randomizer</h1>
        </div>
        <button className="primary-button" type="button" onClick={generateKingdom}>
          <Dices size={18} aria-hidden="true" />
          Generate
        </button>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <ExpansionSelector
            expansions={availableExpansions}
            selectedExpansions={selectedExpansions}
            onChange={handleSelectedExpansionsChange}
          />
          <ChanceControls
            bigMoneyChance={bigMoneyChance}
            eventChance={eventChance}
            onBigMoneyChanceChange={setBigMoneyChance}
            onEventChanceChange={setEventChance}
          />
          <button className="secondary-button" type="button" onClick={generateKingdom}>
            <RefreshCw size={17} aria-hidden="true" />
            Reroll Kingdom
          </button>
        </aside>

        <div className="results">
          {error && <div className="error-banner">{error}</div>}
          {result && (
            <>
              <CardGrid cards={result.kingdomCards} onRerollCard={handleRerollCard} />
              <div className="details-grid">
                <ExtrasPanel result={result} />
                <SetupPanel requirements={result.setupRequirements} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
