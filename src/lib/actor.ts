/** Who performed an action. `id: null` = a system process (e.g. the seed script), never a person. */
export type Actor = { id: string | null; email: string };
export const SEED_ACTOR: Actor = { id: null, email: "system:seed" };
