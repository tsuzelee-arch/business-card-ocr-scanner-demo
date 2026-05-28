import React from 'react';
import { Search, X } from 'lucide-react';

function SearchBar({ searchQuery, setSearchQuery, globalTags, activeTagFilters, setActiveTagFilters }) {
  const toggleTagFilter = (tagId) => {
    setActiveTagFilters(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="搜尋姓名、公司、職稱、備註..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="search-input"
        />
        {searchQuery && (
          <X size={18} className="clear-search" onClick={() => setSearchQuery('')} />
        )}
      </div>
      
      <div className="tag-filters">
        {globalTags.map(tag => (
          <button 
            key={tag.id} 
            onClick={() => toggleTagFilter(tag.id)}
            className={`tag-filter-btn ${activeTagFilters.includes(tag.id) ? 'active' : ''}`}
            style={{ 
              borderColor: tag.color,
              backgroundColor: activeTagFilters.includes(tag.id) ? tag.color : 'rgba(0,0,0,0.03)',
              color: activeTagFilters.includes(tag.id) ? 'white' : '#555'
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
