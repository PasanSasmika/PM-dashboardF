import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  BriefcaseIcon,
  UsersIcon,
  UserIcon,
  Cog6ToothIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  DocumentDuplicateIcon,
  ArrowUturnRightIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/solid";
import ProjectOverview from "./project/ProjectOverview";
import Project from "./project/Project";
import Addproject from "./project/Addproject";
import DashboardContent from "./DashboardContent/DashboardContent";
import Customer from "./customers/Customer";
import Addcustomer from "./customers/AddCustomer";
import CustomerOverview from "./customers/CustomerOverview";
import EditCustomer from "./customers/EditCustomer";
import EditProject from "./project/EditProject";
import Resources from "./Resources/Resources";
import AddResources from "./Resources/AddResources";
import ResourceOverview from "./Resources/ResourcesOverview";
import axios from "axios";
import toast from "react-hot-toast";
import logo from "/logo.png";
import Profile from "../profile/Profile";
import Organization from "./Organizations/organizations";
import AddOrganization from "./Organizations/addorganizations";
import OrganizationOverview from "./Organizations/organizationOverview";
import EditOrganization from "./Organizations/editOrganization";


function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    projects: [],
    customers: [],
    resources: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch search results when searchQuery changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults({ projects: [], customers: [], resources: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Fetch all data
        const [projectsResponse, customersResponse, resourcesResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/projects"),
          axios.get("http://localhost:5000/api/customers"),
          axios.get("http://localhost:5000/api/resources"),
        ]);

        // Filter projects
        const filteredProjects = projectsResponse.data.filter(
          (project) =>
            project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Filter customers
        const filteredCustomers = customersResponse.data.filter(
          (customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone?.includes(searchQuery) ||
            customer.address?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Filter resources
        const filteredResources = resourcesResponse.data.filter(
          (resource) =>
            resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.files.some((file) =>
              file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

        setSearchResults({
          projects: filteredProjects,
          customers: filteredCustomers,
          resources: filteredResources,
        });
      } catch (err) {
        console.error("Error fetching search results:", err);
        toast.error("Failed to fetch search results.");
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300); // Debounce to avoid excessive API calls
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Logged out successfully!");
    setShowLogoutPopup(false);
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const sidebarLinks = [
    { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
    { name: "Projects", path: "/dashboard/projects", icon: BriefcaseIcon },
    { name: "Customers", path: "/dashboard/customers", icon: UsersIcon },
    { name: "Resources", path: "/dashboard/resources", icon: DocumentDuplicateIcon },
    { name: "Profile", path: "/dashboard/profile", icon: UserIcon },
    { name: "Organizations", path: "/dashboard/organization", icon: BuildingOffice2Icon },

  ];

  return (
    <div className="flex flex-col min-h-screen ">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Company Logo"
            className="h-10 w-10 rounded-full mr-4 object-cover"
          />
          <div className="text-xl font-semibold text-gray-800 font-main">
            Welcome back, <span className="text-[#4A90E2] font-second font-normal">{user?.firstName || 'User'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 mr-10">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, customers, resources..."
              className="pl-10 pr-4 py-2 font-second w-[400px] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute z-10 w-full mt-2  rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {isSearching && (
                  <div className="p-4 text-center text-gray-500 font-second">
                    Searching...
                  </div>
                )}
                {!isSearching && (
                  <>
                    {/* Projects */}
                    {searchResults.projects.length > 0 && (
                      <div className="p-2">
                        <h3 className="text-sm font-semibold text-gray-600 px-2 mb-2">Projects</h3>
                        {searchResults.projects.map((project) => (
                          <Link
                            key={project._id}
                            to={`/dashboard/projects/${project._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E6F0FA] font-second"
                            onClick={() => setSearchQuery("")} // Clear search on click
                          >
                            {project.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {/* Customers */}
                    {searchResults.customers.length > 0 && (
                      <div className="p-2">
                        <h3 className="text-sm font-semibold text-gray-600 px-2 mb-2">Customers</h3>
                        {searchResults.customers.map((customer) => (
                          <Link
                            key={customer._id}
                            to={`/dashboard/customers/${customer._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E6F0FA] font-second"
                            onClick={() => setSearchQuery("")}
                          >
                            {customer.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {/* Resources */}
                    {searchResults.resources.length > 0 && (
                      <div className="p-2">
                        <h3 className="text-sm font-semibold text-gray-600 px-2 mb-2">Resources</h3>
                        {searchResults.resources.map((resource) => (
                          <Link
                            key={resource._id}
                            to={`/dashboard/resources/${resource._id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#E6F0FA] font-second"
                            onClick={() => setSearchQuery("")}
                          >
                            {resource.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.projects.length === 0 &&
                      searchResults.customers.length === 0 &&
                      searchResults.resources.length === 0 && !isSearching && (
                        <div className="p-4 text-center text-gray-500 font-second">
                          No results found.
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </div>
          <Link to="/dashboard/profile">
          <img
            src={user?.profilepic || "https://via.placeholder.com/32"}
            alt="User profile"
            className="h-8 w-8 rounded-full border-2 border-[#4A90E2] cursor-pointer"
          /></Link>
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
                  className={`flex items-center font-second gap-4 w-full p-3 rounded-lg hover:text-[#4A90E2] transition-colors duration-300 ease-in-out ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
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
            <button
              onClick={handleLogout}
              className={`flex items-center gap-4 w-full p-3 rounded-lg text-gray-800 hover:bg-[#E6F0FA] hover:text-[#4A90E2] transition-colors duration-300 ease-in-out ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
            >
              <ArrowUturnRightIcon className="h-6 w-6" />
              <span className={`whitespace-nowrap transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 absolute -z-10"}`}>
                Logout
              </span>
            </button>
            <button
              onClick={toggleSidebar}
              className="p-3 rounded-full text-gray-800 hover:bg-gray-200 transition-colors self-center"
            >
              {isSidebarOpen ? <ChevronDoubleLeftIcon className="h-6 w-6" /> : <ChevronDoubleRightIcon className="h-6 w-6" />}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="h-full w-full rounded-lg  shadow-lg p-6">
            <Routes>
              <Route index element={<DashboardContent />} />
              <Route path="projects" element={<Project />} />
              <Route path="projects/:id" element={<ProjectOverview />} />
              <Route path="customers" element={<Customer />} />
              <Route path="resources" element={<Resources />} />
              <Route path="profile" element={<Profile />} />
              <Route path="organization" element={<Organization />} />
              <Route path="addorganization" element={<AddOrganization />} />
              <Route path="organizations/:id" element={<OrganizationOverview />} />
              <Route path="addproject" element={<Addproject />} />
              <Route path="addcustomer" element={<Addcustomer />} />
              <Route path="addresources" element={<AddResources />} />
              <Route path="customers/:id" element={<CustomerOverview />} />
              <Route path="resources/:id" element={<ResourceOverview />} />
              <Route path="customers/edit/:id" element={<EditCustomer />} />
              <Route path="projects/edit/:id" element={<EditProject />} />
              <Route path="organizations/edit/:id" element={<EditOrganization />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 font-main">Confirm Logout</h2>
            <p className="mb-6 font-second">Are you sure you want to log out?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 font-second rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-[#4A90E2] font-second text-white rounded-md hover:bg-[#3A7BBE] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;