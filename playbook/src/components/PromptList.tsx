import { useState, useMemo } from 'react';
import PromptCard from './PromptCard';
import promptsData from '../prompts.json';

interface Prompt {
  id: number;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
}

const ALL_CATEGORIES = ['All', ...new Set(promptsData.map(p => p.category))];
const ALL_TAGS = ['All', 'react', 'typescript', 'debugging', 'testing', 'performance', 'api', 'documentation', 'ai'];

export default function PromptList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showTagFilters, setShowTagFilters] = useState(false);

  const filteredPrompts = useMemo(() => {
    return promptsData.filter((prompt: Prompt) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === 'All' || prompt.category === selectedCategory;
      
      // Tag filter
      const matchesTag = selectedTag === 'All' || prompt.tags.includes(selectedTag);
      
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedTag('All');
  };

  return (
    <div className="prompt-list-container">
      {/* Header Section */}
      <header className="prompt-header">
        <div className="header-top">
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search prompts by title, description, or tags..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className="header-actions">
            <button 
              className={`filter-toggle ${showTagFilters ? 'active' : ''}`}
              onClick={() => setShowTagFilters(!showTagFilters)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              {showTagFilters ? 'Hide Tags' : 'Show Tags'}
            </button>
            
            {(searchQuery || selectedCategory !== 'All' || selectedTag !== 'All') && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <h3 className="filter-title">Categories</h3>
            <div className="chips-container">
              {ALL_CATEGORIES.map(category => (
                <button
                  key={category}
                  className={`chip ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {showTagFilters && (
            <div className="filter-group">
              <h3 className="filter-title">Tags</h3>
              <div className="chips-container">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag}
                    className={`chip ${selectedTag === tag ? 'active' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="results-info">
          <span className="results-count">
            {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'} found
          </span>
          <div className="active-filters">
            {selectedCategory !== 'All' && (
              <span className="active-filter">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')}>×</button>
              </span>
            )}
            {selectedTag !== 'All' && (
              <span className="active-filter">
                Tag: {selectedTag}
                <button onClick={() => setSelectedTag('All')}>×</button>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Prompts Listing Section */}
      <div className="prompts-grid">
        {filteredPrompts.length > 0 ? (
          filteredPrompts.map((prompt: Prompt) => (
            <PromptCard
              key={prompt.id}
              id={prompt.id}
              title={prompt.title}
              description={prompt.description}
              prompt={prompt.prompt}
              category={prompt.category}
              tags={prompt.tags}
            />
          ))
        ) : (
          <div className="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
              <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
            </svg>
            <h3>No prompts found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}