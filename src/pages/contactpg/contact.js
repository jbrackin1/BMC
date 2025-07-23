/** @format */

import React from "react";
import "./contact.css";

function Contact() {
	return (
		<div className="contact-page">
			<h1>Contact Us</h1>
			<p>
				We’re here to help. Whether you have questions about your intake, your
				report, or just need a human to talk to — we’ve got your back.
			</p>

			<div className="contact-section">
				<h3>📧 Email</h3>
				<p>
					<a href="mailto:support@BetterMindCare.com">
						support@BetterMindCare.com
					</a>
				</p>

				<h3>📞 Phone</h3>
				<p>(XXX) XXX-XXXX</p>

				<h3>📅 Schedule a Call</h3>
				<p>
					<a
						href="https://calendly.com/your-intake-link" // Replace with your actual link
						target="_blank"
						rel="noopener noreferrer">
						Book a time to speak with a care advisor
					</a>
				</p>
			</div>

			<div className="feedback-form">
				<h3>Send Us a Message</h3>
				<form>
					<input type="text" placeholder="Your Name" required />
					<input type="email" placeholder="Your Email" required />
					<textarea placeholder="Your Message" rows="5" required></textarea>
					<button type="submit" className="btn">
						Send Message
					</button>
				</form>
			</div>
		</div>
	);
}

export default Contact;
