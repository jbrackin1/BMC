/** @format */

import React from "react";
import "./footer.css";
import "../../App.css";

function Footer() {
	return (
		<footer className="footer">
			<div className="footer-left">
				<p className="footer-brand">© 2025 bettermindcare</p>
			</div>
			<ul className="footer-right">
				<li>
					<a href="#privacy">Privacy Policy</a>
				</li>
				<li>
					<a href="#terms">Terms of Use</a>
				</li>
				<li>
					<a href="#contact">Contact</a>
				</li>
			</ul>
		</footer>
	);
}

export default Footer;
