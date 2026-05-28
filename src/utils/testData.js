/**
 * Test data for manual E2E testing of the tagging and search system.
 */
export const testCards = [
  {
    id: 1001,
    name: "陳大文",
    title: "高級工程師",
    company: "科技創新有限公司",
    phone: "0912-345-678",
    email: "david.chen@techinnov.com",
    address: "台北市信義區忠孝東路五段1號",
    note: "重要客戶，負責AI項目",
    isFavorite: true,
    tags: ["tag_1", "tag_2"], // 重要, 客戶
    image: ""
  },
  {
    id: 1002,
    name: "林小翠",
    title: "市場總監",
    company: "美商動能夥伴",
    phone: "0922-111-222",
    email: "tracy.lin@momentum.com",
    address: "台中市西屯區台灣大道三段",
    note: "潛在合作對象",
    isFavorite: false,
    tags: ["tag_3"], // 合作夥伴
    image: ""
  },
  {
    id: 1003,
    name: "張志明",
    title: "採購經理",
    company: "全球貿易集團",
    phone: "0933-999-888",
    email: "jimmy@globaltrade.org",
    address: "高雄市苓雅區四維三路",
    note: "老同學，現在在做供應鏈",
    isFavorite: false,
    tags: ["tag_2"], // 客戶
    image: ""
  }
];

export const testTags = [
  { id: 'tag_1', name: '重要', color: '#ff4444' },
  { id: 'tag_2', name: '客戶', color: '#2ecc71' },
  { id: 'tag_3', name: '合作夥伴', color: '#3498db' }
];
