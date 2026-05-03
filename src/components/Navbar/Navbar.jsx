import './navbar.scss'
import React, { useEffect, useState, useContext, useRef } from 'react';
import AuthContext from '../../AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [active, setactive] = useState(false);
    const [active1, setactive1] = useState(false);
    const [open, setopen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const dropdownRef = useRef(null);

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

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setopen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // Get initials for avatar fallback
    const getInitials = (username) => {
        if (!username) return '?';
        return username.slice(0, 2).toUpperCase();
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
                        <div className="user-dropdown" ref={dropdownRef}>
                            {/* Trigger */}
                            <div className="user-trigger" onClick={() => setopen(!open)}>
                                <div className="user-avatar">
                                    {current_user.img
                                        ? <img src={current_user.img} alt={current_user.username} />
                                        : <span className="avatar-initials">{getInitials(current_user.username)}</span>
                                    }
                                    <span className="online-dot" />
                                </div>
                                <span className="user-trigger-name">{current_user?.username}</span>
                                <svg className={`chevron ${open ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>

                            {/* Dropdown panel */}
                            {open && (
                                <div className="dropdown-panel">
                                    {/* Header */}
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar">
                                            {current_user.img
                                                ? <img src={current_user.img} alt={current_user.username} />
                                                : <span className="avatar-initials">{getInitials(current_user.username)}</span>
                                            }
                                        </div>
                                        <div className="dropdown-user-info">
                                            <span className="dropdown-username">{current_user.username}</span>
                                            <span className="dropdown-email">{current_user.email}</span>
                                        </div>
                                    </div>

                                    <div className="dropdown-divider" />

                                    {/* Nav items */}
                                    <ul className="dropdown-menu">
                                        {current_user.user_type === 'expert' && (
                                            <>
                                                <li>
                                                    <Link to='/mygigs' onClick={() => setopen(false)}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                                                        </svg>
                                                        My Gigs
                                                    </Link>
                                                </li>
                                                <li>
                                                    <Link to='/add' onClick={() => setopen(false)}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
                                                        </svg>
                                                        Add New Gig
                                                    </Link>
                                                </li>
                                            </>
                                        )}
                                        <li>
                                            <Link to='/orders' onClick={() => setopen(false)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>
                                                </svg>
                                                My Orders
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to='/messages' onClick={() => setopen(false)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                </svg>
                                                Messages
                                            </Link>
                                        </li>
                                        {current_user.user_type === 'student' && (
                                            <li>
                                                <Link to='/becomeSeller' onClick={() => setopen(false)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                    </svg>
                                                    Become an Expert
                                                </Link>
                                            </li>
                                        )}
                                        <li>
                                            <Link to='/account' onClick={() => setopen(false)}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                                                </svg>
                                                Account Settings
                                            </Link>
                                        </li>
                                    </ul>

                                    <div className="dropdown-divider" />

                                    {/* Logout */}
                                    <button className="dropdown-logout" onClick={handleLogout}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                                        </svg>
                                        Sign out
                                    </button>
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
                        <div className="user-dropdown mobile-dropdown" ref={dropdownRef}>
                            <div className="user-trigger" onClick={() => setopen(!open)}>
                                <div className="user-avatar">
                                    {current_user.img
                                        ? <img src={current_user.img} alt={current_user.username} />
                                        : <span className="avatar-initials">{getInitials(current_user.username)}</span>
                                    }
                                    <span className="online-dot" />
                                </div>
                            </div>
                            {open && (
                                <div className="dropdown-panel dropdown-panel-left">
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar">
                                            {current_user.img
                                                ? <img src={current_user.img} alt={current_user.username} />
                                                : <span className="avatar-initials">{getInitials(current_user.username)}</span>
                                            }
                                        </div>
                                        <div className="dropdown-user-info">
                                            <span className="dropdown-username">{current_user.username}</span>
                                            <span className="dropdown-email">{current_user.email}</span>
                                        </div>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <ul className="dropdown-menu">
                                        {current_user.user_type === 'expert' && (
                                            <>
                                                <li><Link to='/mygigs' onClick={() => setopen(false)}>My Gigs</Link></li>
                                                <li><Link to='/add' onClick={() => setopen(false)}>Add New Gig</Link></li>
                                            </>
                                        )}
                                        <li><Link to='/orders' onClick={() => setopen(false)}>My Orders</Link></li>
                                        <li><Link to='/messages' onClick={() => setopen(false)}>Messages</Link></li>
                                        <li><Link to='/account' onClick={() => setopen(false)}>Account Settings</Link></li>
                                    </ul>
                                    <div className="dropdown-divider" />
                                    <button className="dropdown-logout" onClick={handleLogout}>Sign out</button>
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
                                <button className="mobile-btn-primary" onClick={() => { navigate('/register'); setMenuOpen(false); }}>
                                    Join TopMark
                                </button>
                                <button className="mobile-btn-secondary" onClick={() => { navigate('/login'); setMenuOpen(false); }}>
                                    Sign in
                                </button>
                                <button className="mobile-btn-ghost" onClick={() => { navigate('/becomeSeller'); setMenuOpen(false); }}>
                                    Become an Expert
                                </button>
                            </div>
                        ) : (
                            <div className="mobile-user-section">
                                <div className="mobile-user-info">
                                    <div className="user-avatar">
                                        {current_user.img
                                            ? <img src={current_user.img} alt={current_user.username} />
                                            : <span className="avatar-initials">{getInitials(current_user.username)}</span>
                                        }
                                    </div>
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
                                <Link className="mobile-nav-link" to='/orders' onClick={() => setMenuOpen(false)}>My Orders</Link>
                                <Link className="mobile-nav-link" to='/messages' onClick={() => setMenuOpen(false)}>Messages</Link>
                                <Link className="mobile-nav-link" to='/account' onClick={() => setMenuOpen(false)}>Account Settings</Link>
                                <span className="mobile-nav-link logout" onClick={() => { handleLogout(); setMenuOpen(false); }}>Sign out</span>
                            </div>
                        )}
                        <div className="mobile-menu-divider" />
                        <button className="mobile-explore-btn" onClick={() => { navigate('/gigs'); setMenuOpen(false); }}>
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