import './navbar.scss'
import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../AuthContext';
import { useMessaging } from '../../MessagingContext';

const Navbar = () => {
    const [active, setactive]   = useState(false);
    const [active1, setactive1] = useState(false);
    const [open, setopen]       = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { pathname } = useLocation();
    const dropdownRef  = useRef(null);

    const isActive  = () => window.scrollY > 0  ? setactive(true)  : setactive(false);
    const isActive1 = () => window.scrollY > 10 ? setactive1(true) : setactive1(false);

    useEffect(() => {
        window.addEventListener('scroll', isActive);
        window.addEventListener('scroll', isActive1);
        return () => {
            window.removeEventListener('scroll', isActive);
            window.removeEventListener('scroll', isActive1);
        };
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setopen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setopen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const { user: currentUser, logout } = useContext(AuthContext);
    const { unreadCount } = useMessaging();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setopen(false);
        navigate('/');
    };

    const [input, setinput] = useState('');
    const handlesubmit = () => navigate(`/gigs?search=${input}`);

    const initials = (name = '') => name.slice(0, 2).toUpperCase() || 'U';
    const isExpert  = currentUser?.isSeller || currentUser?.user_type === 'expert';

    // Resolve profile picture — expert avatar_url takes priority over user profile_picture
    const avatarUrl = currentUser?.profile?.avatar_url
        || currentUser?.profile_picture
        || null;

    // Role label shown in dropdown header — clean, no email
    const roleLabel = isExpert ? 'Expert' : 'Student';

    // Avatar element — reused in multiple places
    const AvatarImg = ({ size = 'md' }) => avatarUrl
        ? <img src={avatarUrl} alt={currentUser.username} className={`nav-avatar-img nav-avatar-img--${size}`} />
        : <span className={`avatar-initials avatar-initials--${size}`}>{initials(currentUser?.username)}</span>;

    return (
        <div className={active || pathname !== '/' ? 'navbar active' : 'navbar'}>

            {/* ── MAIN CONTAINER ── */}
            <div className="container">

                {/* Hamburger (mobile) */}
                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span><span></span><span></span>
                </button>

                {/* LOGO */}
                <div className="logo">
                    <Link to="/" className="logo-link">
                        <img src="/images/logow.png" alt="TopMark" width={32} height={38} />
                        <span className="text-2xl">TopMark</span>
                    </Link>
                </div>

                {/* SEARCH BAR — desktop, appears on scroll */}
                {active && (
                    <div className="navbarsearch">
                        <input
                            type="text"
                            placeholder='What service are you looking for today?'
                            onChange={e => setinput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handlesubmit()}
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

                    {/* ── GUEST ── */}
                    {!currentUser && (
                        <>
                            <span className="become-expert-link" onClick={() => navigate('/becomeSeller')}>
                                Become an Expert
                            </span>
                            <Link to='/login' className='link signin-link'>Sign in</Link>
                            <button className='join' onClick={() => navigate('/register')}>Join</button>
                        </>
                    )}

                    {/* ── LOGGED IN ── */}
                    {currentUser && (
                        <div className="user" ref={dropdownRef} onClick={() => setopen(!open)}>
                            <AvatarImg size="sm" />
                            <span>{currentUser.username}</span>
                            <svg
                                className={`user-caret ${open ? 'user-caret--up' : ''}`}
                                width="11" height="11" viewBox="0 0 12 12" fill="none"
                                aria-hidden="true"
                            >
                                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6"
                                    strokeLinecap="round" strokeLinejoin="round" />
                            </svg>

                            {open && (
                                <div className="options" onClick={e => e.stopPropagation()}>

                                    {/* ── Header: avatar + name + role (NO email) ── */}
                                    <div className="options-header">
                                        <AvatarImg size="md" />
                                        <div className="options-user-info">
                                            <span className="options-username">{currentUser.username}</span>
                                            
                                        </div>
                                    </div>

                                    <div className="options-divider" />

                                    <Link to='/orders'   onClick={() => setopen(false)}>My Orders</Link>
                                    <Link to='/messages' onClick={() => setopen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Messages
                        {unreadCount > 0 && (
                            <span className="nav-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </Link>

                                    <div className="options-divider" />

                                    {isExpert ? (
                                        <>
                                            <Link to='/mygigs' onClick={() => setopen(false)}>My Gigs</Link>
                                            <Link to='/add'    onClick={() => setopen(false)}>Add New Gig</Link>
                                        </>
                                    ) : (
                                        <Link to='/becomeSeller' onClick={() => setopen(false)}>Become an Expert</Link>
                                    )}

                                    <Link to='/settings'  onClick={() => setopen(false)}>Account Settings</Link>
                                    <Link
                                    to={currentUser?.user_type === 'student' ? '/sprofile' : '/profile'}
                                    onClick={() => setopen(false)}
                                    >
                                    My Profile
                                    </Link>

                                    <div className="options-divider" />

                                    <span className="logout-option" onClick={handleLogout}>Sign out</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile right — Join button or avatar */}
                <div className="mobile-right">
                    {!currentUser ? (
                        <button className='mobile-join-btn' onClick={() => navigate('/register')}>Join</button>
                    ) : (
                        <div className="user mobile-user" onClick={() => setopen(!open)}>
                            <AvatarImg size="sm" />
                            {open && (
                                <div className="options">
                                    <Link to='/orders'   onClick={() => setopen(false)}>My Orders</Link>
                                    <Link to='/messages' onClick={() => setopen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Messages
                        {unreadCount > 0 && (
                            <span className="nav-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </Link>
                                    {isExpert ? (
                                        <>
                                            <Link to='/mygigs' onClick={() => setopen(false)}>My Gigs</Link>
                                            <Link to='/add'    onClick={() => setopen(false)}>Add New Gig</Link>
                                        </>
                                    ) : (
                                        <Link to='/becomeSeller' onClick={() => setopen(false)}>Become an Expert</Link>
                                    )}
                                    <Link to='/settings' onClick={() => setopen(false)}>Account Settings</Link>
                                    <span className="logout-option" onClick={handleLogout}>Sign out</span>
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
                        {!currentUser ? (
                            <div className="mobile-auth">
                                <button className="mobile-btn-primary"
                                    onClick={() => { navigate('/register'); setMenuOpen(false); }}>
                                    Join TopMark
                                </button>
                                <button className="mobile-btn-secondary"
                                    onClick={() => { navigate('/login'); setMenuOpen(false); }}>
                                    Sign in
                                </button>
                                <button className="mobile-btn-ghost"
                                    onClick={() => { navigate('/becomeSeller'); setMenuOpen(false); }}>
                                    Become an Expert
                                </button>
                            </div>
                        ) : (
                            <div className="mobile-user-section">
                                <div className="mobile-user-info">
                                    <AvatarImg size="md" />
                                    <div className="mobile-user-text">
                                        <span className="mobile-username">{currentUser.username}</span>
                                        <span className="mobile-user-type">{roleLabel}</span>
                                    </div>
                                </div>
                                <Link className="mobile-nav-link" to='/orders'   onClick={() => setMenuOpen(false)}>My Orders</Link>
                                <Link className="mobile-nav-link" to='/messages' onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Messages
                    {unreadCount > 0 && (
                        <span className="nav-unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </Link>
                                {isExpert ? (
                                    <>
                                        <Link className="mobile-nav-link" to='/mygigs' onClick={() => setMenuOpen(false)}>My Gigs</Link>
                                        <Link className="mobile-nav-link" to='/add'    onClick={() => setMenuOpen(false)}>Add New Gig</Link>
                                    </>
                                ) : (
                                    <Link className="mobile-nav-link" to='/becomeSeller' onClick={() => setMenuOpen(false)}>Become an Expert</Link>
                                )}
                                <Link className="mobile-nav-link" to='/settings' onClick={() => setMenuOpen(false)}>Account Settings</Link>
                                <span className="mobile-nav-link logout"
                                    onClick={() => { handleLogout(); setMenuOpen(false); }}>
                                    Sign out
                                </span>
                            </div>
                        )}
                        <div className="mobile-menu-divider" />
                        <button className="mobile-explore-btn"
                            onClick={() => { navigate('/gigs'); setMenuOpen(false); }}>
                            Explore Experts
                        </button>
                    </div>
                </>
            )}

            {/* ── CATEGORY BAR ── */}
            {(active1 || pathname !== '/') && (
                <>
                    <hr className="nav-hr" />
                    <div className="menu">
                        <Link className='link menulink' to='/gigs?search=Law'>Law &amp; Legal</Link>
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
};

export default Navbar;