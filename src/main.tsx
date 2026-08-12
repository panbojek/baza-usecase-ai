import { createRoot } from 'react-dom/client'
import { StoreProvider } from './store'
import App from './App'
import './styles.css'

// Uwaga: bez React.StrictMode — react-force-graph-3d (three.js/WebGL) nie znosi
// podwójnego montowania, które StrictMode wymusza w trybie dev (konflikt kontekstu WebGL).
createRoot(document.getElementById('root')!).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
)
