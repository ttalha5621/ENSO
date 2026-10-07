import { RouterProvider } from 'react-router-dom';
import { LazyMotion } from 'framer-motion';
import { router } from './routes/AppRoutes.jsx';

/** Animation features arrive as a separate chunk (see main.jsx) and are passed in ready-to-use. */
export default function App({ motionFeatures }) {
  return (
    <LazyMotion features={motionFeatures} strict>
      <RouterProvider router={router} />
    </LazyMotion>
  );
}
