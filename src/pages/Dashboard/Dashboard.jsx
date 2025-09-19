import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  BriefcaseIcon,
  UsersIcon,
  ClockIcon,
  ShareIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  ArrowLeftOnRectangleIcon, // For Logout
} from "@heroicons/react/24/solid";
import ProjectOverview from "./project/ProjectOverview";
import Project from "./project/Project";
import Addproject from "./project/Addproject";
import DashboardContent from "./DashboardContent/DashboardContent";

// Placeholder components for each section.
const Customers = () => <div className="p-8"><h1>Customers</h1></div>;
const Team = () => <div className="p-8"><h1>Team Members</h1></div>;
const Resources = () => <div className="p-8"><h1>Resources</h1></div>;
const Profile = () => <div className="p-8"><h1>User Profile</h1></div>;

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // If no user data, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear local storage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarLinks = [
    { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
    { name: "Projects", path: "/dashboard/projects", icon: BriefcaseIcon },
    { name: "Customers", path: "/dashboard/customers", icon: UsersIcon },
    { name: "Team", path: "/dashboard/team", icon: ClockIcon },
    { name: "Resources", path: "/dashboard/resources", icon: ShareIcon },
    { name: "Profile", path: "/dashboard/profile", icon: ChatBubbleBottomCenterTextIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#E6EAF5]">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="text-xl font-semibold text-gray-800 font-main">
            Good morning, <span className="text-[#4A90E2] font-second">{user?.firstName || 'User'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 mr-10">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 font-second w-[400px] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
            />
          </div>
          
          <img
            src={user?.profilepic || "https://via.placeholder.com/32"}
            alt="User profile"
            className="h-8 w-8 rounded-full border-2 border-[#4A90E2] cursor-pointer"
          />
           <button onClick={handleLogout} className="p-2 text-gray-500 rounded-full hover:bg-gray-200" title="Logout">
              <ArrowLeftOnRectangleIcon className="h-6 w-6"/>
            </button>
        </div>
      </header>

      {/* Main Layout: Sidebar & Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside 
          className={`flex flex-col justify-between p-4 py-8 transition-all duration-300 ease-in-out shadow-lg ${isSidebarOpen ? "w-64" : "w-20"}`}
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex flex-col items-start space-y-4 w-full">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center font-second gap-4 w-full p-3 rounded-lg text-gray-800 hover:bg-[#E6F0FA] hover:text-[#4A90E2] transition-colors duration-300 ease-in-out ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 absolute -z-10"}`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-col items-start space-y-4 w-full">
            <div className="w-full h-px bg-gray-300"></div>
            <Link to="/settings" className={`flex items-center gap-4 w-full p-3 rounded-lg text-gray-800 hover:bg-[#E6F0FA] hover:text-[#4A90E2] transition-colors duration-300 ease-in-out ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <Cog6ToothIcon className="h-6 w-6" />
              <span className={`whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 absolute -z-10"}`}>
                Settings
              </span>
            </Link>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-3 rounded-full text-gray-800 hover:bg-gray-200 transition-colors self-center"
          >
            {isSidebarOpen ? <ChevronDoubleLeftIcon className="h-6 w-6" /> : <ChevronDoubleRightIcon className="h-6 w-6" />}
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="h-full w-full rounded-lg bg-[#edeef2] shadow-lg p-6">
            <Routes>
              <Route index element={<DashboardContent />} />
              <Route path="projects" element={<Project/>} />
              <Route path="projects/:id" element={<ProjectOverview />} />
              <Route path="customers" element={<Customers />} />
              <Route path="team" element={<Team />} />
              <Route path="resources" element={<Resources />} />
              <Route path="profile" element={<Profile />} />
              <Route path="addproject" element={<Addproject />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
