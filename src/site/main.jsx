import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import Site from './Site.jsx'
import './site.css'

createRoot(document.getElementById('site')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <Site />
    </MotionConfig>
  </StrictMode>,
)
