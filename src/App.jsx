import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './index.css';
import Login from './pages/Login';
import DashboardLayout from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Enquiries from './pages/Enquiries';
import Projects from './pages/Projects';
import TeamMembers from './pages/TeamMembers';
import Blog from './pages/Blog';
import BlogForm from './pages/BlogForm';
import Categories from './pages/Categories';
import ContactUs from './pages/ContactUs';
import Subscribers from './pages/Subscribers';
import Settings from './pages/Settings';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="projects" element={<Projects />} />
            <Route path="team-members" element={<TeamMembers />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/create" element={<BlogForm />} />
            <Route path="blog/edit/:id" element={<BlogForm />} />
            <Route path="categories" element={<Categories />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
