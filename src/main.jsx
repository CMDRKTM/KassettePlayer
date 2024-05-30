import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {NextUIProvider} from "@nextui-org/react";

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <NextUIProvider>
  <App />
</NextUIProvider>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})

