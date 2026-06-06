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
  rerollEvent,
  rerollKingdomCard,
  rerollProject,
  rerollProphecy
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
  const [projectChance, setProjectChance] = useState(35);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RandomizedKingdom | null>(null);
  const [chosenCards, setChosenCards] = useState<Record<string, number>>({});

  const options = useMemo(
    () => ({ selectedExpansions, bigMoneyChance, eventChance, projectChance }),
    [selectedExpansions, bigMoneyChance, eventChance, projectChance]
  );

  useEffect(() => {
    localStorage.setItem(SELECTED_EXPANSIONS_KEY, JSON.stringify(selectedExpansions));
  }, [selectedExpansions]);

  useEffect(() => {
    handleNewGameDay();
  }, []);

  function generateKingdom(history?: Record<string, number>) {
    try {
      setError(null);
      setResult(randomizeKingdom(cards, options, history));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to generate a Kingdom.');
    }
  }

  function getResultNames(result: RandomizedKingdom) {
    const names = new Set<string>();

    result.kingdomCards.forEach((card) => names.add(card.name));
    result.events.forEach((card) => names.add(card.name));
    result.projects.forEach((card) => names.add(card.name));
    if (result.prophecy) {
      names.add(result.prophecy.name);
    }

    return Array.from(names);
  }

  function handleNewGameDay() {
    setChosenCards({});
    generateKingdom();
  }

  function handleRerollKingdomSet() {
    if (!result) {
      return;
    }

    const nextHistory = { ...chosenCards };
    getResultNames(result).forEach((name) => {
      nextHistory[name] = (nextHistory[name] ?? 0) + 1;
    });

    setChosenCards(nextHistory);
    generateKingdom(nextHistory);
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

  function handleRerollEvent(cardName: string) {
    if (!result) {
      return;
    }

    try {
      setError(null);
      setResult(rerollEvent(cards, result, cardName, options));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to reroll that event.');
    }
  }

  function handleRerollProject(cardName: string) {
    if (!result) {
      return;
    }

    try {
      setError(null);
      setResult(rerollProject(cards, result, cardName, options));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to reroll that project.');
    }
  }

  function handleRerollProphecy() {
    if (!result) {
      return;
    }

    try {
      setError(null);
      setResult(rerollProphecy(cards, result, options));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to reroll that prophecy.');
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p>Dominion</p>
          <h1>Kingdom Randomizer</h1>
        </div>
        <button className="primary-button" type="button" onClick={handleNewGameDay}>
          <Dices size={18} aria-hidden="true" />
          New Game Day
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
            projectChance={projectChance}
            onBigMoneyChanceChange={setBigMoneyChance}
            onEventChanceChange={setEventChance}
            onProjectChanceChange={setProjectChance}
          />
          <button className="secondary-button" type="button" onClick={handleRerollKingdomSet}>
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
                <ExtrasPanel
                  result={result}
                  onRerollEvent={handleRerollEvent}
                  onRerollProject={handleRerollProject}
                  onRerollProphecy={handleRerollProphecy}
                />
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
