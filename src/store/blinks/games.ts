/**
 * Extension point for Blink AI config / game catalog.
 * The getBlink tool + RenderBlinks handlers call into this config when present.
 */

export type BlinkGameConfig = {
  id: string;
  name: string;
  defaultBlinkUrl?: string;
  autoExecute?: boolean;
};

export const BLINK_GAMES: BlinkGameConfig[] = [
  // Maintainers can append known blink game URLs here for AI tool routing.
];

export function findBlinkGame(idOrName: string): BlinkGameConfig | undefined {
  const key = idOrName.trim().toLowerCase();
  return BLINK_GAMES.find(
    (g) => g.id.toLowerCase() === key || g.name.toLowerCase() === key
  );
}
