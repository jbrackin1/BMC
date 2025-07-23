import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { setUser } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async () => {
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include", // 🔐 SEND cookies
				body: JSON.stringify({ email, password })
			});
            console.log(res)
			if (res.ok) {
				const data = await res.json();
                console.log(data)

				setUser(data.user); // saved in context only
				navigate("/dashboard");
			} else {
				alert("Invalid login");
			}
		} catch (err) {
			console.error(err);
			alert("Login failed");
		}
	};

	return (
		<div className="login-form">
			<input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
			<input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
			<button onClick={handleLogin}>Log In</button>
		</div>
	);
}