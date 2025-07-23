/** @format */

import React from "react";
import "./inputtext.css";

function TextInput({ label, id, type = "text", placeholder, value, onChange }) {
	return (
		<div className="input-group">
			{label && <label htmlFor={id}>{label}</label>}
			<input
				type={type}
				id={id}
				name={id}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
			/>
		</div>
	);
}

export default TextInput;
