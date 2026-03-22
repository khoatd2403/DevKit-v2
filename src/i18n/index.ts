export type Lang = 'en' | 'vi' | 'zh-CN' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'pt' | 'ru'

const en = {
  // Sidebar / nav
  home: 'Home',
  allTools: 'All Tools',
  favorites: 'Favorites',
  settings: 'Settings',
  whatsNew: "What's New",
  feedback: 'Feedback',
  toolsCount: (n: number) => `${n} tools available`,
  noFavorites: 'No favorites yet — click ★ on any tool',

  // Header
  searchPlaceholder: 'Search tools...',

  // Home — hero
  toolsAvailableBadge: (n: number) => `${n}+ tools available — all free`,
  heroTitle: 'Developer Productivity Suite',
  heroDesc: 'Fast, free, and private developer tools — everything runs in your browser.',

  // Home — section titles
  toolOfDay: 'Tool of the Day',
  recentlyUsed: 'Recently Used',
  popularTools: 'Popular Tools',
  newTools: 'New Tools',
  browseAll: (n: number) => `🧰 Browse all ${n} tools`,
  unexplored: 'Unexplored',
  unexploredRemaining: (n: number) => `(${n} tools remaining)`,
  toolsExplored: 'Tools explored',
  complete: (pct: number) => `${pct}% complete`,
  triedAll: "🎉 You've tried all tools!",
  viewAll: 'View all →',
  tryIt: 'Try it →',

  // Tool card badges
  popular: 'Popular',
  new: 'New',
  edit: 'Edit',
  done: 'Done',

  // Settings
  settingsTitle: 'Settings & Data',
  appearance: 'Appearance',
  theme: 'Theme',
  themeDesc: 'Light, dark, or follow system',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeSystem: 'System',
  accentColor: 'Accent Color',
  background: 'Background',
  language: 'Language',
  displayLanguage: 'Display Language',
  languageDesc: 'Interface language',
  editor: 'Editor',
  fontSize: 'Font Size',
  fontSizeDesc: 'Tool textarea font size',
  lineWrap: 'Line Wrap',
  lineWrapDesc: 'Wrap long lines in textareas',
  yourData: 'Your stored data',
  snippets: 'Snippets',
  recent: 'Recent',
  exportSettings: 'Export Settings',
  exportDesc: 'Download a JSON backup of all your favorites, snippets, preferences, and recently used tools.',
  importSettings: 'Import Settings',
  importDesc: 'Restore from a previously exported DevKit JSON file. Existing data will be overwritten.',
  chooseFile: 'Choose File to Import',
  clearAllData: 'Clear All Data',
  clearDesc: 'Permanently delete all DevKit data from this browser, including favorites, snippets, preferences, and history.',
  clearBtn: 'Clear all DevKit data',
  close: 'Close',
  cancel: 'Cancel',
  reloadNow: 'Reload Now',
  importAnother: 'Import Another',
  importSuccess: 'Settings imported! Reload to apply changes.',
  importFailed: 'Import failed',
  clearConfirm: 'Are you sure? This cannot be undone.',
  clearYes: 'Yes, clear everything',
  pressEscToClose: 'Press Esc to close',
}

export type Translations = typeof en

const vi: Translations = {
  home: 'Trang chủ',
  allTools: 'Tất cả công cụ',
  favorites: 'Yêu thích',
  settings: 'Cài đặt',
  whatsNew: 'Có gì mới',
  feedback: 'Phản hồi',
  toolsCount: (n: number) => `${n} công cụ`,
  noFavorites: 'Chưa có yêu thích — nhấn ★ trên công cụ bất kỳ',

  searchPlaceholder: 'Tìm công cụ...',

  toolsAvailableBadge: (n: number) => `${n}+ công cụ — miễn phí`,
  heroTitle: 'Bộ công cụ cho lập trình viên',
  heroDesc: 'Công cụ nhanh, miễn phí và riêng tư — tất cả chạy trong trình duyệt.',

  toolOfDay: 'Công cụ hôm nay',
  recentlyUsed: 'Đã dùng gần đây',
  popularTools: 'Công cụ phổ biến',
  newTools: 'Công cụ mới',
  browseAll: (n: number) => `🧰 Xem tất cả ${n} công cụ`,
  unexplored: 'Chưa Khám Phá',
  unexploredRemaining: (n: number) => `(còn ${n} công cụ)`,
  toolsExplored: 'Công cụ đã dùng',
  complete: (pct: number) => `${pct}% hoàn thành`,
  triedAll: '🎉 Bạn đã dùng hết tất cả công cụ!',
  viewAll: 'Xem thêm →',
  tryIt: 'Dùng thử →',

  popular: 'Phổ biến',
  new: 'Mới',
  edit: 'Chỉnh sửa',
  done: 'Xong',

  settingsTitle: 'Cài đặt & Dữ liệu',
  appearance: 'Giao diện',
  theme: 'Chủ đề',
  themeDesc: 'Sáng, tối hoặc theo hệ thống',
  themeLight: 'Sáng',
  themeDark: 'Tối',
  themeSystem: 'Theo hệ thống',
  accentColor: 'Màu chủ đạo',
  background: 'Màu nền',
  language: 'Ngôn ngữ',
  displayLanguage: 'Ngôn ngữ hiển thị',
  languageDesc: 'Ngôn ngữ giao diện',
  editor: 'Trình soạn thảo',
  fontSize: 'Cỡ chữ',
  fontSizeDesc: 'Cỡ chữ trong khung nhập liệu',
  lineWrap: 'Xuống dòng tự động',
  lineWrapDesc: 'Tự động xuống dòng khi quá dài',
  yourData: 'Dữ liệu của bạn',
  snippets: 'Đoạn code',
  recent: 'Gần đây',
  exportSettings: 'Xuất cài đặt',
  exportDesc: 'Tải xuống bản sao lưu JSON gồm danh sách yêu thích, đoạn code và lịch sử sử dụng.',
  importSettings: 'Nhập cài đặt',
  importDesc: 'Khôi phục từ file JSON đã xuất trước đó. Dữ liệu hiện tại sẽ bị ghi đè.',
  chooseFile: 'Chọn file để nhập',
  clearAllData: 'Xóa toàn bộ dữ liệu',
  clearDesc: 'Xóa vĩnh viễn tất cả dữ liệu DevKit trong trình duyệt này, bao gồm yêu thích, đoạn code, cài đặt và lịch sử.',
  clearBtn: 'Xóa tất cả dữ liệu DevKit',
  close: 'Đóng',
  cancel: 'Hủy',
  reloadNow: 'Tải lại ngay',
  importAnother: 'Nhập file khác',
  importSuccess: 'Đã nhập cài đặt! Tải lại để áp dụng thay đổi.',
  importFailed: 'Nhập thất bại',
  clearConfirm: 'Bạn có chắc không? Không thể hoàn tác.',
  clearYes: 'Xóa tất cả',
  pressEscToClose: 'Nhấn Esc để đóng',
}

// All other languages fall back to English
const TRANSLATIONS: Partial<Record<Lang, Translations>> = { en, vi }

export function getT(lang: Lang): Translations {
  return TRANSLATIONS[lang] ?? en
}
