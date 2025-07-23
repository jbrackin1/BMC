/** @format */

import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/cards/Card";
import DividerWave from "../../components/bg/DividerWave";
import {
	PrimaryButton,
	SecondaryButton,
	NavyButton,
} from "../../components/button/Buttons";

import CaregiverIcon from "../../assets/icons/Caregiver.png";
import HeartHandsIcon from "../../assets/icons/HeartHands.png";
import LocationIcon from "../../assets/icons/Location.png";

function Home() {
	const navigate = useNavigate();

	return (
		<main className="main-content">
			<section className="hero-section">
				<h1>Supporting Alzheimer's Care & Families</h1>
				<p>
					We're here to guide, support, and empower caregivers and loved ones
					every step of the way.
				</p>

				<div className="button-row">
					<PrimaryButton>Learn More</PrimaryButton>
					<SecondaryButton onClick={() => navigate("/resources")}>
						Resources
					</SecondaryButton>
					<NavyButton onClick={() => navigate("/intake-form")}>
						Start Now
					</NavyButton>
				</div>

				<div className="card-wrapper">
					<Card title="Welcome" subtitle="Your intake is scheduled">
						<button className="btn">View Details</button>
					</Card>
				</div>

				<section className="card-section">
					<div className="card-grid">
						<Card
							title="For Caregivers"
							subtitle="Tips, advice..."
							icon={CaregiverIcon}
						/>
						<Card
							title="For Loved Ones"
							subtitle="Engaging activities...stuff this and that and the other"
							icon={HeartHandsIcon}
						/>
						<Card
							title="Local Resources"
							subtitle="Find services nearby"
							icon={LocationIcon}
						/>
					</div>
					<DividerWave />
				</section>
			</section>
		</main>
	);
}

export default Home;
