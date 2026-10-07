import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import { I18nProvider } from './i18n/I18nProvider.jsx';
import App from './App.jsx';
import './styles/index.css';

// The animation engine is split into its own chunk and fetched in parallel with the app
// shell. We render once it is ready so enter/exit animations are always reliable.
import('./motionFeatures.js').then(({ default: motionFeatures }) => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Provider store={store}>
        <I18nProvider>
          <App motionFeatures={motionFeatures} />
        </I18nProvider>
      </Provider>
    </StrictMode>,
  );
});
