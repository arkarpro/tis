// =========================================================================
// 🌐 The Insights Solution (TIS) - Main Frame Engine & Headless CMS Router
// =========================================================================

const VALID_PAGES = [
  'about',
  'projects',
  'excel_hacks',
  'articles',
  'mock_excel',
  'mock_pl300',
  'course_excel_biz',
  'course_data_analysis',
  'course_powerbi',
  'course_sql',
  'qna',
  'review'
];

// Page Controllers mapping to Google Sheets tabs
const PAGE_CONTROLLERS = {
  projects: () => renderDynamicTab('Projects', 'projects-container', 'projects', 'Live Demo ဖွင့်ကြည့်မည် ➔'),
  excel_hacks: () => renderDynamicTab('F_Hacks', 'hacks-container', 'hacks', 'Hack လေ့လာမည် ➔'),
  articles: () => renderDynamicTab('F_Article', 'articles-container', 'articles', 'ဆောင်းပါး ဖတ်ရှုမည် ➔'),
  course_excel_biz: () => renderDynamicTab('C_EFBM', 'course-excel-container', 'courses', 'သင်တန်း အပ်နှံရန် ➔'),
  course_data_analysis: () => renderDynamicTab('C_DAE', 'course-da-container', 'courses', 'သင်တန်း အပ်နှံရန် ➔'),
  course_powerbi: () => renderDynamicTab('C_PBI', 'course-pbi-container', 'courses', 'သင်တန်း အပ်နှံရန် ➔'),
  course_sql: () => renderDynamicTab('C_SQL', 'course-sql-container', 'courses', 'သင်တန်း အပ်နှံရန် ➔'),
  review: () => renderDynamicTab('Reviews', 'reviews-container', 'reviews', 'သင်တန်း ဆွေးနွေးရန် ➔'),
  qna: () => renderDynamicTab('Q&A', 'qna-container', 'qna', 'အမေးအဖြေ ဖတ်ရှုမည် ➔'),
  mock_excel: () => renderMockExcel(),
  mock_pl300: () => renderMockPL300()
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Route check
  const hash = window.location.hash.replace('#', '').trim();
  if (hash && hash !== 'about' && VALID_PAGES.includes(hash)) {
    loadPage(hash, false);
  }

  // 2. Load Announcement Banner from Google Sheet SITE_Config
  // loadAdBannerFromSheet(); // Removed per user request

  // 3. Listen to Hash change
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '').trim() || 'about';
    loadPage(newHash, false);
  });
});

