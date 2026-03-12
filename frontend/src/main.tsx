import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// YEH LINE TUMHARI CSS AUR TAILWIND KO ZINDA KAREGI 👇
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)