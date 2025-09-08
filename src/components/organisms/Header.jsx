import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:ml-64">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden mr-3"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Welcome back!
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Let's make today productive
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <ApperIcon name="Bell" className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
            <ApperIcon name="User" className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;