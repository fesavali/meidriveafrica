import React from 'react'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Practice Daily.<br /><span>Revise Smarter. Pass with Confidence.</span></h1>
          <p>For Learners and Experienced Drivers — Refresh Your Skills with MEI DRIVE AFRICA. NTSA-approved courses.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/login" className="btn-outline">Login</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat"><h2>10K+</h2><p>Students</p></div>
          <div className="stat"><h2>8</h2><p>Courses</p></div>
          <div className="stat"><h2>98%</h2><p>Pass Rate</p></div>
        </div>
      </section>

      {/* WhatsApp Button */}
      <a href="https://wa.me/254703738707" className="whatsapp-float" target="_blank" rel="noopener noreferrer">
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  )
}

export default Home
