import React, { useState } from 'react';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';

function TagManager({ globalTags, setGlobalTags, cards, setCards }) {
  const [newTagName, setNewTagName] = useState('');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');

  const addTag = () => {
    if (!newTagName.trim()) return;
    const newTag = {
      id: 'tag_' + Date.now(),
      name: newTagName.trim(),
      color: `hsl(${Math.floor(Math.random() * 360)}, 60%, 45%)`
    };
    setGlobalTags([...globalTags, newTag]);
    setNewTagName('');
  };

  const deleteTag = (tagId) => {
    if (window.confirm('確定要刪除這個標籤嗎？這會從所有名片中移除此標籤。')) {
      setGlobalTags(globalTags.filter(t => t.id !== tagId));
      if (setCards) {
        setCards(cards.map(card => ({
          ...card,
          tags: card.tags.filter(id => id !== tagId)
        })));
      }
    }
  };

  const startEdit = (tag) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
  };

  const saveEdit = () => {
    if (editName.trim()) {
      setGlobalTags(globalTags.map(t => t.id === editingTag ? { ...t, name: editName.trim() } : t));
    }
    setEditingTag(null);
  };

  return (
    <div className="tag-manager">
      <div className="form-label" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px'}}>標籤管理 (Tags)</div>
      
      <div style={{display: 'flex', gap: '8px', marginBottom: '15px'}}>
        <input 
          type="text" 
          value={newTagName} 
          onChange={e => setNewTagName(e.target.value)} 
          placeholder="輸入新標籤名稱..." 
          className="form-input"
          style={{marginBottom: 0}}
        />
        <button onClick={addTag} className="btn btn-primary" style={{width: 'auto', padding: '0 15px'}}><Plus size={20} /></button>
      </div>

      <div className="tag-management-list" style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
        {globalTags.map(tag => (
          <div key={tag.id} className="tag-manage-chip" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '5px 10px', 
            borderRadius: '20px', 
            border: `1px solid ${tag.color}`,
            background: 'white'
          }}>
            {editingTag === tag.id ? (
              <input 
                type="text" 
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                className="tag-edit-input"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                style={{ border: 'none', outline: 'none', width: '80px', fontSize: '13px' }}
              />
            ) : (
              <span style={{ fontSize: '13px', fontWeight: '500', color: tag.color }}>{tag.name}</span>
            )}
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {editingTag === tag.id ? (
                <Check size={14} color="#2ecc71" onClick={saveEdit} style={{cursor:'pointer'}} />
              ) : (
                <Edit size={14} color="#999" onClick={() => startEdit(tag)} style={{cursor:'pointer'}} />
              )}
              <Trash2 size={14} color="#ff4444" onClick={() => deleteTag(tag.id)} style={{cursor:'pointer'}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TagManager;
