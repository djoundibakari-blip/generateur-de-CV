import dynamic from 'next/dynamic'

// ssr:false prevents hydration issues with the SPA (crypto.randomUUID, DOM access)
const App = dynamic(() => import('../src/App.jsx'), { ssr: false })

export default function Home() {
  return <App />
}
