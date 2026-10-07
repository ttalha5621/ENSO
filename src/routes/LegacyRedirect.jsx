import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { setLayerVisible } from '../store/slices/mapSlice.js';

/** Old portal URLs (/sst, /ssh …) switch on the matching layer and open the map. */
export default function LegacyRedirect({ layer }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setLayerVisible({ id: layer, visible: true }));
  }, [dispatch, layer]);
  return <Navigate to="/map" replace />;
}
