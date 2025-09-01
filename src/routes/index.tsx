import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { GameBoard } from "../components/game-board/game-board";

export default component$(() => {
  return <GameBoard />;
});

export const head: DocumentHead = {
  title: "Gauche ou Droite ? - Jeu Politique",
  meta: [
    {
      name: "description",
      content: "Déterminez si une idée est plutôt de gauche ou de droite politiquement. Un jeu interactif pour tester vos connaissances politiques.",
    },
  ],
};
