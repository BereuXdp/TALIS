import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import App from './App.jsx'
import './styles.css'
import './screens.css'
import './login.css'
import './theme.css'
import { applyTheme } from './theme.js'

applyTheme()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
)
