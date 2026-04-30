
import './navbar.scss'
import React, { useEffect, useState, useContext } from 'react';

import AuthContext from '../../AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import newRequest from '../../utils/newRequest';
const Navbar = () => {
    const [active, setactive] = useState(false);
    const [active1, setactive1] = useState(false);
    const [open, setopen] = useState(false);
    const { pathname } = useLocation();
    const isActive = () => {
        window.scrollY > 0 ? setactive(true) : setactive(false);
    }
    const isActive1 = () => {
        window.scrollY > 50 ? setactive1(true) : setactive1(false);
    }
    useEffect(() => {
        window.addEventListener('scroll', isActive);
        window.addEventListener('scroll', isActive1);
        return () => {
            window.removeEventListener('scroll', isActive);
            window.removeEventListener('scroll', isActive1);
        }
    }, []);

    const { user: current_user, logout } = useContext(AuthContext)

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
    return ([
        <div className={active || pathname !== "/" ? "navbar active" : "navbar "}>
            <div className="container">
                <div className="logo">
                    <Link to="/" className="flex items-center space-x-2">
                    <img src="/images/logos.png" alt="TopMark" style={{ height: '55px', width: 'auto', verticalAlign: 'middle' }} />
                        <span className="text-2xl">TopMark</span>
                    </Link>
                </div>
                {active  && <div className="navbarsearch">
                    <input type="text" placeholder='what service are you looking for today?' onChange={e => setinput(e.target.value)} />
                    <div className="search">
                        <img src="/images/search.png" alt="" onClick={handlesubmit} />
                    </div>
                </div>}
                <div className="links">
                    
                <span className="explore-btn" onClick={() => navigate('/gigs')}>
                Explore Experts
                </span>
                    <span>
                        <img src='/images/language.png' alt='' width={'18px'} height={'16px'}
                            style={{ marginRight: '10px' }}>
                        </img>
                        English
                    </span>
                    <Link to='/login' className='link' key={333}><span>Sign in</span></Link>

                    {current_user?.user_type !== 'expert' && !current_user && (
                        <span onClick={() => navigate('/becomeSeller')}>Become an Expert</span>
                    )}
                    {!current_user && <button className='join' onClick={e => navigate(`/register`)}>Join</button>}
                    {
                        current_user && (
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
                                        <Link className='link' key={9996} to='/orders'>Orders</Link>
                                        <Link className='link' key={9995} to='/messages'>Messages</Link>
                                        <Link className='link' key={9993} onClick={handleLogout}>Logout</Link>
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div>
            </div>

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
        </div >
    ]);
}
export default Navbar;
