import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	// Check cookie-based session on load
	const checkSession = async () => {
		try {
			const res = await fetch("api/auth/me", {
				credentials: "include"
			});
			if (res.ok) {
				const data = await res.json();
				setUser(data.user);
			}
		} catch {
			// No session or error
		}
	};

	useEffect(() => {
		checkSession();
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => useContext(AuthContext);
