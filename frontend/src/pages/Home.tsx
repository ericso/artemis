import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home">
      <h1>Welcome to Artemis</h1>
      <div className="auth-links">
        <Link to="/login" className="auth-button login">
          Login
        </Link>
        <Link to="/register" className="auth-button register">
          Create Account
        </Link>
      </div>
    </div>
  )
}

export default Home 