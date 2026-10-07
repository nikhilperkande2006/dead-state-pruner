/**
 * A dead state is a reachable state from which no accepting state can ever be reached.
 * Formula: deadStates = reachableStates - usefulStates
 * Time Complexity: O(|Q|) once reachability and useful sets are computed.
 */
export function computeDeadStates(
  reachableStates: string[],
  usefulStates: string[]
): string[] {
  const usefulSet = new Set(usefulStates);
  return reachableStates.filter((s) => !usefulSet.has(s));
}
