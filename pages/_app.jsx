import '../src/App.css'
import { PlanProvider } from '../src/context/PlanContext.jsx'

export default function MyApp({ Component, pageProps }) {
  return (
    <PlanProvider>
      <Component {...pageProps} />
    </PlanProvider>
  )
}
