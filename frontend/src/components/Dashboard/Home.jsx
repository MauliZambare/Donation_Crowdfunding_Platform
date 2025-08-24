import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Home.css";

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: "",
    creatorId: "",
    image: "",
  });

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/campaigns");
      setCampaigns(res.data);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit campaign
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/campaigns", formData, {
        headers: { "Content-Type": "application/json" },
      });
      Swal.fire("Success!", "Campaign created successfully!", "success");
      setFormData({
        title: "",
        description: "",
        targetAmount: "",
        deadline: "",
        creatorId: "",
        image: "",
      });
      fetchCampaigns(); // refresh list
    } catch (err) {
      console.error("Error creating campaign:", err);
      Swal.fire(
        "Error!",
        err.response?.data?.message || "Failed to create campaign",
        "error"
      );
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Left Side: Show All Campaigns */}
        <div className="col-md-7">
          <h3 className="home-title">All Campaigns</h3>
          {campaigns.map((c) => (
            <div key={c.id} className="card shadow mb-4 campaign-card">
              {c.image && (
                <img
                  src={c.image}
                  alt={c.title}
                  className="card-img-top campaign-img"
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{c.title}</h5>
                <p className="card-text">{c.description}</p>
                <p>
                  <strong>Target:</strong> ₹{c.targetAmount}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      c.status === "active" ? "text-success" : "text-danger"
                    }
                  >
                    {c.status || "N/A"}
                  </span>
                </p>
                <p>
                  <strong>Deadline:</strong>{" "}
                  {c.deadline
                    ? new Date(c.deadline).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Post Campaign Form */}
        <div className="col-md-5">
          <h2 className="home-title">Post New Campaign</h2>
          <form className="card p-4 shadow" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter campaign title"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter campaign description"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Target Amount</label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter target amount"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Deadline</label>
              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Creator ID</label>
              <input
                type="text"
                name="creatorId"
                value={formData.creatorId}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter creator ID"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter image URL"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Create Campaign
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
