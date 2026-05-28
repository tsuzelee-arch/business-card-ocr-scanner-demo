import React from 'react';
import { X, Heart, StickyNote } from 'lucide-react';

function EditorModal({ 
  currentCard, 
  setCurrentCard, 
  setShowModal, 
  setZoomedImage, 
  saveCard,
  globalTags
}) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
          <h2 style={{color:'var(--gold-vibrant)'}}>編輯名片</h2>
          <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
            <Heart 
              size={24} 
              fill={currentCard.isFavorite ? "#ff4444" : "none"} 
              color={currentCard.isFavorite ? "#ff4444" : "#888"} 
              onClick={() => setCurrentCard({...currentCard, isFavorite: !currentCard.isFavorite})}
              style={{cursor: 'pointer'}}
            />
            <StickyNote 
              size={24} 
              color={currentCard.note ? "var(--gold-vibrant)" : "#888"} 
              style={{cursor: 'pointer'}}
            />
            <X onClick={() => setShowModal(false)} />
          </div>
        </div>
        {currentCard.image && <img src={currentCard.image} onClick={() => setZoomedImage(currentCard.image)} className="card-image-preview" alt="full preview" style={{width:'100%', borderRadius:'12px', marginBottom:'15px', border: '1px solid #ddd', cursor: 'zoom-in', objectFit: 'contain', maxHeight: '200px'}} />}
        <div className="form-group">
          <label className="form-label">姓名</label>
          <input className="form-input" value={currentCard.name} onChange={e => setCurrentCard({...currentCard, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">職稱</label>
          <input className="form-input" value={currentCard.title} onChange={e => setCurrentCard({...currentCard, title: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">公司</label>
          <input className="form-input" value={currentCard.company} onChange={e => setCurrentCard({...currentCard, company: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">備註 (Note)</label>
          <textarea className="form-input" rows={2} placeholder="點擊輸入備註..." value={currentCard.note || ''} onChange={e => setCurrentCard({...currentCard, note: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">電話</label>
          <input className="form-input" value={currentCard.phone} onChange={e => setCurrentCard({...currentCard, phone: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">電子郵件</label>
          <input className="form-input" value={currentCard.email} onChange={e => setCurrentCard({...currentCard, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label className="form-label">標籤 (Tags)</label>
          <div className="tag-selection" style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
            {globalTags.map(tag => (
              <div 
                key={tag.id} 
                onClick={() => {
                  const newTags = (currentCard.tags || []).includes(tag.id)
                    ? currentCard.tags.filter(id => id !== tag.id)
                    : [...(currentCard.tags || []), tag.id];
                  setCurrentCard({...currentCard, tags: newTags});
                }}
                className="tag-badge"
                style={{
                  borderColor: tag.color,
                  backgroundColor: (currentCard.tags || []).includes(tag.id) ? tag.color : 'white',
                  color: (currentCard.tags || []).includes(tag.id) ? 'white' : tag.color,
                  cursor: 'pointer',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                {tag.name}
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">地址</label>
          <textarea className="form-input" rows={2} value={currentCard.address} onChange={e => setCurrentCard({...currentCard, address: e.target.value})} />
        </div>
        <div className="btn-group">
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
          <button className="btn btn-primary" onClick={saveCard}>儲存資料</button>
        </div>
      </div>
    </div>
  );
}

export default EditorModal;
