import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { mapLayers } from '../config/mapLayers.js';

/** Static + runtime (GeoServer) layers merged with their current state, in draw order. */
export function useLayerCatalog() {
  const { layers, order, customLayers, layerErrors } = useSelector((s) => s.map);
  return useMemo(() => {
    const defs = new Map([...mapLayers, ...customLayers].map((l) => [l.id, l]));
    return order
      .map((id) => defs.get(id))
      .filter(Boolean)
      .map((def) => ({ ...def, ...layers[def.id], error: !!layerErrors[def.id] }));
  }, [layers, order, customLayers, layerErrors]);
}
