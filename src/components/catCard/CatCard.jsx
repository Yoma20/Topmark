import React from "react";
import './catCard.scss';
import { Link } from "react-router-dom";

const CatCard = ({ item }) => {
   
    return (
        <Link to={`/gigs?cat=${item.title}`} className="catcard-link">
            <div className="catCard">
                <img src={item.img} alt={item.title} loading="lazy" />
                <span className="desc">{item.desc}</span>
                <span className="title">{item.title}</span>
            </div>
        </Link>
    );
};

export default CatCard;