import React from 'react'
import ReactDOM from 'react-dom/client'

// shared Veil Design System v2 (also consumed by the userscript overlay)
import '../../design-system/tokens.css'
import '../../design-system/veil-ui.css'
import './styles/app.css'

import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
