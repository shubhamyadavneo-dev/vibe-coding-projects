'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, Utensils } from 'lucide-react';

interface Filters {
  mealType?: string;
  difficulty?: string;
  maxTime?: number;
}

interface FilterSectionProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TIME_RANGES = [
  { label: '< 30 min', value: 30 },
  { label: '30 - 60 min', value: 60 },
  { label: '> 60 min', value: 120 },
];

export const FilterSection: React.FC<FilterSectionProps> = ({ filters, onFilterChange }) => {
  const toggleFilter = (key: keyof Filters, value: string | number) => {
    const newFilters = { ...filters };
    if (newFilters[key] === value) {
      delete newFilters[key];
    } else {
      (newFilters as Record<string, string | number | undefined>)[key] = value;
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="space-y-6 bg-white/30 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Refine Recipes</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Meal Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Utensils className="h-4 w-4" />
            <span className="text-xs font-medium">Meal Type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((type) => (
              <Badge
                key={type}
                variant={filters.mealType === type ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm rounded-xl transition-all ${
                  filters.mealType === type 
                  ? "bg-orange-500 hover:bg-orange-600 border-transparent text-white" 
                  : "bg-white hover:border-orange-200 text-gray-600"
                }`}
                onClick={() => toggleFilter('mealType', type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <ChefHat className="h-4 w-4" />
            <span className="text-xs font-medium">Difficulty</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((level) => (
              <Badge
                key={level}
                variant={filters.difficulty === level ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm rounded-xl transition-all ${
                  filters.difficulty === level 
                  ? "bg-orange-500 hover:bg-orange-600 border-transparent text-white" 
                  : "bg-white hover:border-orange-200 text-gray-600"
                }`}
                onClick={() => toggleFilter('difficulty', level)}
              >
                {level}
              </Badge>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Cooking Time</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map((range) => (
              <Badge
                key={range.label}
                variant={filters.maxTime === range.value ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm rounded-xl transition-all ${
                  filters.maxTime === range.value 
                  ? "bg-orange-500 hover:bg-orange-600 border-transparent text-white" 
                  : "bg-white hover:border-orange-200 text-gray-600"
                }`}
                onClick={() => toggleFilter('maxTime', range.value)}
              >
                {range.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
