import React, { useState, useEffect } from 'react';
import { 
  Camera as CameraIcon, 
  CloudUpload, 
  Plus, 
  PlusCircle,
  FileSpreadsheet,
  X,
  LayoutGrid
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import Tesseract from 'tesseract.js';

import { fetchWithRetry } from './utils/api';
import { filterCards } from './utils/search';
import CardItem from './components/CardItem';
import SettingsModal from './components/SettingsModal';
import EditorModal from './components/EditorModal';
import SearchBar from './components/SearchBar';

function App() {
  const MARKERS = {
    address: /(縣|市|區|鄉|鎮|路|街|道|巷|弄|號|樓|F|Floor|Flat|Rm)/i,
    company: /(股份有限公司|有限公司|集團|診所|事務所|中心|協會|醫院|企業|科技|工作室|銀行|Co\.|Ltd|Corp|Inc|Office)/i,
    title: /(經理|總監|執行長|主任|顧問|負責人|工程師|代表|設計師|專員|CEO|CTO|Manager|Director|VP)/i,
    phone: /(TEL|電話|手機|Mobile|T|M|F|Fax|09[0-9]{2})/i,
    email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    surname: /^([陳林黃張李王吳劉蔡楊許鄭謝洪郭邱曾廖賴徐周葉蘇莊呂江何羅高蕭潘朱簡鍾彭游詹胡施沈余盧梁趙顏柯孫魏翁戴范方宋鄧杜傅侯曹薛丁卓阮馬董唐溫藍蔣石古紀姚連馮歐程黃湯康田汪白鄒尤巫鐘黎涂佘嚴韓顧金邵孟龍駱莫葛錢])/
  };

  const isNative = React.useMemo(() => Capacitor.isNativePlatform(), []);
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('biz_cards');
    if (!saved) return [];
    
    try {
      let parsedCards = JSON.parse(saved);
      if (!Array.isArray(parsedCards)) return [];

      let migrated = false;
      let currentMaxId = 0;
      
      parsedCards.forEach(c => {
        if (c && typeof c.id === 'number' && c.id < 1000000) {
            currentMaxId = Math.max(currentMaxId, c.id);
        }
      });

      const cleanCards = parsedCards.map((c) => {
        if (!c) return null;
        let updated = { ...c };
        if (typeof c.id === 'string' || (typeof c.id === 'number' && c.id > 1000000)) {
          migrated = true;
          currentMaxId++;
          updated.id = currentMaxId;
        }
        if (!updated.tags) {
          migrated = true;
          updated.tags = updated.isFavorite ? ['tag_1'] : []; 
        }
        return updated;
      }).filter(Boolean);

      if (migrated) localStorage.setItem('biz_cards', JSON.stringify(cleanCards));
      return cleanCards;
    } catch (e) {
      console.error("Migration error:", e);
      return [];
    }
  });
  
  const [globalTags, setGlobalTags] = useState(() => {
    try {
      const saved = localStorage.getItem('biz_tags');
      if (!saved) return [
        { id: 'tag_1', name: '重要', color: '#ff4444' },
        { id: 'tag_2', name: '客戶', color: '#2ecc71' },
        { id: 'tag_3', name: '合作夥伴', color: '#3498db' }
      ];
      return JSON.parse(saved);
    } catch (e) {
      return [
        { id: 'tag_1', name: '重要', color: '#ff4444' },
        { id: 'tag_2', name: '客戶', color: '#2ecc71' },
        { id: 'tag_3', name: '合作夥伴', color: '#3498db' }
      ];
    }
  });

  const [sortBy, setSortBy] = useState(() => localStorage.getItem('sort_by') || 'date_desc');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('google_sheet_url') || '');
  const [ocrEngine, setOcrEngine] = useState(() => localStorage.getItem('ocr_engine') || 'local');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_key') || '');
  const [sheetLink, setSheetLink] = useState(() => localStorage.getItem('google_sheet_link') || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilters, setActiveTagFilters] = useState([]);

  const [currentCard, setCurrentCard] = useState({
    id: null,
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    raw: '',
    image: '',
    isFavorite: false,
    note: '',
    tags: [],
    timestamp: ''
  });

  const [gasUrl, setGasUrl] = useState(() => localStorage.getItem('gas_url') || '');

  useEffect(() => {
    localStorage.setItem('biz_cards', JSON.stringify(cards));
    if (cards.length > 0) {
      if (Capacitor.isNativePlatform()) autoUpdateLocalCsv(cards);
      if (sheetUrl) uploadCsvToGoogleSheet(cards, true);
    }
  }, [cards, sheetUrl]);

  useEffect(() => { localStorage.setItem('google_sheet_url', sheetUrl); }, [sheetUrl]);
  useEffect(() => { localStorage.setItem('google_sheet_link', sheetLink); }, [sheetLink]);
  useEffect(() => { localStorage.setItem('ocr_engine', ocrEngine); }, [ocrEngine]);
  useEffect(() => { localStorage.setItem('gemini_key', geminiKey); }, [geminiKey]);
  useEffect(() => { localStorage.setItem('sort_by', sortBy); }, [sortBy]);
  useEffect(() => { localStorage.setItem('biz_tags', JSON.stringify(globalTags)); }, [globalTags]);
  useEffect(() => { localStorage.setItem('gas_url', gasUrl); }, [gasUrl]);

  async function recordImpact() {
    if (isNative) await Haptics.impact({ style: ImpactStyle.Medium });
  }

  function parseText(text, jsonResult = null) {
    if (jsonResult) {
      return {
        name: jsonResult.姓名 || '',
        company: jsonResult.公司 || '',
        title: jsonResult.職稱 || '',
        email: jsonResult.電郵 || '',
        phone: jsonResult.電話 || '',
        address: jsonResult.地址 || '',
        raw: text,
        note: jsonResult.備註 || ''
      };
    }
    const rawLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);
    
    const fields = [
      { id: 'name', scoreKey: 'name', value: '' },
      { id: 'company', scoreKey: 'company', value: '' },
      { id: 'title', scoreKey: 'title', value: '' },
      { id: 'email', scoreKey: 'email', value: '' },
      { id: 'phone', scoreKey: 'phone', value: '' },
      { id: 'address', scoreKey: 'address', value: '' }
    ];

    const markers = MARKERS;

    const lineScores = rawLines.map(line => {
      const scores = { name: 0, company: 0, title: 0, email: 0, phone: 0, address: 0 };
      if (markers.email.test(line)) scores.email += 100;
      if (markers.phone.test(line)) scores.phone += 50;
      if (line.replace(/[^0-9]/g, '').length >= 8) scores.phone += 20;
      const addrMatches = line.match(new RegExp(markers.address, 'g'));
      if (addrMatches) scores.address += (addrMatches.length * 20);
      if (line.length > 10) scores.address += 10;
      if (markers.company.test(line)) scores.company += 80;
      if (markers.title.test(line)) scores.title += 70;
      if (markers.surname.test(line) && line.length >= 2 && line.length <= 4) scores.name += 60;
      if (line.length >= 2 && line.length <= 6 && !/[0-9]/.test(line)) scores.name += 15;
      if (/[0-9]/.test(line)) scores.name -= 50;
      if (line.includes('@')) { scores.name -= 100; scores.company -= 100; scores.address -= 100; }
      return { line, scores };
    });

    const result = { raw: text };
    fields.forEach(field => {
      const sorted = [...lineScores].sort((a, b) => b.scores[field.scoreKey] - a.scores[field.scoreKey]);
      if (sorted[0] && sorted[0].scores[field.scoreKey] > 10) {
        let val = sorted[0].line;
        if (field.id === 'phone') val = val.replace(/[^\d\+\-\(\)\s]/g, '').trim();
        result[field.id] = val;
      } else {
        result[field.id] = '';
      }
    });
    result.note = '';
    return result;
  }

  async function preprocessImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_DIM = 2000;
        let w = img.width, h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) { h = Math.round(h * (MAX_DIM / w)); w = MAX_DIM; }
          else { w = Math.round(w * (MAX_DIM / h)); h = MAX_DIM; }
        }
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
          d[i] = d[i+1] = d[i+2] = gray;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.98));
      };
      img.src = dataUrl;
    });
  }

  async function handleScan(sourceType = 'camera', files = null) {
    try {
      const imagesToProcess = [];
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const url = URL.createObjectURL(files[i]);
          imagesToProcess.push({ url, isBlob: true });
        }
      } else {
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: sourceType === 'camera' ? CameraSource.Camera : CameraSource.Photos
        });
        if (photo) {
          imagesToProcess.push({ url: photo.dataUrl, isBlob: false });
          await recordImpact();
        }
      }

      if (imagesToProcess.length === 0) return;
      setLoading(true);

      let nextBaseId = cards.length > 0 ? Math.max(...cards.map(c => Number(c.id) || 0)) + 1 : 1;
      let newlyAddedCards = [];
      
      for (let i = 0; i < imagesToProcess.length; i++) {
        const item = imagesToProcess[i];
        const processedUrl = await preprocessImage(item.url);
        if (item.isBlob) URL.revokeObjectURL(item.url);
        
        let text = '';
        let jsonResult = null;

        if (ocrEngine === 'local') {
          const { data } = await Tesseract.recognize(
            processedUrl, 'chi_tra+eng',
            { logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); }}
          );
          text = data.text;
        } else {
          if (!geminiKey) throw new Error('請先在設定中輸入 Gemini API KEY');
          const base64Data = processedUrl.split(',')[1];
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`;
          
          const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "這是一張名片。請將其中的資訊分類為：姓名, 公司, 職稱, 電郵, 電話, 地址。請僅以 JSON 格式回應且不帶 markdown，屬性名請使用繁體中文。" },
                  { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                ]
              }]
            })
          });

          const data = await response.json();
          if (data.error) throw new Error(data.error.message);
          const rawResponse = data.candidates[0].content.parts[0].text;
          try {
            jsonResult = JSON.parse(rawResponse.replace(/```json|```/g, '').trim());
            text = "Gemini Result";
          } catch (e) { text = "JSON Parsing Error: " + rawResponse; }
        }

        const parsed = parseText(text, jsonResult);
        const card = { 
          ...parsed, 
          id: nextBaseId + i, 
          image: processedUrl, 
          isFavorite: false, 
          note: parsed.note || '', 
          timestamp: new Date().toLocaleString('zh-TW'),
          tags: []
        };
        
        if (imagesToProcess.length === 1 && !files) {
          setCurrentCard(card);
          setShowModal(true);
        } else {
          newlyAddedCards.push(card);
        }
      }

      if (newlyAddedCards.length > 0) setCards(prev => [...newlyAddedCards, ...prev]);
    } catch (err) {
      if (err.message !== 'User cancelled photos app') alert('辨識遇到問題: ' + err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  function handleEditCard(card) {
    setCurrentCard({ ...card });
    setShowModal(true);
  }

  function toggleFavorite(id) {
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
    recordImpact();
  }

  function generateCsvString(cardsArray) {
    const BOM = '\uFEFF';
    const headers = ['ID', '姓名', '職稱', '公司', '電話', '電子郵件', '地址', '備註', '掃描時間', '標籤'];
    const sorted = [...cardsArray].sort((a,b) => a.id - b.id);
    const rows = sorted.map(c => {
      const tagNames = (c.tags || []).map(tagId => {
        const tag = globalTags.find(t => t.id === tagId);
        return tag ? tag.name : '';
      }).filter(Boolean).join('; ');

      return [
        c.id || '', 
        c.name || '', 
        c.title || '', 
        c.company || '', 
        c.phone || '', 
        c.email || '', 
        c.address || '', 
        c.note || '', 
        c.timestamp || new Date().toLocaleString('zh-TW'),
        tagNames
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
    });
    return BOM + headers.join(',') + '\n' + rows.join('\n');
  }

  async function autoUpdateLocalCsv(cardsArray) {
    if (!Capacitor.isNativePlatform() || cardsArray.length === 0) return;
    try {
      const csvContent = generateCsvString(cardsArray);
      await Filesystem.writeFile({
        path: 'BusinessCards_AutoBackup.csv',
        data: csvContent,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
    } catch (e) { console.error('Auto CSV export failed:', e); }
  }

  async function saveCard() {
    const cardToSave = { ...currentCard };
    setCards(prev => {
      const exists = prev.find(c => c.id === cardToSave.id);
      return exists ? prev.map(c => c.id === cardToSave.id ? cardToSave : c) : [cardToSave, ...prev];
    });
    setShowModal(false);
    recordImpact();
  }

  async function exportToExcel() {
    if (cards.length === 0) return alert('沒有資料可以匯出');
    try {
      setLoading(true);
      const csvContent = generateCsvString(cards);
      const timeStr = new Date().getTime();
      const fileName = `BizCards_${timeStr}.csv`;

      if (Capacitor.isNativePlatform()) {
        await Filesystem.writeFile({
          path: fileName, data: csvContent, directory: Directory.Documents, encoding: Encoding.UTF8
        });
        alert(`✅ 成功匯出 EXCEL (CSV)！\n檔案已儲存至手機「文件/Documents」資料夾：\n${fileName}`);
      } else {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`✅ 成功下載 EXCEL！`);
      }
    } catch (e) { alert('匯出 Excel 失敗: ' + e.message); }
    finally { setLoading(false); }
  }

  async function uploadCsvToGoogleSheet(arg = null, silent = false) {
    const cardsArrayToUpload = Array.isArray(arg) ? arg : cards;
    const isSilent = typeof arg === 'boolean' ? arg : silent;

    if (!sheetUrl) { if (!isSilent) alert('請先在設定中輸入 Google Sheets URL'); return; }
    if (cardsArrayToUpload.length === 0) { if (!isSilent) alert('沒有名片可以上傳'); return; }
    
    if (!isSilent) {
      const confirm = window.confirm(`這將會使用 CSV 格式完全覆蓋 Google Sheet!\n確定要同步嗎？`);
      if (!confirm) return;
      setLoading(true);
    }
    try {
      const csvContent = generateCsvString(cardsArrayToUpload);
      const response = await fetchWithRetry(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: csvContent
      });
      const responseText = await response.text();
      const result = JSON.parse(responseText);
      if (result?.status === 'error') throw new Error(result.message);
      if (!isSilent) alert(`✅ 同步完成！已成功將 CSV 內容完美覆寫至 Google Sheet！`);
    } catch (e) { if (!isSilent) alert('上傳失敗: ' + e.message); }
    finally { if (!isSilent) setLoading(false); }
  }

  function deleteCard(id) {
    if (window.confirm('確定要刪除這張名片嗎？')) setCards(prev => prev.filter(c => c.id !== id));
  }

  async function testGemini() {
    if (!geminiKey) return alert('請先輸入 API KEY');
    try {
      setLoading(true);
      const resp = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello, reply with 'READY'" }] }] })
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error.message);
      alert('✅ API 連線成功！回應：' + data.candidates[0].content.parts[0].text);
    } catch (err) { alert('❌ 連線失敗：' + err.message); }
    finally { setLoading(false); }
  }

  async function syncToMasterHub() {
    if (!gasUrl) return alert('請先在管理後台中設置 GAS 後端網址');
    if (cards.length === 0) return alert('沒有資料可以匯整');
    
    if (!window.confirm('確定要將所有名片資料匯整至總表嗎？')) return;
    
    setLoading(true);
    try {
      const resp = await fetchWithRetry(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({
          action: 'sync',
          cards: cards
        })
      });
      const result = await resp.json();
      if (result.status === 'success') {
        alert('✅ 資料匯整成功！已同步至總表。');
      } else {
        throw new Error(result.message);
      }
    } catch (e) {
      alert('匯整失敗: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filterCards(cards, globalTags, searchQuery, activeTagFilters);
  
  const sortedCards = filtered.sort((a, b) => {
    if (sortBy === 'fav_first') {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.id - a.id;
    }
    if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '', 'zh-Hant');
    return b.id - a.id;
  });

  const favorites = sortedCards.filter(c => c.isFavorite);
  const others = sortedCards.filter(c => !c.isFavorite);

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <div className="logo-icon">名</div>
          名片整理 <span style={{fontSize:'8px', opacity:0.5}}>v6.0 企业版</span>
        </div>
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <button className="btn-hub" onClick={syncToMasterHub}>
            <LayoutGrid size={16} /> 匯整總表
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)} style={{padding: '5px 10px', fontSize: '12px'}}>系統設定</button>
        </div>
      </header>

      <main>
        <div className="search-sort-row">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            globalTags={globalTags} 
            activeTagFilters={activeTagFilters} 
            setActiveTagFilters={setActiveTagFilters} 
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
            <option value="date_desc">最新優先</option>
            <option value="fav_first">收藏優先</option>
            <option value="name_asc">姓名 A-Z</option>
          </select>
        </div>

        {favorites.length > 0 && (
          <>
            <div className="section-title">收藏的名片 ({favorites.length})</div>
            <div className="card-list" style={{marginBottom: '20px'}}>
              {favorites.map(card => (
                <CardItem key={card.id} card={card} onEdit={handleEditCard} onToggleFav={toggleFavorite} onDelete={deleteCard} onZoom={setZoomedImage} globalTags={globalTags} />
              ))}
            </div>
          </>
        )}

        <div className="section-title">{favorites.length > 0 ? "其他名片" : "我的名片夾"} ({others.length})</div>
        {others.length === 0 && favorites.length === 0 ? (
          <div className="empty-state">
            <PlusCircle className="empty-icon" />
            <p>{searchQuery || activeTagFilters.length > 0 ? "沒有符合條件的名片" : "名片夾是空的"}</p>
          </div>
        ) : (
          <div className="card-list">
            {others.map(card => (
              <CardItem key={card.id} card={card} onEdit={handleEditCard} onToggleFav={toggleFavorite} onDelete={deleteCard} onZoom={setZoomedImage} globalTags={globalTags} />
            ))}
          </div>
        )}
      </main>

      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          <input type="file" id="bulk-upload" multiple accept="image/*" style={{display:'none'}} onChange={(e) => handleScan('file', e.target.files)} />
          <button className="scan-btn secondary" onClick={() => document.getElementById('bulk-upload').click()}><Plus size={24} color="#333" /></button>
          <button className="scan-btn" onClick={() => handleScan('camera')}><CameraIcon size={35} color="white" /></button>
          <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
            <div onClick={exportToExcel} className="nav-item"><FileSpreadsheet size={22} color="#b8860b" /><span>匯出 EXCEL</span></div>
            <div onClick={() => uploadCsvToGoogleSheet()} className="nav-item"><CloudUpload size={22} color={sheetUrl ? '#b8860b' : '#ccc'} /><span>雲端備份</span></div>
            <div onClick={() => setShowSettings(true)} className="nav-item"><div className="settings-icon"></div><span>設定</span></div>
          </div>
        </div>
      </div>

      {showModal && <EditorModal currentCard={currentCard} setCurrentCard={setCurrentCard} setShowModal={setShowModal} setZoomedImage={setZoomedImage} saveCard={saveCard} globalTags={globalTags} />}
      {showSettings && <SettingsModal 
        sheetUrl={sheetUrl} setSheetUrl={setSheetUrl} 
        sheetLink={sheetLink} setSheetLink={setSheetLink} 
        ocrEngine={ocrEngine} setOcrEngine={setOcrEngine} 
        geminiKey={geminiKey} setGeminiKey={setGeminiKey} 
        testGemini={testGemini} 
        setShowSettings={setShowSettings} 
        globalTags={globalTags} setGlobalTags={setGlobalTags} 
        cards={cards} setCards={setCards} 
        gasUrl={gasUrl} setGasUrl={setGasUrl}
      />}
      {zoomedImage && <div className="zoom-overlay" onClick={() => setZoomedImage(null)}><img src={zoomedImage} alt="zoomed"/><div className="close-zoom"><X size={30} /></div></div>}
      {loading && <div className="loading-overlay"><div className="spinner"></div><div className="progress-text">{progress > 0 ? `正在讀取... ${progress}%` : '請稍候...'}</div></div>}
    </div>
  );
}

export default App;
