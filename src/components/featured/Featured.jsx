import React, { useState } from "react";
import './featured.scss';
import { useNavigate } from 'react-router-dom';

function Featured() {
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    const handleSubmit = () => {
        if (input.trim()) navigate(`gigs?search=${encodeURIComponent(input.trim())}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    return (
        // FIX: removed array wrapper [] — invalid React return pattern
        // FIX: section instead of bare div — Featured is a content region inside <main>
        <section className="featured">
            <div className="container">
                <div className="left">
                    {/* FIX: demoted from h1 to h2 — Home already has the page h1 in the hero.
                        Visual size unchanged; controlled via .featured .left h2 in SCSS. */}
                    <h2>
                        Find the perfect <span>academic</span><br />
                        <span>expert</span> for your assignment
                    </h2>
                    <div className="search">
                        <div className="searchInput">
                            {/* FIX: explicit dimensions + alt on search icon */}
                            <img src="/images/search.png" alt="" aria-hidden="true" width={20} height={20} />
                            <input
                                type="text"
                                placeholder='Try "nursing care plan" or "law essay APA"'
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button onClick={handleSubmit}>Search</button>
                    </div>
                    <div className="popular">
                        <span>Popular:</span>
                        <button onClick={e => navigate(`gigs?search=${encodeURIComponent(e.target.innerText)}`)}>Law Essay</button>
                        <button onClick={e => navigate(`gigs?search=${encodeURIComponent(e.target.innerText)}`)}>Nursing Care Plan</button>
                        <button onClick={e => navigate(`gigs?search=${encodeURIComponent(e.target.innerText)}`)}>Cybersecurity Report</button>
                        <button onClick={e => navigate(`gigs?search=${encodeURIComponent(e.target.innerText)}`)}>Dissertation Help</button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Featured;