// Generic Dynamic Tab Renderer for Google Sheets CMS
async function renderDynamicTab(tabName, containerId, folderName, defaultActionText = "အသေးစိတ် လေ့လာမည်") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-16">
      <div class="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Database မှ ဒေတာများ ရယူနေပါသည်...</p>
    </div>
  `;

  try {
    const data = await fetchTabData(tabName);
    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
          <p class="text-sm font-bold text-gray-500">လက်ရှိတွင် ဖော်ပြရန် အချက်အလက်များ မရှိသေးပါခင်ဗျာ။</p>
        </div>
      `;
      return;
    }

    // Filter active items and sort by Order
    const activeItems = data
      .filter(item => item.Is_Active === true || String(item.Is_Active).toUpperCase() === 'TRUE' || item.Status === 'Active' || item.Is_Active === undefined)
      .sort((a, b) => (parseInt(a.Order) || 99) - (parseInt(b.Order) || 99));

    if (activeItems.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
          <p class="text-sm font-bold text-gray-500">ဖွင့်လှစ်ထားသော အကြောင်းအရာများ မရှိသေးပါခင်ဗျာ။</p>
        </div>
      `;
      return;
    }

    // Render cards using universal engine
    container.innerHTML = activeItems.map(item => {
      if (!item.Action_Text) item.Action_Text = defaultActionText;
      return createUniversalCardHtml(item, folderName, 'courses', tabName);
    }).join('');

  } catch (err) {
    console.error(`Error rendering tab [${tabName}]:`, err);
    container.innerHTML = `
      <div class="col-span-full text-center py-8 text-red-500 text-xs font-bold">
        ဒေတာ ရယူရာတွင် အခက်အခဲရှိနေပါသဖြင့် ခေတ္တစောင့်ဆိုင်းပြီး ပြန်လည် ကြိုးစားပေးပါ။
      </div>
    `;
  }
}

// Interactive Mock Tests Launchers (Connected to In-App Exam Simulator)
function renderMockExcel() {
  const container = document.getElementById('mock-excel-container');
  if (!container) return;
  const tests = [
    { no: '1', level: 'Level 1: Elementary', title: 'Foundations & Essential Formulas', summary: 'Formula စတင်နည်း (=), Cell References (C5), SUM, Rows/Columns နှင့် Shortcut များ စစ်ဆေးခြင်း။' },
    { no: '2', level: 'Level 2: Intermediate', title: 'Conditional Logic & Lookup Formulas', summary: 'IF, Absolute Reference ($), COUNTIF, SUMIF နှင့် VLOOKUP အခြေခံ အသုံးပြုနည်းများ စစ်ဆေးခြင်း။' },
    { no: '3', level: 'Level 3: Upper Intermediate', title: 'Advanced Reporting & Modern Lookups', summary: 'Pivot Table အနှစ်ချုပ်ခြင်း၊ SUMIFS, INDEX & MATCH, XLOOKUP နှင့် IFERROR စနစ်များ စစ်ဆေးခြင်း။' },
    { no: '4', level: 'Level 4: Advanced', title: 'Modern Dynamic Array Formulas', summary: 'Spill စနစ်၊ UNIQUE, FILTER, SORT, SORTBY နှင့် SEQUENCE dynamic array ဖော်မြူလာများ စစ်ဆေးခြင်း။' },
    { no: '5', level: 'Level 5: Professional Master', title: 'Power Query Automation & M Language', summary: 'Power Query ETL လုပ်ငန်းစဉ်၊ M language အခြေခံ၊ Data Transformation နှင့် အလိုအလျောက် သန့်စင်ခြင်း။' }
  ];
  
  container.innerHTML = tests.map(t => `
    <div class="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between hover:shadow-lg transition group">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 tracking-wide">${t.level}</span>
          <span class="text-[11px] font-bold text-gray-400">⏱️ Self-Paced / Timer</span>
        </div>
        <h3 class="text-lg font-black text-slate-800 mb-2 group-hover:text-emerald-700 transition">${t.title}</h3>
        <p class="text-xs text-gray-500 leading-relaxed mb-6">${t.summary}</p>
      </div>
      <button onclick="startExcelQuiz('${t.no}')" class="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2">
        <span>Test စတင်ဖြေဆိုမည်</span>
        <span class="text-sm">▶</span>
      </button>
    </div>
  `).join('');
}

function renderMockPL300() {
  const container = document.getElementById('mock-pl300-container');
  if (!container) return;
  const tests = [
    { no: '1', badge: 'Part 1 (25-30%)', title: 'Prepare the Data', summary: 'Power Query Parameters, Data Cleaning, Custom Columns နှင့် Data Source Connections စစ်ဆေးခြင်း။' },
    { no: '2', badge: 'Part 2 (25-30%)', title: 'Model the Data & DAX', summary: 'Star Schema, Relationships (1:M, M:M), CALCULATE, FILTER, Time Intelligence DAX စစ်ဆေးခြင်း။' },
    { no: '3', badge: 'Part 3 (25-30%)', title: 'Visualize and Analyze the Data', summary: 'Visual Selection, Drill-through, Bookmarks, Custom Tooltips, Analytics Features စစ်ဆေးခြင်း။' },
    { no: '4', badge: 'Part 4 (15-20%)', title: 'Deploy and Maintain Assets', summary: 'Workspaces, Row-Level Security (RLS), Scheduled Refresh, Gateway Setup စစ်ဆေးခြင်း။' },
    { no: '5', badge: 'Part 5 (Final Exam)', title: 'PL-300 Full Mock Simulator', summary: 'Microsoft Certified Power BI Data Analyst Associate စာမေးပွဲ အစစ်အတိုင်း ဖြေဆိုလေ့ကျင့်ခြင်း။' }
  ];
  
  container.innerHTML = tests.map(t => `
    <div class="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between hover:shadow-lg transition group">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-black px-3 py-1 rounded-full bg-blue-50 text-blue-700 tracking-wide">${t.badge}</span>
          <span class="text-[11px] font-bold text-gray-400">⏱️ Certification Prep</span>
        </div>
        <h3 class="text-lg font-black text-slate-800 mb-2 group-hover:text-blue-700 transition">${t.title}</h3>
        <p class="text-xs text-gray-500 leading-relaxed mb-6">${t.summary}</p>
      </div>
      <button onclick="startMockTest('${t.no}')" class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2">
        <span>Exam စတင်ဖြေဆိုမည်</span>
        <span class="text-sm">▶</span>
      </button>
    </div>
  `).join('');
}

// SPA Page Loader
async function loadPage(pageName, updateHash = true) {
  const container = document.getElementById('main-content');
  if (!container) return;

  const targetPage = VALID_PAGES.includes(pageName) ? pageName : 'about';
  
  if (updateHash) {
    window.location.hash = targetPage;
  }

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-20 w-full animate-fadeIn">
      <div class="w-8 h-8 border-3 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading ${targetPage.replace(/_/g, ' ')}...</p>
    </div>
  `;

  try {
    const res = await fetch(`pages/${targetPage}.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status} loading pages/${targetPage}.html`);
    const pageHtml = await res.text();
    container.innerHTML = pageHtml;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateActiveNav(targetPage);

    // Trigger Dynamic Tab Controller
    if (PAGE_CONTROLLERS[targetPage]) {
      PAGE_CONTROLLERS[targetPage]();
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-600 p-8 rounded-2xl text-center font-bold text-sm">
        စာမျက်နှာ ဖွင့်မရသေးပါခင်ဗျာ။ ခေတ္တစောင့်ဆိုင်းပြီး ပြန်လည်ကြိုးစားပေးပါ။
      </div>
    `;
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

// Login Modal is managed by auth.js

// Universal Content Card: Read More >> Toggle
function toggleReadMore(cardId) {
  const contentEl = document.getElementById(`content-${cardId}`);
  const btnEl = document.getElementById(`readmore-btn-${cardId}`);
  if (!contentEl || !btnEl) return;

  const isClamped = contentEl.style.webkitLineClamp === '3' || contentEl.classList.contains('clamp-3');
  if (isClamped) {
    contentEl.style.webkitLineClamp = 'unset';
    contentEl.classList.remove('clamp-3');
    contentEl.classList.add('clamp-none');
    btnEl.innerHTML = 'Show less &lt;&lt;';
  } else {
    contentEl.style.webkitLineClamp = '3';
    contentEl.classList.remove('clamp-none');
    contentEl.classList.add('clamp-3');
    btnEl.innerHTML = 'Read more &gt;&gt;';
  }
}

// Universal Content Card: Like Counter
function handleLike(cardId) {
  const countEl = document.getElementById(`like-count-${cardId}`);
  const iconEl = document.getElementById(`like-icon-${cardId}`);
  if (!countEl) return;

  let current = parseInt(countEl.innerText) || 0;
  const isLiked = countEl.dataset.liked === 'true';

  if (!isLiked) {
    countEl.innerText = current + 1;
    countEl.dataset.liked = 'true';
    if (iconEl) iconEl.innerText = '❤️';
  } else {
    countEl.innerText = Math.max(0, current - 1);
    countEl.dataset.liked = 'false';
    if (iconEl) iconEl.innerText = '🤍';
  }
}

// Universal Content Card: Comment Box
function openCommentBox(cardId) {
  alert('မှတ်ချက်ပေးပို့ရန် Viber (+95 9 425 320 949) သို့ တိုက်ရိုက် ဆက်သွယ်ပေးပို့နိုင်ပါသည်ခင်ဗျာ။');
}

// Universal Content Card: Social Share
function handleShare(title, link) {
  const shareUrl = link && link.startsWith('http') ? link : window.location.href;
  if (navigator.share) {
    navigator.share({ title: title, url: shareUrl }).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link ကို Copy ကူးပြီးပါပြီခင်ဗျာ။ အခြားသူများထံ မျှဝေနိုင်ပါပြီ။');
    });
  }
}

// Dynamic Ad Banner from Google Sheet SITE_Config
async function loadAdBannerFromSheet() {
  return; // Disabled per user request
  const bannerEl = document.getElementById('dynamic-ad-banner');
  const textEl = document.getElementById('ad-banner-text');
  const linkEl = document.getElementById('ad-banner-link');
  if (!bannerEl || !textEl) return;

  try {
    const configData = await fetchTabData('SITE_Config');
    if (configData && configData.length > 0) {
      const ticker = configData.find(c => c.Setting_Key === 'announcement_ticker');
      if (ticker && ticker.Value_Text && (ticker.Is_Active === true || ticker.Is_Active === 'TRUE')) {
        textEl.innerText = ticker.Value_Text;
        if (ticker.Value_URL && linkEl) {
          linkEl.href = ticker.Value_URL;
          linkEl.style.display = 'inline';
        } else if (linkEl) {
          linkEl.style.display = 'none';
        }
        bannerEl.style.display = 'block';
        return;
      }
    }
    bannerEl.style.display = 'none';
  } catch (err) {
    bannerEl.style.display = 'none';
  }
}


// Dynamic Active Navigation Pill Controller (Auto Highlight & Smooth Scroll)
function updateActiveNav(pageName) {
  // Mobile Quick Nav Pills
  const pills = document.querySelectorAll('.nav-pill');
  pills.forEach(pill => {
    const page = pill.getAttribute('data-page');
    if (page === pageName) {
      pill.className = 'nav-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold border border-blue-400 shadow-md ring-1 ring-blue-300/40 text-xs transition active:scale-95';
      try {
        pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      } catch (e) {}
    } else {
      pill.className = 'nav-pill flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-300 text-xs font-bold transition hover:bg-slate-700 active:scale-95';
    }
  });

  // Mobile Drawer Links Active Highlight
  const drawerLinks = document.querySelectorAll('#mobile-menu a');
  drawerLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === '#' + pageName) {
      link.classList.add('text-blue-400', 'font-black', 'bg-slate-800/60', 'rounded-lg', 'px-2');
      link.classList.remove('text-gray-300');
    } else {
      link.classList.remove('text-blue-400', 'font-black', 'bg-slate-800/60', 'rounded-lg', 'px-2');
      link.classList.add('text-gray-300');
    }
  });
}
window.updateActiveNav = updateActiveNav;

// Floating Quick Navigator Toggle
function toggleQuickNav() {
  const modal = document.getElementById('quickNavModal');
  if (!modal) return;
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}
