import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon,
  gradient = false
}) => {
  const getChangeColor = () => {
    switch(changeType) {
      case "positive": return "text-success";
      case "negative": return "text-error";
      default: return "text-gray-600";
    }
  };

  return (
    <Card className="hover:transform hover:scale-102 transition-all duration-200">
      <Card.Content className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold font-display ${gradient ? 'bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
              {value}
            </p>
            {change && (
              <div className={`flex items-center text-sm ${getChangeColor()}`}>
                <ApperIcon 
                  name={changeType === "positive" ? "TrendingUp" : changeType === "negative" ? "TrendingDown" : "Minus"} 
                  className="w-4 h-4 mr-1" 
                />
                {change}
              </div>
            )}
          </div>
          {icon && (
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <ApperIcon name={icon} className="w-6 h-6 text-primary-600" />
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};

export default StatCard;