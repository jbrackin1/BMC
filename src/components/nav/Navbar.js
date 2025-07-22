/** @format */

import "./navbar.css";
import "../../App.css";
import logo from "../../assets/BMCLogo.webp";
import { Link } from "react-router-dom";

function Navbar() {
	return (
		<nav className="navbar" aria-label="Main navigation">
			<div className="navbar-left">
				<Link to="/" className="navbar-logo">
					<img src={logo} alt="BetterMindCare logo" className="logo" />
					<span className="brand">bettermindcare</span>
				</Link>
			</div>
			<ul className="navbar-right">
				<li>
					<Link to="/about">ABOUT</Link>
				</li>
				<li>
					<Link to="/intake-form">SERVICES</Link>
				</li>
				<li>
					<Link to="/resources">RESOURCES</Link>
				</li>
				<li>
					<Link to="/contact">CONTACT</Link>
				</li>
			</ul>
		</nav>
	);
}

export default Navbar;
