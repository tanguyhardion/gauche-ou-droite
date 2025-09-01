import { component$, useSignal, useTask$, $ } from '@builder.io/qwik';
import { IdeaDisplay } from '../idea-display/idea-display';
import { ChoiceButton } from '../choice-button/choice-button';
import { fetchRandomIdea, markIdeaAsSeen, clearSeenIdeas, type Idea } from '../../lib/ideas-service';
import styles from './game-board.css?inline';

export const GameBoard = component$(() => {
  const currentIdea = useSignal<Idea | null>(null);
  const isLoading = useSignal(false);
  const error = useSignal<string>('');

  const loadNewIdea = $(async () => {
    isLoading.value = true;
    error.value = '';
    
    try {
      const idea = await fetchRandomIdea();
      currentIdea.value = idea;
      
      if (!idea) {
        error.value = 'Toutes les idées ont été vues ou aucune idée n\'est disponible.';
      }
    } catch (err) {
      console.error('Error loading idea:', err);
      error.value = 'Erreur lors du chargement de l\'idée. Vérifiez votre connexion.';
    } finally {
      isLoading.value = false;
    }
  });

  const handleChoice = $(async (choice: 'gauche' | 'droite') => {
    if (!currentIdea.value) return;
    
    // Mark current idea as seen
    await markIdeaAsSeen(currentIdea.value.id);
    
    // Load next idea
    await loadNewIdea();
  });

  const handleReset = $(async () => {
    clearSeenIdeas();
    await loadNewIdea();
  });

  // Load initial idea
  useTask$(async () => {
    await loadNewIdea();
  });

  return (
    <>
      <style dangerouslySetInnerHTML={styles} />
      <div class="game-board">
        <div class="game-board__container">
          {/* Header */}
          <div class="game-board__header">
            <h1 class="game-board__title">
              Gauche ou Droite ?
            </h1>
            <p class="game-board__subtitle">
              Déterminez si l'idée présentée est plutôt de gauche ou de droite politiquement.
            </p>
          </div>

          {/* Error message */}
          {error.value && (
            <div class="game-board__error">
              {error.value}
              <button 
                onClick$={handleReset}
                class="game-board__error-button"
              >
                Recommencer
              </button>
            </div>
          )}

          {/* Idea Display */}
          <div class="game-board__idea-container">
            <IdeaDisplay idea={currentIdea.value} isLoading={isLoading.value} />
          </div>

          {/* Choice Buttons */}
          {currentIdea.value && (
            <div class="game-board__choices">
              <ChoiceButton
                label="Gauche"
                variant="left"
                onClick$={() => handleChoice('gauche')}
                disabled={isLoading.value}
              />
              <ChoiceButton
                label="Droite"
                variant="right"
                onClick$={() => handleChoice('droite')}
                disabled={isLoading.value}
              />
            </div>
          )}

          {/* Reset Button */}
          <div class="game-board__reset-container">
            <button
              onClick$={handleReset}
              class="game-board__reset-button"
              disabled={isLoading.value}
            >
              Recommencer (effacer l'historique)
            </button>
          </div>

          {/* Instructions */}
          <div class="game-board__instructions">
            <p>
              Les idées déjà vues sont sauvegardées localement pour éviter les répétitions. 
              Cliquez sur "Recommencer" pour réinitialiser votre historique.
            </p>
          </div>
        </div>
      </div>
    </>
  );
});
