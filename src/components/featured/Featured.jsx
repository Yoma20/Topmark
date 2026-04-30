import React, { useState } from "react";
import './featured.scss';
import{ useNavigate} from 'react-router-dom';

function Featured() {
  const [input,setinput]=useState("");
  const navigate=useNavigate();
  const handlesubmit=()=>{
    navigate(`gigs?search=${input}`);
  }
    return (
     [ 
      <div className="featured">
        <div className="container">
          <div className="left">
          <h1>
              Find the perfect <span>academic</span> <br></br>
              <span>expert</span> for your assignment
            </h1>
            <div className="search">
              <div className="searchInput">
                <img src="/images/search.png" alt="" />
                <input type="text" placeholder='Try "nursing care plan" or "law essay APA"' onChange={e=>setinput(e.target.value)} />
              </div>
              <button onClick={handlesubmit}>Search</button>
            </div>
            <div className="popular">
              <span>Popular:</span>
              <button onClick={e=>navigate(`gigs?search=${e.target.innerHTML}`)}>Law Essay</button>
              <button onClick={e=>navigate(`gigs?search=${e.target.innerHTML}`)}>Nursing Care Plan</button>
              <button onClick={e=>navigate(`gigs?search=${e.target.innerHTML}`)}>Cybersecurity Report</button>
              <button onClick={e=>navigate(`gigs?search=${e.target.innerHTML}`)}>Dissertation Help</button>
            </div>
          </div>
        </div>
      </div>]
    );
  }
export default Featured;