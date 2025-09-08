import React from "react";
import Button from "@/components/atoms/Button";

const FilterButtons = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "primary" : "ghost"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className="text-sm"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default FilterButtons;