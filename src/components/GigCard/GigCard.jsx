import React from "react";
import './gigCard.scss'
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const GigCard = ({ item }) => {
    const { isLoading, error, data } = useQuery({
        queryKey: [`${item.userId}`],
        queryFn: () =>
            newRequest.get(`/users/${item.userId}`)
                .then((res) => {
                    return res.data;
                })
            })
    return ([
        <Link to={`/gig/${item._id}`} className="link" key={item._id}>
            <div className="gigCard">
                <img src={item.cover} alt={`${item.title || item.desc} — Topmark`} />
                <div className="info">
                    {isLoading ? "loading" : error ? "something wrong" : <div className="user">
                        <img src={data.img || '/images/noavtar.jpeg'} alt={`${data.username} profile photo`} />
                        <span>{data.username}</span>
                    </div>}
                    <p>{item.desc}</p>
                    <div className="star">
                        <img src="/images/star.png" alt="star rating" />
                        <span>
                            {item.expert?.rating > 0
                                ? parseFloat(item.expert.rating).toFixed(1)
                                : "New"}
                        </span>
                    </div>
                </div>
                <hr />
                <div className="details">
                    <img src="/images/heart.png" alt="save to favourites" />
                    <div className="price">
                        <span>STARTING AT</span>
                        <h2>$ {item.price}<sup>99</sup></h2>
                    </div>
                </div>
            </div>
        </Link>
    ]);
}
export default GigCard;