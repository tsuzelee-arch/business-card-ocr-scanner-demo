/**
 * Utility for filtering cards based on search query and tags.
 * Supports keyword search across multiple fields and Traditional Chinese.
 */
export const filterCards = (cards, globalTags, query, activeTagFilters) => {
  let filtered = [...cards];

  // 1. Tag Filtering (AND logic: must have ALL selected tags)
  if (activeTagFilters.length > 0) {
    filtered = filtered.filter(card => 
      activeTagFilters.every(tagId => card.tags && card.tags.includes(tagId))
    );
  }

  // 2. Search Query Filtering
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(card => {
      // Fields to search in
      const searchFields = [
        card.name,
        card.company,
        card.title,
        card.phone,
        card.email,
        card.address,
        card.note
      ];

      // Also search in assigned tag names
      if (card.tags && card.tags.length > 0) {
        card.tags.forEach(tagId => {
          const tag = globalTags.find(t => t.id === tagId);
          if (tag) searchFields.push(tag.name);
        });
      }

      return searchFields.some(field => 
        field && String(field).toLowerCase().includes(q)
      );
    });
  }

  return filtered;
};
