/** @format */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Shared Layout Components
import Navbar from "./components/nav/Navbar";
import Footer from "./components/footers/Footer";

// Pages
import Home from "./pages/homepg/home";
import About from "./pages/aboutpg/about";
import Contact from "./pages/contactpg/contact";
import Resources from "./pages/resourcepg/resources";

// TODO: Add these when they're created:
import IntakeForm from "./pages/intakepg/intakeForm";
import PatientReport from "./pages/reportspg/patientReport";
import Dashboard from "./pages/dashpg/dashboard";
// import LabOrder from "./pages/labOrder";
// import ScreeningOrder from "./pages/screeningOrder";

// import Profile from "./pages/profile";
// import NotFound from "./pages/notFound";

function App() {
	return (
		<Router>
			<div className="App">
				<Navbar />

				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/intake-form" element={<IntakeForm />} />
					<Route path="/contact" element={<Contact />} />
					<Route path="/resources" element={<Resources />} />
					<Route path="/about" element={<About />} />
					<Route path="/report" element={<PatientReport />} />
					<Route path="/dashboard" element={<Dashboard />} />

					{/* 
					<Route path="/lab-order" element={<LabOrder />} />
					<Route path="/screening-order" element={<ScreeningOrder />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="*" element={<NotFound />} /> */}
				</Routes>

				<Footer />
			</div>
		</Router>
	);
}

export default App;
