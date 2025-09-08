import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigationItems = [
    { name: "Dashboard", href: "/", icon: "Home" },
    { name: "Courses", href: "/courses", icon: "BookOpen" },
    { name: "Assignments", href: "/assignments", icon: "FileText" },
    { name: "Calendar", href: "/calendar", icon: "Calendar" },
    { name: "Grades", href: "/grades", icon: "Award" }
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href || 
                     (item.href !== "/" && location.pathname.startsWith(item.href));
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50"
        }`}
      >
        <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
        {item.name}
      </NavLink>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-display font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                StudyFlow
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col flex-1 px-4 pb-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
          <div className="relative flex flex-col w-64 h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-6 py-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-display font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  StudyFlow
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col flex-1 px-4 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;