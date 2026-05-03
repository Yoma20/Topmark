import './navbar.scss'
import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [active, setactive] = useState(false);
    const [active1, setactive1] = useState(false);
    const [open, setopen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();

    const isActive = () => {
        window.scrollY > 0 ? setactive(true) : setactive(false);
    }
    const isActive1 = () => {
        window.scrollY > 10 ? setactive1(true) : setactive1(false);
    }

    useEffect(() => {
        window.addEventListener('scroll', isActive);
        window.addEventListener('scroll', isActive1);
        return () => {
            window.removeEventListener('scroll', isActive);
            window.removeEventListener('scroll', isActive1);
        }
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setopen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const { user: current_user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (err) {
            console.log(err);
        }
    }

    const [input, setinput] = useState("");
    const handlesubmit = () => {
        navigate(`gigs?search=${input}`);
    }

    return (
        <div className={active || pathname !== "/" ? "navbar active" : "navbar"}>

            {/* ── MAIN CONTAINER ── */}
            <div className="container">

                {/* LEFT: Hamburger (mobile only) */}
                <div
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                {/* LOGO */}
                <div className="logo">
                    <Link to="/" className="logo-link">
                        <img src="/images/logos.png" alt="TopMark" />
                        <span className="text-2xl">TopMark</span>
                    </Link>
                </div>

                {/* SEARCH BAR — desktop, shows on scroll */}
                {active && (
                    <div className="navbarsearch">
                        <input
                            type="text"
                            placeholder='What service are you looking for today?'
                            onChange={e => setinput(e.target.value)}
                        />
                        <div className="search" onClick={handlesubmit}>
                            <img src="/images/search.png" alt="search" />
                        </div>
                    </div>
                )}

                {/* RIGHT: Desktop links */}
                <div className="links">
                    <span className="explore-btn" onClick={() => navigate('/gigs')}>
                        Explore Experts
                    </span>

                    {!current_user && (
                        <>
                            <span className="become-expert-link" onClick={() => navigate('/becomeSeller')}>
                                Become an Expert
                            </span>
                            <Link to='/login' className='link signin-link'>Sign in</Link>
                            <button className='join' onClick={() => navigate('/register')}>Join</button>
                        </>
                    )}

                    {current_user && (
                        <div className="user" onClick={() => setopen(!open)}>
                            <img src={current_user.img || '/images/noavtar.jpeg'} alt="" />
                            <span>{current_user?.username}</span>
                            {open && (
                                <div className="options">
                                    {current_user.user_type === 'expert' && (
                                        <>
                                            <Link to='/mygigs'>My Gigs</Link>
                                            <Link to='/add'>Add New Gig</Link>
                                        </>
                                    )}
                                    <Link to='/orders'>Orders</Link>
                                    <Link to='/messages'>Messages</Link>
                                    <span className="logout-option" onClick={handleLogout}>Logout</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: Mobile — Join button or avatar always visible */}
                <div className="mobile-right">
                    {!current_user ? (
                        <button className='mobile-join-btn' onClick={() => navigate('/register')}>Join</button>
                    ) : (
                        <div className="user mobile-user" onClick={() => setopen(!open)}>
                            <img src={current_user.img || '/images/noavtar.jpeg'} alt="" />
                            {open && (
                                <div className="options">
                                    {current_user.user_type === 'expert' && (
                                        <>
                                            <Link to='/mygigs'>My Gigs</Link>
                                            <Link to='/add'>Add New Gig</Link>
                                        </>
                                    )}
                                    <Link to='/orders'>Orders</Link>
                                    <Link to='/messages'>Messages</Link>
                                    <span className="logout-option" onClick={handleLogout}>Logout</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── MOBILE SLIDE-DOWN MENU ── */}
            {menuOpen && (
                <>
                    <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
                    <div className="mobile-menu">

                        {!current_user ? (
                            <div className="mobile-auth">
                                <button
                                    className="mobile-btn-primary"
                                    onClick={() => { navigate('/register'); setMenuOpen(false); }}
                                >
                                    Join TopMark
                                </button>
                                <button
                                    className="mobile-btn-secondary"
                                    onClick={() => { navigate('/login'); setMenuOpen(false); }}
                                >
                                    Sign in
                                </button>
                                <button
                                    className="mobile-btn-ghost"
                                    onClick={() => { navigate('/becomeSeller'); setMenuOpen(false); }}
                                >
                                    Become an Expert
                                </button>
                            </div>
                        ) : (
                            <div className="mobile-user-section">
                                <div className="mobile-user-info">
                                    <img src={current_user.img || '/images/noavtar.jpeg'} alt="" />
                                    <div className="mobile-user-text">
                                        <span className="mobile-username">{current_user.username}</span>
                                        <span className="mobile-user-type">{current_user.user_type}</span>
                                    </div>
                                </div>
                                {current_user.user_type === 'expert' && (
                                    <>
                                        <Link className="mobile-nav-link" to='/mygigs' onClick={() => setMenuOpen(false)}>My Gigs</Link>
                                        <Link className="mobile-nav-link" to='/add' onClick={() => setMenuOpen(false)}>Add New Gig</Link>
                                    </>
                                )}
                                <Link className="mobile-nav-link" to='/orders' onClick={() => setMenuOpen(false)}>Orders</Link>
                                <Link className="mobile-nav-link" to='/messages' onClick={() => setMenuOpen(false)}>Messages</Link>
                                <span
                                    className="mobile-nav-link logout"
                                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                                >
                                    Logout
                                </span>
                            </div>
                        )}

                        <div className="mobile-menu-divider" />

                        <button
                            className="mobile-explore-btn"
                            onClick={() => { navigate('/gigs'); setMenuOpen(false); }}
                        >
                            Explore Experts
                        </button>
                    </div>
                </>
            )}

            {/* ── DESKTOP CATEGORY BAR ── */}
            {(active1 || pathname !== "/") && (
                <>
                    <hr className="nav-hr" />
                    <div className="menu">
                        <Link className='link menulink' to='/gigs?search=Law'>Law & Legal</Link>
                        <Link className='link menulink' to='/gigs?search=Nursing'>Nursing</Link>
                        <Link className='link menulink' to='/gigs?search=Cybersecurity'>Cybersecurity</Link>
                        <Link className='link menulink' to='/gigs?search=Biology'>Biology</Link>
                        <Link className='link menulink' to='/gigs?search=History'>History</Link>
                        <Link className='link menulink' to='/gigs?search=Data Science'>Data Science</Link>
                        <Link className='link menulink' to='/gigs?search=Computer Science'>Computer Science</Link>
                        <Link className='link menulink' to='/gigs?search=Business'>Business</Link>
                        <Link className='link menulink' to='/gigs?search=Essay Writing'>Essay Writing</Link>
                    </div>
                    <hr className="nav-hr" />
                </>
            )}
        </div>
    );
}

export default Navbar;