import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true); // 🚨 Needed to delay redirect

	// Check cookie-based session on load
	const checkSession = async () => {
		try {
			const res = await fetch("/api/auth/me", {
				credentials: "include"
			});
			if (res.ok) {
				const data = await res.json();
				setUser(data.user);
			}
		} catch (err) {
			console.error("Session check failed", err);
			setUser(null);
		} finally {
			setLoading(false); // ✅ Now done checking
		}
	};

	useEffect(() => {
		checkSession();
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}