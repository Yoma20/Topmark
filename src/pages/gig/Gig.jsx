import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { Link, useParams } from "react-router-dom";
import Reviews from "../../components/reviews/Reviews";

const Gig = () => {
  const { id } = useParams();
  const { isLoading, error, data } = useQuery({
    queryKey: ['gig'],
    queryFn: () =>
      newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
  });

  const userId = data?.userId;
  const { isLoading: isLoadingUser, error: errorUser, data: dataUser } = useQuery({
    queryKey: ['user'],
    queryFn: () =>
      newRequest.get(`/users/${userId}`).then((res) => res.data),
    enabled: !!userId,
  });

  const sliderSettings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="gig bg-gray-100 py-8">
      {isLoading ? (
        <div className="loader animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto"></div>
      ) : error ? (
        <h4 className="text-red-500 text-center">Something Went Wrong</h4>
      ) : (
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
          <div className="left flex-1">
            <span className="breadcrumbs uppercase text-gray-500 text-sm">
              TOPMARK &gt; GRAPHICS & DESIGN &gt;
            </span>
            <h1 className="text-3xl font-bold mt-2">{data.title}</h1>
            {isLoadingUser ? (
              <div className="text-gray-500">Loading</div>
            ) : errorUser ? (
              <div className="text-red-500">Something went wrong</div>
            ) : (
              <div className="user flex items-center gap-4 mt-4">
                <img
                  src={dataUser.img || "/images/noavatar.jpeg"}
                  alt=""
                  className="pp w-12 h-12 rounded-full object-cover"
                />
                <span className="text-lg font-semibold">{dataUser.username}</span>
                {!isNaN(data.totalStars / data.starNumber) && (
                  <div className="stars flex items-center gap-1">
                    {Array(Math.round(data.totalStars / data.starNumber))
                      .fill()
                      .map((_, i) => (
                        <img src="/images/star.png" alt="" key={i} className="w-5 h-5" />
                      ))}
                    <span className="text-yellow-500 font-semibold">
                      {Math.round(data.totalStars / data.starNumber)}
                    </span>
                  </div>
                )}
              </div>
            )}
            <Slider {...sliderSettings} className="slider my-6">
              {data.images.map((img) => (
                <div key={img}>
                  <img
                    src={img}
                    alt=""
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
              ))}
            </Slider>
            <h2 className="text-2xl font-semibold mt-6">About This Gig</h2>
            <p className="text-gray-700 mt-2">{data.desc}</p>
            {isLoadingUser ? (
              <div className="text-gray-500">Loading</div>
            ) : errorUser ? (
              <div className="text-red-500">Something went wrong</div>
            ) : (
              <div className="seller mt-8">
                <h2 className="text-2xl font-semibold">About The Seller</h2>
                <div className="user flex items-center gap-4 mt-4">
                  <img
                    src={dataUser.img || "/images/noavatar.jpeg"}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="info">
                    <span className="text-lg font-semibold">{dataUser.username}</span>
                    {!isNaN(data.totalStars / data.starNumber) && (
                      <div className="stars flex items-center gap-1 mt-1">
                        {Array(Math.round(data.totalStars / data.starNumber))
                          .fill()
                          .map((_, i) => (
                            <img src="/images/star.png" alt="" key={i} className="w-5 h-5" />
                          ))}
                        <span className="text-yellow-500 font-semibold">
                          {Math.round(data.totalStars / data.starNumber)}
                        </span>
                      </div>
                    )}
                    <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                      Contact Me
                    </button>
                  </div>
                </div>
                <div className="box border border-gray-300 rounded-lg p-6 mt-6">
                  <div className="items grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="item">
                      <span className="title font-semibold text-gray-600">From</span>
                      <span className="desc block text-gray-800">{dataUser.country}</span>
                    </div>
                    <div className="item">
                      <span className="title font-semibold text-gray-600">Member since</span>
                      <span className="desc block text-gray-800">Aug 2022</span>
                    </div>
                    <div className="item">
                      <span className="title font-semibold text-gray-600">Avg. response time</span>
                      <span className="desc block text-gray-800">4 hours</span>
                    </div>
                    <div className="item">
                      <span className="title font-semibold text-gray-600">Last delivery</span>
                      <span className="desc block text-gray-800">1 day</span>
                    </div>
                    <div className="item">
                      <span className="title font-semibold text-gray-600">Languages</span>
                      <span className="desc block text-gray-800">English</span>
                    </div>
                  </div>
                  <hr className="my-4" />
                  <p className="text-gray-700">{dataUser.desc}</p>
                </div>
              </div>
            )}
            <Reviews gigId={id} key={id} />
          </div>
          <div className="right lg:w-1/3 sticky top-4 self-start">
            <div className="price border border-gray-300 rounded-lg p-6 bg-white">
              <h3 className="text-xl font-semibold">{data.sortTitle}</h3>
              <h2 className="text-2xl font-bold mt-2">${data.price}</h2>
            </div>
            <p className="text-gray-700 mt-4">{data.sortDesc}</p>
            <div className="details mt-4">
              <div className="item flex items-center gap-2">
                <img src="/images/clock.png" alt="" className="w-6 h-6" />
                <span className="text-gray-700">{data.deliveryTime} days Delivery</span>
              </div>
              <div className="item flex items-center gap-2 mt-2">
                <img src="/images/recycle.png" alt="" className="w-6 h-6" />
                <span className="text-gray-700">{data.rivisonNumber} Revisions</span>
              </div>
            </div>
            <div className="features mt-4">
              {data.features.map((feature) => (
                <div className="item flex items-center gap-2 mt-2" key={feature}>
                  <img src="/images/greencheck.png" alt="" className="w-6 h-6" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <Link to={`/pay/${id}`}>
              <button className="w-full mt-6 bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600">
                Continue
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};


export default Gig;
