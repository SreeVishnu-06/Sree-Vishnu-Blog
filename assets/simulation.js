export function initialState() {
  return { step: 0, status: "idle" };
}
export function transition(state, action, total) {
  if (action === "reset") return initialState();
  if (action === "pause")
    return state.status === "running" ? { ...state, status: "paused" } : state;
  if (action === "run")
    return state.status === "complete"
      ? { step: 0, status: "running" }
      : { ...state, status: "running" };
  if (action === "tick" && state.status === "running") {
    const step = Math.min(state.step + 1, total);
    return { step, status: step === total ? "complete" : "running" };
  }
  return state;
}
