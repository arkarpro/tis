// =========================================================================
// 🌐 The Insights Solution (TIS) - Main Frame Engine & SPA Router
// =========================================================================

const COMPONENTS = [
  { id: 'nav-placeholder', file: 'components/nav.html' },
  { id: 'ad-banner-placeholder', file: 'components/ad_banner.html' },
  { id: 'footer-placeholder', file: 'components/footer.html' },
  { id: 'floating-icons-placeholder', file: 'components/footer.html' },
  { id: 'login-placeholder', file: 'components/login.html' }
];

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

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load All Shared Layout Components in Parallel
  await Promise.all(COMPONENTS.map(c => loadComponent(c.id, c.file)));

  // 2. Load Top Ad Banner from Google Sheet
  loadAdBannerFromSheet();

  // 3. Handle Initial Page Route from URL Hash (e.g. #projects, #course_data_analysis)
  handleHashRoute();

  // 4. Listen to Hash changes for Back/Forward Navigation
  window.addEventListener('hashchange', handleHashRoute);
});

// Component Loader
async function loadComponent(elementId, filePath) {
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`HTTP ${res.status} loading ${filePath}`);
    const html = await res.text();
    const el = document.getElementById(elementId);
    if (el) el.innerHTML = html;
  } catch (err) {
    console.warn(`Failed to load component: ${filePath}`, err);
  }
}

// SPA Page Loader
async function loadPage(pageName, updateHash = true) {
  const container = document.getElementById('main-content');
  if (!container) return;

  const targetPage = VALID_PAGES.includes(pageName) ? pageName : 'about';
  
  if (updateHash) {
    window.location.hash = targetPage;
  }

  // Show Smooth Loading State
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-20 w-full animate-fadeIn">
      <div class="w-8 h-8 border-3 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading ${targetPage.replace(/_/g, ' ')}...</p>
    </div>
  `;

  try {
    const res = await fetch(`pages/${targetPage}.html`);
    if (!res.ok) throw new Error(`Failed to load pages/${targetPage}.html`);
    const pageHtml = await res.text();
    container.innerHTML = pageHtml;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-600 p-8 rounded-2xl text-center font-bold text-sm">
        ᄅာမျက်န࿸`) ဖွင့်မရသေးပါခင်ဗျာ။ ခေတ္တစောင့်ဆိုင်းပြီး ပြန်လည်ကြိုးစားပေးပါ။
      </div>
    `;
  }
}

function handleHashRoute() {
  const hash = window.location.hash.replace('#', '').trim();
  const page = hash || 'about';
  loadPage(page, false);
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
    const contentEl.style.webkitLineClamp = '3';
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
    constEl.innerText = current + 1;
    countEl.dataset.liked = 'true';
    if (iconEl) iconEl.innerText = '❤️';
  } else {
    constEl.innerText = Math.max(0, current - 1);
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

// Dynamic Ad Banner from Google Sheet
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
