// 1.28.50
import React from "react";
import './home.scss';
import Featured from "../../components/featured/Featured";
import TrustedBy from "../../components/Trusted By/TrustedBy";
import Slide from "../../components/Slide/Slide";
import { cards, projects } from "../../data";
import CatCard from "../../components/catCard/CatCard";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();
    return ([
        <div className="home">

            <section class="hero">
                <div class="hero-background-pattern">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 L 0 20" fill="none" stroke="currentColor" stroke-width="0.1"></path>
                    </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"></rect>
                </svg>
                </div>

                <div class="hero-content">
                <h1>Connect with <span class="highlight">Top Academic Experts</span></h1>
                <p class="subtitle">
                    Your trusted platform for personalized tutoring, project assistance, and academic guidance. Achieve excellence with verified professionals.
                </p>
                
                <p class="popular-searches">Popular: Essay Writing, Calculus, Business Plan, Data Science, Literature Analysis</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary">Get Started</button>
                    <button class="btn btn-outline">Learn More</button>
                </div>

                </div>
                <div class="photography-section">
                    <h2 class="section-title">You might be interested in Essay and Research</h2>
                    <div class="tags-container">
                        <div class="tag-row">
                        <span class="tag">Expository Essay</span>
                        <span class="tag">Descriptive Essay</span>
                        <span class="tag">Narrative Essay</span>
                        <span class="tag">Argumentative Essay</span>

                        </div>
                        <div class="tag-row">
                        <span class="tag">Correlational Research</span>
                        <span class="tag">Experimental Research</span>
                        <span class="tag">Descriptive Research</span>
                        <span class="tag">Exploratory Research</span>
                        </div>
                        <div class="tag-row">
                        </div>
                    </div>
                </div>
            </section>
            
            <section id="categories" class="categories">
                <div class="container">
                <h2>Explore TopMark Services</h2>
                <div class="categories-grid">
                    <div class="card">
                    <div class="card-content">
                        <svg class="card-icon text-blue-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                        <h3>Programming & Tech</h3>
                        <p>Coding, development, IT support.</p>
                    </div>
                    </div>
                    <div class="card">
                    <div class="card-content">
                        <svg class="card-icon text-red-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                        <h3>Digital Marketing</h3>
                        <p>SEO, social media, content strategy.</p>
                    </div>
                    </div>
                    <div class="card">
                    <div class="card-content">
                        <svg class="card-icon text-purple-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                        <h3>Video & Animation</h3>
                        <p>Editing, motion graphics, explainer videos.</p>
                    </div>
                    </div>
                    <div class="card">
                    <div class="card-content">
                        <svg class="card-icon text-green-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        <h3>Writing & Translation</h3>
                        <p>Articles, creative writing, multilingual services.</p>
                    </div>
                    </div>
                    <div class="card">
                    <div class="card-content">
                        <svg class="card-icon text-orange-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        <h3>Business</h3>
                        <p>Strategy, planning, consulting.</p>
                    </div>
                    </div>
                    <div class="card">
                    <div class="card-content">
                        <svg class="card-icon text-teal-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        <h3>Finance</h3>
                        <p>Accounting, financial modeling, investment advice.</p>
                    </div>
                    </div>
                </div>
                </div>
            </section>
            <Featured></Featured>
            <TrustedBy></TrustedBy>
            <Slide slidesToShow={5} arrowsScroll={5} >
                {
                    cards.map((card => (<CatCard item={card} key={card.id}></CatCard>
                    )))
                }
            </Slide>
            <div className="explore">
                <div className="container">
                    <h1>You need it, we've got it</h1>
                    <div className="items">
                        <div className="item" onClick={e => navigate(`gigs?cat=Graphics & Design`)}>
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/graphics-design.d32a2f8.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span >Graphics & Design</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?cat=Digital Marketing`)}>
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/online-marketing.74e221b.svg"
                                alt=""
                            />
                            <div className="line"></div>

                            <span>Digital Marketing</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?cat=Writing & Translation`)} >
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/writing-translation.32ebe2e.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span>Writing & Translation</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?cat=Writing & Translation`)} >
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/video-animation.f0d9d71.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span>Video & Animation</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?cat=Music & Audio`)}>
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/music-audio.320af20.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span>Music & Audio</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?cat=Programming & Tech`)}>
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/programming.9362366.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span>Programming & Tech</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?cat=Business`)}>
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/business.bbdf319.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span>Business</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?cat=Lifestyle`)}>
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/lifestyle.745b575.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span>Lifestyle</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?Data`)}>
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/data.718910f.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span>Data</span>
                        </div>
                        <div className="item" onClick={e => navigate(`gigs?cat=Photography`)}>
                            <img
                                src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/photography.01cf943.svg"
                                alt=""
                            />
                            <div className="line"></div>
                            <span>Photography</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="features dark">
                <div className="container">
                    <div className="item">
                        <h1>TopMark <em><span style={{ fontWeight: '300' }}>business.</span></em></h1>
                        <h1>A solution built for <em>business</em></h1>
                        <p >Elevate your workflow with a curated experience, offering exclusive tools and access to vetted professionals.</p>
                        <div className="title">
                            <img src="/images/check.png" alt="check" />
                            Talent matching
                        </div>
                        <div className="title">
                            <img src="/images/check.png" alt="check" />
                            Exclusive Client Advocacy
                        </div>
                        <div className="title">
                            <img src="/images/check.png" alt="check" />
                            Team collaboration tools
                        </div>
                        <div className="title">
                            <img src="/images/check.png" alt="check" />
                            Business payment solutions
                        </div>
                        <button>Explore TopMark Business</button>
                    </div>
                    <div className="item">
                        <img src="images/hero6.webp" alt="imagea" />
                    </div>
                </div>
            </div>
            <div className="logo_maker">
                <div className="items">
                    <div className="left">
                        <h1>TopMark <span>logomaker.</span></h1>
                        <p className="first_para">Make an incredible logo<br></br>
                            <em className="first_para_em"> in minutes</em>
                        </p>
                        <p className="second_para">Pre-designed by top tier talent. Just add your touch.</p>
                        <button className="logo_button"><strong>Try TopMark Logo Maker</strong></button>
                    </div>
                    <div className="right">
                        <img src="/images/logomaker.webp" alt="" />
                    </div>
                </div>
            </div>
            {/* second slidebar */}
            <div className="secondslide">
                <p className="second_slider_heading">Inspiring work made on TopMark</p>
                <Slide slidesToShow={4} arrowsScroll={5}>
                    {
                        projects.map(
                            (card => (
                                <ProjectCard 
                                item={card} 
                                key={card.id}
                                />
                            ))
                        )
                    }
                   
                </Slide>
            </div>

        </div>
    ]);
}
export default Home;