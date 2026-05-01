import './navbar.scss'
import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../../AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [active, setactive] = useState(false);
    const [active1, setactive1] = useState(false);
    const [open, setopen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false); // mobile menu toggle
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

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

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
            <div className="container">

                {/* LOGO */}
                <div className="logo">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/images/logos.png" alt="TopMark" style={{ height: '55px', width: 'auto', verticalAlign: 'middle' }} />
                        <span className="text-2xl">TopMark</span>
                    </Link>
                </div>

                {/* SEARCH BAR — desktop only, shows on scroll */}
                {active && (
                    <div className="navbarsearch">
                        <input
                            type="text"
                            placeholder='What service are you looking for today?'
                            onChange={e => setinput(e.target.value)}
                        />
                        <div className="search">
                            <img src="/images/search.png" alt="search" onClick={handlesubmit} />
                        </div>
                    </div>
                )}

                {/* DESKTOP LINKS */}
                <div className="links">
                    <span className="explore-btn" onClick={() => navigate('/gigs')}>
                        Explore Experts
                    </span>

                    {/* Not logged in */}
                    {!current_user && (
                        <>
                            <Link to='/login' className='link'><span>Sign in</span></Link>
                            <button className='join' onClick={() => navigate('/register')}>Join</button>
                        </>
                    )}

                    {/* Become an Expert — only for non-expert logged-out users, hidden on mobile via CSS */}
                    {!current_user && (
                        <span className="become-expert-link" onClick={() => navigate('/becomeSeller')}>
                            Become an Expert
                        </span>
                    )}

                    {/* Logged in user */}
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
                                    <Link className='link' to='/orders'>Orders</Link>
                                    <Link className='link' to='/messages'>Messages</Link>
                                    <Link className='link' onClick={handleLogout}>Logout</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* HAMBURGER — mobile only */}
                <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {menuOpen && (
                <div className="mobile-menu">
                    <span className="explore-btn mobile-explore" onClick={() => { navigate('/gigs'); setMenuOpen(false); }}>
                        Explore Experts
                    </span>

                    {!current_user && (
                        <>
                            <Link to='/login' className='link mobile-link' onClick={() => setMenuOpen(false)}>Sign in</Link>
                            <Link to='/becomeSeller' className='link mobile-link' onClick={() => setMenuOpen(false)}>Become an Expert</Link>
                            <button className='join mobile-join' onClick={() => { navigate('/register'); setMenuOpen(false); }}>Join</button>
                        </>
                    )}

                    {current_user && (
                        <>
                            <div className="mobile-user-info">
                                <img src={current_user.img || '/images/noavtar.jpeg'} alt="" />
                                <span>{current_user?.username}</span>
                            </div>
                            {current_user.user_type === 'expert' && (
                                <>
                                    <Link className='link mobile-link' to='/mygigs' onClick={() => setMenuOpen(false)}>My Gigs</Link>
                                    <Link className='link mobile-link' to='/add' onClick={() => setMenuOpen(false)}>Add New Gig</Link>
                                </>
                            )}
                            <Link className='link mobile-link' to='/orders' onClick={() => setMenuOpen(false)}>Orders</Link>
                            <Link className='link mobile-link' to='/messages' onClick={() => setMenuOpen(false)}>Messages</Link>
                            <span className='mobile-link logout' onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</span>
                        </>
                    )}

                    {/* Category links in mobile menu */}
                    <hr className="mobile-divider" />
                    <div className="mobile-categories">
                        <Link className='link mobile-link' to='/gigs?search=Law' onClick={() => setMenuOpen(false)}>Law & Legal</Link>
                        <Link className='link mobile-link' to='/gigs?search=Nursing' onClick={() => setMenuOpen(false)}>Nursing</Link>
                        <Link className='link mobile-link' to='/gigs?search=Cybersecurity' onClick={() => setMenuOpen(false)}>Cybersecurity</Link>
                        <Link className='link mobile-link' to='/gigs?search=Biology' onClick={() => setMenuOpen(false)}>Biology</Link>
                        <Link className='link mobile-link' to='/gigs?search=History' onClick={() => setMenuOpen(false)}>History</Link>
                        <Link className='link mobile-link' to='/gigs?search=Data Science' onClick={() => setMenuOpen(false)}>Data Science</Link>
                        <Link className='link mobile-link' to='/gigs?search=Computer Science' onClick={() => setMenuOpen(false)}>Computer Science</Link>
                        <Link className='link mobile-link' to='/gigs?search=Business' onClick={() => setMenuOpen(false)}>Business</Link>
                        <Link className='link mobile-link' to='/gigs?search=Essay Writing' onClick={() => setMenuOpen(false)}>Essay Writing</Link>
                    </div>
                </div>
            )}

            {/* DESKTOP CATEGORY MENU — shows on scroll or non-home pages */}
            {(active1 || pathname !== "/") && (
                <>
                    <hr />
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
                    <hr />
                </>
            )}
        </div>
    );
}

export default Navbar;