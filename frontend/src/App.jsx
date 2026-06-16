import { Routes, Route } from "react-router-dom"
import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"
import StudentDashboard from "./pages/StudentDashboard"
import ExploreProjects from "./pages/ExploreProjects"
import SubmitProject from "./pages/SubmitProject"
import Statistics from "./pages/Statistics"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/explore" element={<ExploreProjects />} />
      <Route path="/submit-project" element={<SubmitProject />} />
      <Route path="/statistics" element={<Statistics />} />
    </Routes>
  )
}
