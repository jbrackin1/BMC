import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
	const { user } = useAuth();
	return user ? children : <Navigate to="/login" replace />;
}