
import React, { useState } from "react";
import './home.scss';
import Featured from "../../components/featured/Featured";
import TrustedBy from "../../components/Trusted By/TrustedBy";
import Slide from "../../components/Slide/Slide";
import { cards, projects } from "../../data";
import CatCard from "../../components/catCard/CatCard";
import ProjectCard from "../../components/projectCard/ProjectCard";
import { useNavigate } from "react-router-dom";

const POPULAR_TAGS = [
    "Law Essay",
    "Nursing Care Plan",
    "Cybersecurity Report",
    "Biology Lab Report",
    "Dissertation Help",
];

const Home = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleTagClick = (tag) => {
        setSearchQuery(tag);
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/gigs?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    return ([
        <div className="home">

            {/* ── HERO ── */}
            <section className="hero">
                <div className="hero-background-pattern">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                {/* FIX: stroke-width → strokeWidth, stroke-linecap → strokeLinecap */}
                                <path d="M 20 0 L 0 0 L 0 20" fill="none" stroke="currentColor" strokeWidth="0.1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* FIX: class → className throughout */}
                <div className="hero-content">
                    <h1>Hire Verified <span className="highlight">Academic Experts</span></h1>
                    <p className="subtitle">
                        TopMark connects students with subject-specialist experts for essays, law assignments, nursing
                        coursework, cybersecurity projects, biology lab reports and dissertations. Secure escrow
                        payments. Guaranteed delivery.
                    </p>

                    {/* FIX #2: Prominent search bar added between subtitle and tags */}
                    <div className="search-container">
                        <div className="search-wrapper">
                            {/* Search icon */}
                            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Try 'nursing care plan'…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                            <button className="search-button" onClick={handleSearch}>Search</button>
                        </div>
                    </div>

                    {/* FIX #4: Tags moved into hero-content as clickable pills that pre-fill the search */}
                    <div className="popular-searches-row">
                        <span className="popular-label">Popular:</span>
                        {POPULAR_TAGS.map((tag) => (
                            <button
                                key={tag}
                                className="popular-pill"
                                onClick={() => handleTagClick(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <div className="hero-buttons">
                        <button className="btn btn-primary">Get Started</button>
                        <button className="btn btn-outline">Learn More</button>
                    </div>
                </div>
                <div className="tag-cloud-row">
                <h2 className="tag-cloud-title">You might be interested in Essay and Research</h2>
                <div className="tags-container">
                    <div className="tag-row">
                        <span className="tag">Argumentative Essay</span>
                        <span className="tag">Literature Review</span>
                        <span className="tag">Reflective Essay</span>
                        <span className="tag">Case Study</span>
                    </div>
                    <div className="tag-row">
                        <span className="tag">Systematic Review</span>
                        <span className="tag">Research Proposal</span>
                        <span className="tag">Annotated Bibliography</span>
                        <span className="tag">Dissertation</span>
                    </div>
                </div>
            </div>
                

                {/* FIX #3: Scroll cue chevron at the bottom of the hero */}
                <div className="scroll-cue" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>

                {/* FIX #4: photography-section / tag cloud removed from here — moved below hero */}
            </section>

            {/* FIX #4: Tag cloud now lives *below* the hero as its own standalone row */}
            

            {/* ── CATEGORIES ── */}
            {/* FIX: class → className; padding handled in SCSS with clamp */}
            <section id="categories" className="categories">
                <div className="container">
                    <h2>Find Expert Help By Subject</h2>
                    <div className="categories-grid">

                        <div className="card">
                            <div className="card-content">
                                {/* FIX: class → className, stroke-width → strokeWidth, stroke-linecap → strokeLinecap, stroke-linejoin → strokeLinejoin */}
                                <svg className="card-icon text-blue-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                                </svg>
                                <h3>Cybersecurity</h3>
                                <p>Network security, pen testing reports.</p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-content">
                                <svg className="card-icon text-red-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                                <h3>Data Science &amp; Statistics</h3>
                                <p>R, Python, SPSS, regression analysis.</p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-content">
                                <svg className="card-icon text-purple-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
                                </svg>
                                <h3>Nursing &amp; Healthcare</h3>
                                <p>Care plans, SOAP notes, pharmacology.</p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-content">
                                <svg className="card-icon text-green-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                </svg>
                                <h3>History &amp; Humanities</h3>
                                <p>Historical analysis, thesis writing.</p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-content">
                                <svg className="card-icon text-orange-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                                <h3>Biology &amp; Life Sciences</h3>
                                <p>Lab reports, genetics, molecular biology.</p>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-content">
                                <svg className="card-icon text-teal-600" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                                <h3>Law &amp; Legal Studies</h3>
                                <p>Case briefs, contract law, legal essays.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <Featured />
            <TrustedBy />
            <Slide slidesToShow={5} arrowsScroll={5}>
                {cards.map((card) => <CatCard item={card} key={card.id} />)}
            </Slide>

            <div className="explore">
                <div className="container">
                    <h1>You need it, we've got it</h1>
                    <div className="items">
                        <div className="item" onClick={() => navigate(`gigs?cat=Graphics & Design`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/graphics-design.d32a2f8.svg" alt="" />
                            <div className="line" /><span>Graphics &amp; Design</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Digital Marketing`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/online-marketing.74e221b.svg" alt="" />
                            <div className="line" /><span>Digital Marketing</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Writing & Translation`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/writing-translation.32ebe2e.svg" alt="" />
                            <div className="line" /><span>Writing &amp; Translation</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Video & Animation`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/video-animation.f0d9d71.svg" alt="" />
                            <div className="line" /><span>Video &amp; Animation</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Music & Audio`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/music-audio.320af20.svg" alt="" />
                            <div className="line" /><span>Music &amp; Audio</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Programming & Tech`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/programming.9362366.svg" alt="" />
                            <div className="line" /><span>Programming &amp; Tech</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Business`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/business.bbdf319.svg" alt="" />
                            <div className="line" /><span>Business</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Lifestyle`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/lifestyle.745b575.svg" alt="" />
                            <div className="line" /><span>Lifestyle</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Data`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/data.718910f.svg" alt="" />
                            <div className="line" /><span>Data</span>
                        </div>
                        <div className="item" onClick={() => navigate(`gigs?cat=Photography`)}>
                            <img src="https://fiverr-res.cloudinary.com/npm-assets/@fiverr/logged_out_homepage_perseus/apps/photography.01cf943.svg" alt="" />
                            <div className="line" /><span>Photography</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="features dark">
                <div className="container">
                    <div className="item">
                        <h1>TopMark <em><span style={{ fontWeight: '300' }}>for Students.</span></em></h1>
                        <h1>Academic help you can <em>trust</em></h1>
                        <p>Every expert is verified by subject. Every payment is protected by escrow. Every order is rated on rubric adherence, timeliness and communication.</p>
                        <div className="title"><img src="/images/check.png" alt="check" />Verified subject-specialist experts</div>
                        <div className="title"><img src="/images/check.png" alt="check" />Secure escrow — pay only when satisfied</div>
                        <div className="title"><img src="/images/check.png" alt="check" />Rubric-adherence scoring on every order</div>
                        <div className="title"><img src="/images/check.png" alt="check" />24-hour express turnaround available</div>
                        <button>Get Started Free</button>
                    </div>
                    <div className="item">
                        <img src="images/hero6.webp" alt="imagea" />
                    </div>
                </div>
            </div>

            {/* FIX #5: position:relative on .left container, removed scaleX(5) from image */}
            <div className="logo_maker">
                <div className="items">
                    <div className="left">
                        <h1>TopMark <span>for Experts.</span></h1>
                        <p className="first_para">Start earning from<br />
                            <em className="first_para_em"> your expertise</em>
                        </p>
                        <p className="second_para">Create your expert profile, set your packages and start receiving orders from students worldwide.</p>
                        <button className="logo_button"><strong>Become an Expert</strong></button>
                    </div>
                    <div className="right">
                        <img src="/images/logomaker.webp" alt="" />
                    </div>
                </div>
            </div>

            <div className="secondslide">
                <p className="second_slider_heading">Work completed on TopMark</p>
                <Slide slidesToShow={4} arrowsScroll={5}>
                    {projects.map((card) => <ProjectCard item={card} key={card.id} />)}
                </Slide>
            </div>

        </div>
    ]);
};

export default Home;