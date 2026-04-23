import { Link } from "react-router-dom";
import "./myGigs.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyGigs() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["myGigs"],
    queryFn: () => newRequest.get(`/gigs/mine/`).then((res) => res.data),
  });

  const mutation = useMutation({
    mutationFn: (id) => newRequest.delete(`/gigs/${id}/manage/`),
    onSuccess: () => queryClient.invalidateQueries(["myGigs"]),
  });

  return (
    <div className="myGigs">
      {isLoading ? "Loading…" : error ? "Something went wrong" : (
        <div className="container">
          <div className="title">
            <h1>My Gigs</h1>
            {currentUser?.user_type === 'expert' && (
              <Link to="/add"><button>Add New Gig</button></Link>
            )}
          </div>
          <table>
            <tbody>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Starting Price</th>
                <th>Sales</th>
                <th>Action</th>
              </tr>
              {data.map((gig) => (
                <tr key={gig.id}>
                  <td>
                    <img className="image" src={gig.cover_image || '/images/noavatar.jpeg'} alt="" />
                  </td>
                  <td>{gig.title}</td>
                  <td>${gig.starting_price ?? '—'}</td>
                  <td>{gig.sales}</td>
                  <td>
                    <img
                      className="delete"
                      src="/images/delete.png"
                      alt="delete"
                      onClick={() => mutation.mutate(gig.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyGigs;