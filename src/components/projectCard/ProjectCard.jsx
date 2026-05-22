import React from "react";
import './projectcard.scss';
import { Link } from "react-router-dom";

const ProjectCard = ({ item }) => {
    return (
        <Link to={`/gigs?cat=${item.cat}`} className="link">
            <div className="projectcard">
                {/* FIX: explicit dimensions + descriptive alt */}
                <img
                    src={item.img}
                    alt={item.cat}
                    width={300}
                    height={210}
                    loading="lazy"
                />
                <div className="info">
                    {/* FIX: explicit dimensions + alt on avatar */}
                    <img
                        src={item.pp}
                        alt={item.username}
                        width={40}
                        height={40}
                        loading="lazy"
                    />
                    <div className="texts">
                        {/* FIX: h2 is correct here — sits under Home's h2 sections */}
                        <h2>{item.cat}</h2>
                        <span>{item.username}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;