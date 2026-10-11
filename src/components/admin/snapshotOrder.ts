type Revisioned = { revision: number; draftRevision: number };

/** Keep a slower response from replacing a newer editor view. */
export function preferNewerSnapshot<T extends Revisioned>(current: T | null, incoming: T): T {
  if (!current) return incoming;
  if (incoming.revision !== current.revision) return incoming.revision > current.revision ? incoming : current;
  return incoming.draftRevision >= current.draftRevision ? incoming : current;
}
