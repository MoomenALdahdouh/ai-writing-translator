import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import './Privacy.css'

export default function NotFound() {
  return (
    <>
      <SEO 
        title="Page Not Found - Lingo"
        description="The page you're looking for doesn't exist. Return to the Lingo homepage."
      />
      <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page not found</h2>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/" className="cta primary">Back to Home</Link>
        </div>
      </div>
    </div>
    </>
  )
}
