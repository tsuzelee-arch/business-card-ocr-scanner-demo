import React from 'react';
import { X, ExternalLink, Trash2, Key } from 'lucide-react';
import TagManager from './TagManager';

function SettingsModal({ 
  sheetUrl, 
  setSheetUrl, 
  sheetLink, 
  setSheetLink, 
  ocrEngine, 
  setOcrEngine, 
  geminiKey, 
  setGeminiKey, 
  testGemini, 
  setShowSettings,
  globalTags,
  setGlobalTags,
  cards,
  setCards,
  gasUrl,
  setGasUrl
}) {


  return (
    <div className="modal-overlay">
      <div className="modal">
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', borderBottom:'1px solid var(--border)', paddingBottom:'10px'}}>
          <h2 style={{color:'var(--gold-vibrant)'}}>系統設定</h2>
          <X onClick={() => setShowSettings(false)} />
        </div>
        <div className="form-group">
          <label className="form-label">Google Sheets URL (CSV上傳用)</label>
          <input className="form-input" placeholder="https://script.google.com/..." value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Google Sheet 檢視網址 (點擊按鈕開啟用)</label>
          <input className="form-input" placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetLink} onChange={e => setSheetLink(e.target.value)} />
        </div>
        <div className="form-group">
          <button 
            className="btn" 
            onClick={() => {
              if(!sheetLink) return alert('請先輸入 Google Sheet 檢視網址');
              window.open(sheetLink, '_system');
            }}
            style={{width:'100%', background:'#f0f7ff', color:'#4285F4', border:'1px solid #4285F4', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
          >
            <ExternalLink size={16} /> 開啟 Google Sheet 表格
          </button>
        </div>
        <div className="form-group">
          <label className="form-label">辨識引擎</label>
          <div className="engine-toggle" style={{display:'flex', gap:'10px'}}>
            <div className={`engine-option ${ocrEngine === 'local' ? 'active' : ''}`} onClick={() => setOcrEngine('local')} style={{flex:1, textAlign:'center', padding:'10px', borderRadius:'8px', cursor:'pointer', border:'1px solid #ddd', background: ocrEngine === 'local' ? 'var(--gold)' : 'white', color: ocrEngine === 'local' ? 'white' : '#333'}}>本機</div>
            <div className={`engine-option ${ocrEngine === 'gemini' ? 'active' : ''}`} onClick={() => setOcrEngine('gemini')} style={{flex:1, textAlign:'center', padding:'10px', borderRadius:'8px', cursor:'pointer', border:'1px solid #ddd', background: ocrEngine === 'gemini' ? 'var(--gold)' : 'white', color: ocrEngine === 'gemini' ? 'white' : '#333'}}>Gemini</div>
          </div>
        </div>
        {ocrEngine === 'gemini' && (
          <div className="form-group">
            <label className="form-label">Gemini API KEY</label>
            <input className="form-input" type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)} />
            <button className="btn btn-secondary" style={{width:'100%', marginTop:'10px'}} onClick={testGemini}>🧪 測試連線</button>
          </div>
        )}

        <div style={{margin: '20px 0', borderTop: '1px dashed #ddd', paddingTop: '15px'}}>
          <div className="admin-section" style={{background: '#fcfcfc', padding: '15px', borderRadius: '12px', border: '1px solid #eee'}}>
            <h4 style={{marginBottom: '10px', color: 'var(--gold-vibrant)'}}>🛡️ 管理員工具</h4>
            
            <div className="form-group">
              <label className="form-label">GAS 後端網址 (Web App URL)</label>
              <input className="form-input" placeholder="https://script.google.com/..." value={gasUrl} onChange={e => setGasUrl(e.target.value)} />
            </div>
          </div>
        </div>

        <TagManager globalTags={globalTags} setGlobalTags={setGlobalTags} cards={cards} setCards={setCards} />

        <button className="btn btn-primary" style={{width:'100%', marginTop:'20px'}} onClick={() => setShowSettings(false)}>完成設定</button>
      </div>
    </div>
  );
}

export default SettingsModal;
