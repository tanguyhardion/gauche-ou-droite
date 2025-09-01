import { component$ } from "@builder.io/qwik";
import type { Idea } from "../../lib/ideas-service";
import styles from "./idea-display.css?inline";

interface IdeaDisplayProps {
  idea: Idea | null;
  isLoading?: boolean;
}

export const IdeaDisplay = component$<IdeaDisplayProps>(
  ({ idea, isLoading = false }) => {
    if (isLoading) {
      return (
        <>
          <style dangerouslySetInnerHTML={styles} />
          <div class="idea-display__loading">
            <div class="animate-pulse">
              <div class="idea-display__loading-bar"></div>
              <div class="idea-display__loading-bar"></div>
              <div class="idea-display__loading-bar"></div>
            </div>
          </div>
        </>
      );
    }

    if (!idea) {
      return (
        <>
          <style dangerouslySetInnerHTML={styles} />
          <div class="idea-display">
            <div class="idea-display__empty">
              <p>Aucune idée disponible.</p>
              <p class="idea-display__empty-subtitle">
                Toutes les idées ont été vues ou il y a un problème de
                connexion.
              </p>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <style dangerouslySetInnerHTML={styles} />
        <div class="idea-display">
          <div class="idea-display__content">
            <p class="idea-display__text">{idea.text}</p>
            {idea.category && (
              <span class="idea-display__category">{idea.category}</span>
            )}
          </div>
        </div>
      </>
    );
  },
);
