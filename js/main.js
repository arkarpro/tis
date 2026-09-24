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
  projects: () => renderDynamicTab('HOME_Projects', 'projects-container', 'projects', 'Live Demo ဖွင့်ကြည့်မည် ➔'),
  excel_hacks: () => renderDynamicTab('FREE_Excel_Hacks', 'hacks-container', 'hacks', 'Hack လေ့လာမည် ➔'),
  articles: () => renderDynamicTab('FREE_Articles', 'articles-container', 'articles', 'ဆောင်းပါး ဖတ်ရှုမည် ➔'),
  course_excel_biz: () => renderDynamicTab('COURSE_Excel', 'course-excel-container', 'courses', 'သင်တန်း အပ်နှံရန် ➔'),
  course_data_analysis: () => renderDynamicTab('COURSE_PowerQuery', 'course-da-container', 'courses', 'သင်တန်း အပ်နှံရန် ➔'),
  course_powerbi: () => renderDynamicTab('COURSE_PowerBI', 'course-pbi-container', 'courses', 'သင်တန်း အပ်နှံရန် ➔'),
  course_sql: () => renderDynamicTab('COURSE_SQL', 'course-sql-container', 'courses', 'သင်တန်း အပ်နှံရန် ➔'),
  review: () => renderDynamicTab('TEST_Reviews', 'reviews-container', 'reviews', 'သင်တန်း ဆွေးနွေးရန် ➔'),
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
  loadAdBannerFromSheet();

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
      return createUniversalCardHtml(item, folderName);
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

// Mock Tests Launchers
function renderMockExcel() {
  const container = document.getElementById('mock-excel-container');
  if (!container) return;
  const tests = [
    { title: 'Excel Level 1: Foundations & Essential Formulas', Category: 'Level 1', Summary: 'SUM, AVERAGE, COUNTIF, IF အခြေခံ တွက်ချက်မှုများနှင့် Data Formatting စစ်ဆေးခြင်း။', Action_Text: 'Test စတင်ဖြေဆိုမည် ➔', Action_Link: 'https://docs.google.com/forms/d/e/1FAIpQLSd_mock_level1/viewform', Photo_Name: 'quiz-01.jpg' },
    { title: 'Excel Level 2: Advanced Lookup & Dynamic Formulas', Category: 'Level 2', Summary: 'XLOOKUP, INDEX-MATCH, FILTER, UNIQUE dynamic array စနစ်များ စစ်ဆေးခြင်း။', Action_Text: 'Test စတင်ဖြေဆိုမည် ➔', Action_Link: 'https://docs.google.com/forms/d/e/1FAIpQLSd_mock_level2/viewform', Photo_Name: 'quiz-02.jpg' },
    { title: 'Excel Level 3: Power Query Automation Mastery', Category: 'Level 3', Summary: 'Folder Combining, Merged-cell Unpivoting, Custom M-Functions စစ်ဆေးခြင်း။', Action_Text: 'Test စတင်ဖြေဆိုမည် ➔', Action_Link: 'https://docs.google.com/forms/d/e/1FAIpQLSd_mock_level3/viewform', Photo_Name: 'quiz-03.jpg' }
  ];
  container.innerHTML = tests.map(t => createUniversalCardHtml(t, 'quizzes')).join('');
}

function renderMockPL300() {
  const container = document.getElementById('mock-pl300-container');
  if (!container) return;
  const tests = [
    { title: 'PL-300 Mock Test 1: Prepare the Data (25-30%)', Category: 'PL-300 Prep', Summary: 'Power Query Parameters, Data Cleaning, Custom Columns နှင့် Data Source Connections။', Action_Text: 'Exam စတင်ဖြေဆိုမည် ➔', Action_Link: 'https://docs.google.com/forms/d/e/1FAIpQLSd_pl300_part1/viewform', Photo_Name: 'quiz-03.jpg' },
    { title: 'PL-300 Mock Test 2: Model the Data & DAX (25-30%)', Category: 'PL-300 DAX', Summary: 'Star Schema, Relationships (1:M, M:M), CALCULATE, FILTER, Time Intelligence DAX။', Action_Text: 'Exam စတင်ဖြေဆိုမည် ➔', Action_Link: 'https://docs.google.com/forms/d/e/1FAIpQLSd_pl300_part2/viewform', Photo_Name: 'PBI_8.png' }
  ];
  container.innerHTML = tests.map(t => createUniversalCardHtml(t, 'quizzes')).join('');
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

// Login Modal
function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('hidden');
}
function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
}

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
