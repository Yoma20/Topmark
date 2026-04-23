import { useState, useRef, useEffect } from "react";
import './gigs.scss';
import GigCard from '../../components/GigCard/GigCard';
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useLocation } from "react-router-dom";

const Gigs = () => {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState("sales");
  const minRef = useRef();
  const maxRef = useRef();
  const { search } = useLocation();

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['gigs', sort],
    queryFn: () =>
      newRequest.get(
        `/gigs/${search ? search + '&' : '?'}min=${minRef.current?.value || ''}&max=${maxRef.current?.value || ''}&sort=${sort}`
      ).then((res) => res.data),
  });

  useEffect(() => { refetch(); }, [sort]);

  return (
    <div className="gigs">
      <div className="container">
        <span className="breadcrumbs">TOPMARK &gt; BROWSE GIGS</span>
        <h1>Find an Expert</h1>
        <p>Browse academic services from verified experts</p>
        <div className="menu">
          <div className="left">
            <span>Budget</span>
            <input ref={minRef} type="number" placeholder="min" />
            <input ref={maxRef} type="number" placeholder="max" />
            <button onClick={() => refetch()}>Apply</button>
          </div>
          <div className="right">
            <span className="sortBy">Sort by</span>
            <span className="sortType">
              {sort === "sales" ? "Best Selling" : "Newest"}
            </span>
            <img src="/images/down.png" alt="" onClick={() => setOpen(!open)} />
            {open && (
              <div className="rightMenu">
                {sort === "sales"
                  ? <span onClick={() => { setSort('created_at'); setOpen(false); }}>Newest</span>
                  : <span onClick={() => { setSort('sales'); setOpen(false); }}>Best Selling</span>
                }
              </div>
            )}
          </div>
        </div>
        <div className="cards">
          {isLoading
            ? <div className="loader"></div>
            : error
              ? <h4 style={{ color: "red" }}>Something went wrong</h4>
              : !data?.length
                ? <h4>No gigs found</h4>
                : data.map((gig) => <GigCard key={gig.id} item={gig} />)
          }
        </div>
      </div>
    </div>
  );
};

export default Gigs;