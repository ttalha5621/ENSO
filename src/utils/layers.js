/** Translated display name for a catalogue layer (falls back to its configured name). */
export const layerLabel = (t, l) => {
  const key = `layers.names.${l.id}`;
  const v = t(key);
  return v === key ? l.name : v;
};
