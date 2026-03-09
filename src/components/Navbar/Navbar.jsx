import React, { useEffect, useState } from 'react';
import './navbar.scss'
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Users, MessageSquare, Star, Search, Briefcase, Award, Code, LineChart, Film, Music, DollarSign, Brain, Smile, BarChart2, Camera, Palette } from "lucide-react"; // Imported new icons
import { twMerge } from "tailwind-merge";
import { useContext } from 'react';
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
                        <GraduationCap className="cap" />
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
                    <span onClick={()=>navigate('/becomeseller')}>TopMark Business</span>
                    <span className="tooltip ">Explore
                    </span>
                    <span>
                        <img src='/images/language.png' alt='' width={'18px'} height={'16px'}
                            style={{ marginRight: '10px' }}>
                        </img>
                        English
                    </span>
                    <Link to='/login' className='link' key={333}><span>Sign in</span></Link>

                    {!current_user?.isSeller && <span onClick={e => navigate('/becomeSeller')}>Become a Seller</span>}
                    {!current_user && <button className='join' onClick={e => navigate(`/register`)}>Join</button>}
                    {
                        current_user && (
                            <div className="user" onClick={() => setopen(!open)}>
                                <img src={current_user.img || '/images/noavtar.jpeg'} alt="" />
                                <span>{current_user?.username}</span>
                                {open && (
                                    <div className="options">
                                        {
                                            current_user.isSeller && (
                                                <>
                                                    <Link className='link' key={555} to='/mygigs'>Gigs</Link>
                                                    <Link className='link' key={999} to='/add'>Add New Gig</Link>
                                                </>
                                            )
                                        }
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
                        <Link key={9983} className='link menulink' to='/'>
                            Graphics & Design
                        </Link>
                        <Link key={9883} className='link menulink' to='/'>
                            Video & Animation
                        </Link>
                        <Link key={9988} className='link menulink' to='/'>
                            Writing & Translation
                        </Link>
                        <Link key={9981} className='link menulink' to='/'>
                            AI Services
                        </Link>
                        <Link key={9982} className='link menulink' to='/'>
                            Digital Marketing
                        </Link>
                        <Link key={9903} className='link menulink' to='/'>
                            Music & Audio
                        </Link>
                        <Link key={99883} className='link menulink' to='/'>
                            Programming & Tech
                        </Link>
                        <Link key={99083} className='link menulink' to='/'>
                            Business
                        </Link>
                        <Link key={93983} className='link menulink' to='/'>
                            Lifestyle
                        </Link>
                    </div>
                    <hr />
                </>
            )}
        </div >
    ]);
}
export default Navbar;
