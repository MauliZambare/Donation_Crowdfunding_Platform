
import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import "./Home.css"; // custom css file

const Home = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    deadline: "",
    creatorId: "",
    image: "",
  });

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
      <h2 className="text-center mb-4">Create New Campaign</h2>

      <form className="card p-3 shadow" onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="number"
            name="targetAmount"
            placeholder="Target Amount"
            value={formData.targetAmount}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
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
          <input
            type="text"
            name="creatorId"
            placeholder="Creator ID"
            value={formData.creatorId}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="url"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Create Campaign
        </button>
      </form>
    </div>
  );
};

export default Home;
