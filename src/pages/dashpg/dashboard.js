/** @format */

import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

function Dashboard() {
	const navigate = useNavigate();

	return (
		<div className="dashboard-page">
			<h1>Welcome to Your Dashboard</h1>
			<p>
				Your intake is complete. View your personalized report or explore next
				steps.
			</p>

			<div className="dashboard-actions">
				<button className="btn" onClick={() => navigate("/report")}>
					View Patient Report
				</button>
				<button className="btn-outline" onClick={() => navigate("/lab-order")}>
					Order Labs
				</button>
				<button
					className="btn-outline"
					onClick={() => navigate("/screening-order")}>
					Screening Tests
				</button>
			</div>
		</div>
	);
}

export default Dashboard;
