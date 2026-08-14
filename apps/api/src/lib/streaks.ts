// Helpers for computing win-streak metrics from the global arena timeline.
// A streak is a run of consecutive arenas (within a division) that a player won.

export function buildArenaPositions(arenas: { id: string; division: string }[]) {
  const arenaDiv = new Map<string, string>();
  const posByDiv = new Map<string, Map<string, number>>();
  for (const a of arenas) {
    arenaDiv.set(a.id, a.division);
    let m = posByDiv.get(a.division);
    if (!m) {
      m = new Map();
      posByDiv.set(a.division, m);
    }
    m.set(a.id, m.size);
  }
  return { arenaDiv, posByDiv };
}

// best = longest run of consecutive arenas won (per division);
// current = trailing run ending at the player's most recent win.
export function computeStreaks(
  wonArenaIds: string[],
  arenaDiv: Map<string, string>,
  posByDiv: Map<string, Map<string, number>>,
): { current: number; best: number } {
  const byDiv = new Map<string, number[]>();
  for (const id of wonArenaIds) {
    const div = arenaDiv.get(id);
    if (!div) continue;
    const pos = posByDiv.get(div)?.get(id);
    if (pos === undefined) continue;
    const arr = byDiv.get(div) ?? [];
    arr.push(pos);
    byDiv.set(div, arr);
  }

  let best = 0;
  let current = 0;
  let latestPos = -1;
  for (const positions of byDiv.values()) {
    positions.sort((a, b) => a - b);
    let run = 0;
    let prev = -2;
    for (const p of positions) {
      run = p === prev + 1 ? run + 1 : 1;
      if (run > best) best = run;
      prev = p;
    }
    const last = positions[positions.length - 1];
    if (last > latestPos) {
      latestPos = last;
      current = run;
    }
  }
  return { current, best };
}
