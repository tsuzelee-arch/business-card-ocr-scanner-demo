import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  Maximize2, 
  Heart, 
  StickyNote, 
  Trash2 
} from 'lucide-react';

function CardItem({ card, onEdit, onToggleFav, onDelete, onZoom, globalTags }) {
  return (
    <div className="biz-card" onClick={() => onEdit(card)}>
      <div className="card-header" style={{display:'flex', justifyContent:'space-between'}}>
        <div style={{display:'flex', gap:'12px', flex:1}}>
          {card.image && (
            <div className="thumbnail-container" style={{position:'relative'}} onClick={(e) => { e.stopPropagation(); onZoom(card.image); }}>
              <img src={card.image} className="card-thumbnail" alt="thumbnail" style={{width:'55px', height:'55px', objectFit:'cover', borderRadius:'6px', border: '1px solid #eee'}} />
              <Maximize2 size={10} style={{position:'absolute', bottom: '2px', right: '2px', background: 'rgba(255,255,255,0.8)', borderRadius: '2px', padding: '1px'}} />
            </div>
          )}
          <div style={{overflow: 'hidden'}}>
            <div className="card-name" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px'}}>
              {card.name || '未命名'}
              {card.isFavorite && <Heart size={12} fill="#ff4444" color="#ff4444" />}
            </div>
            <div className="card-title" style={{fontSize:'12px', color:'#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{card.title}</div>
            <div className="card-tags">
              {(card.tags || []).map(tagId => {
                const tag = globalTags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <span key={tagId} className="tag-badge" style={{ color: tag.color, borderColor: tag.color }}>
                    {tag.name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{display:'flex', gap:'12px', alignSelf: 'flex-start'}} onClick={e => e.stopPropagation()}>
          <Heart 
            size={18} 
            fill={card.isFavorite ? "#ff4444" : "none"} 
            color={card.isFavorite ? "#ff4444" : "#ccc"} 
            onClick={() => onToggleFav(card.id)} 
          />
          <StickyNote 
            size={18} 
            color={card.note ? "#b8860b" : "#ccc"} 
            onClick={() => onEdit(card)}
          />
          <Trash2 size={18} color="#ff4444" onClick={() => onDelete(card.id)} />
        </div>
      </div>
      <div className="card-info" style={{marginTop:'10px', fontSize:'13px', color: '#555'}}>
        {card.company && <div className="info-item" style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Building2 size={12}/> <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{card.company}</span></div>}
        {card.phone && <div className="info-item" style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Phone size={12}/> {card.phone}</div>}
        {card.email && <div className="info-item" style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Mail size={12}/> <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{card.email}</span></div>}
        {card.note && <div className="info-item" style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#b8860b'}}><StickyNote size={12}/> <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{card.note}</span></div>}
      </div>
    </div>
  );
}

export default CardItem;
