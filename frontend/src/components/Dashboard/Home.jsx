import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "./Home.css";

const Home = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: "",
    creatorId: "",
    file: null,
  });
  const [previewImage, setPreviewImage] = useState(null); // for form preview

  // Fetch campaigns
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

  // Handle input change
  const handleChange = (e) => {
    if (e.target.name === "file") {
      const file = e.target.files[0];
      setFormData({ ...formData, file });
      setPreviewImage(file ? URL.createObjectURL(file) : null); // show preview
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Submit campaign
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      const campaignObj = {
        title: formData.title,
        description: formData.description,
        targetAmount: formData.targetAmount,
        deadline: formData.deadline,
        creatorId: formData.creatorId,
      };
      data.append(
        "campaign",
        new Blob([JSON.stringify(campaignObj)], { type: "application/json" })
      );
      if (formData.file) data.append("file", formData.file);

      await axios.post("http://localhost:8080/api/campaigns", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Success!", "Campaign created successfully!", "success");
      setFormData({
        title: "",
        description: "",
        targetAmount: "",
        deadline: "",
        creatorId: "",
        file: null,
      });
      setPreviewImage(null); // reset preview
      setShowForm(false);
      fetchCampaigns();
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
    <div className="container mt-4 home-container">
      <div className="mb-4 d-flex gap-2">
        <button className="btn btn-primary" onClick={() => setShowForm(false)}>
          Show All Campaigns
        </button>
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          Post Campaign
        </button>
      </div>

      {showForm ? (
        <div className="col-md-8 mx-auto">
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
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="form-control"
                accept="image/*"
                required
              />
            </div>

            {/* Full-size preview */}
            {previewImage && (
              <div className="mb-3 text-center">
                <label className="form-label">Preview:</label>
                <img
                  src={previewImage}
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: "600px",
                    objectFit: "contain",
                    borderRadius: "5px",
                  }}
                />
              </div>
            )}

            <button type="submit" className="btn btn-success w-100">
              Create Campaign
            </button>
          </form>
        </div>
      ) : (
        <div>
          <h3 className="home-title">All Campaigns</h3>
          {campaigns.map((c) => (
            <div key={c.id} className="card shadow mb-4 campaign-card">
              {c.image && (
                <img
                  src={`http://localhost:8080${c.image}`}
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
                    className={c.status === "active" ? "text-success" : "text-danger"}
                  >
                    {c.status || "N/A"}
                  </span>
                </p>
                <p>
                  <strong>Deadline:</strong>{" "}
                  {c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
