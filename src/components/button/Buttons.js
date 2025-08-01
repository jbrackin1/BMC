import React from "react";
import "./buttons.css";
import "../../App.css";


export function PrimaryButton({ children }) {
	return <button className="btn btn-teal">{children}</button>;
}

export function SecondaryButton({ children }) {
	return <button className="btn btn-white">{children}</button>;
}

export function NavyButton({ children }) {
	return <button className="btn btn-navy">{children}</button>;
}
