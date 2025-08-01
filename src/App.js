/** @format */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Shared Layout Components
import Navbar from './components/nav/Navbar';
import Footer from './components/footers/Footer';

// Pages
import Home from './pages/homepg/home';
import About from './pages/aboutpg/about';
import Contact from './pages/contactpg/contact';
import Resources from './pages/resourcepg/resources';

// TODO: Add these when they're created:
import IntakeForm from './pages/intakepg/intakeForm';
import PatientReport from './pages/reportspg/patientReport';
import Dashboard from './pages/dashpg/dashboard';
import UserDetails from './pages/userdetailspg/UserDetails';
import MyReports from './pages/myreportspg/MyReports';
// import LabOrder from "./pages/labOrder";
import ScreeningOrder from './pages/screeningorderpg/ScreeningOrder';

// import Profile from "./pages/profile";
// import NotFound from "./pages/notFound";
import UserList from './pages/userslistpg/UserList';
import AuditLog from '../src/pages/auditpg/AuditLog';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Login from './pages/loginpg/login';
import SignUp from './pages/signuppg/SignUp';
import ForgotPassword from './pages/forgotpasswordpg/ForgotPassword';
import ResetPassword from './pages/resetpasswordpg/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute>
                  <UserDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intake-form"
              element={
                <ProtectedRoute>
                  <IntakeForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <PatientReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute>
                  <AuditLog />
                </ProtectedRoute>
              }
            />
            <Route path="/screening-order" element={<ScreeningOrder />} />
            <Route path="/sign-up" element={<SignUp />} />
            {/* 
					<Route path="/lab-order" element={<LabOrder />} />

					<Route path="/profile" element={<Profile />} />
					<Route path="*" element={<NotFound />} /> */}
          </Routes>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
