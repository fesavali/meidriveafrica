import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Navbar({ user }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
        // Don't need window.location.reload() - React Router handles it
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    MEI DRIVE <span>AFRICA</span>
                </div>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/#courses">Courses</Link> {/* Changed a to Link */}
                    {user ? (
                        <>
                            <Link to="/dashboard">Dashboard</Link> {/* Changed .html to path */}
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link> {/* Changed .html to path */}
                            <Link to="/register">Register</Link> {/* Changed .html to path */}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
