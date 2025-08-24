import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Home.css";

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!loggedInUser) {
      window.location.href = "/login";
    } else {
      fetchCampaigns();
    }
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/campaigns");
      setCampaigns(res.data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  const handleDonate = (campaignId) => {
    Swal.fire("Donate", `Donation flow for campaign ID: ${campaignId}`, "info");
  };

  return (
    <div className="home-container">
      <h2 className="home-title">All Campaigns</h2>
      <div className="campaign-grid">
        {campaigns.map((c) => (
          <div key={c.id} className="campaign-card">
            {c.image && <img src={`http://localhost:8080${c.image}`} alt={c.title} className="campaign-img" />}
            <div className="card-content">
              <h5>{c.title}</h5>
              <p>{c.description}</p>
              <p><strong>Target:</strong> ₹{c.targetAmount}</p>
              <p><strong>Deadline:</strong> {c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"}</p>
              {loggedInUser?.userType?.toLowerCase() === "donor" && (
                <button className="btn btn-primary donate-btn" onClick={() => handleDonate(c.id)}>Donate</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
