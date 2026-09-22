/**
 * The Insights Solution - Mobile Swipe Navigation
 * စာမျက်နှာအလိုက် ဖုန်း Screen ဘယ်/ညာ ပွတ်ဆွဲ၍ ကူးပြောင်းနိုင်သော စနစ်
 * Sequence: index.html (Home) <---> free.html (Free) <---> courses.html (Course) <---> test-review.html (Test & Review)
 */
(function() {
  const pages = ['index.html', 'free.html', 'courses.html', 'test-review.html'];
  
  // လက်ရှိ ရောက်ရှိနေသော စာမျက်နှာကို ရှာဖွေခြင်း
  let currentPath = window.location.pathname.split('/').pop() || 'index.html';
  if (!currentPath.endsWith('.html') && currentPath === '') currentPath = 'index.html';
  let currentIndex = pages.indexOf(currentPath);
  if (currentIndex === -1) currentIndex = 0;

  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  // Touch စတင်ချိန်
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  }, { passive: true });

  // Touch ပြီးဆုံးချိန်
  document.addEventListener('touchend', function(e) {
    if (e.changedTouches.length === 1) {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      processSwipe();
    }
  }, { passive: true });

  function processSwipe() {
    const diffX = endX - startX;
    const diffY = endY - startY;
    const threshold = 80; // အနည်းဆုံး ၈၀ pixel ပွတ်ဆွဲမှ အလုပ်လုပ်မည်

    // ဒေါင်လိုက် scroll ဆွဲခြင်း မဟုတ်ဘဲ အလျားလိုက် swipe ဖြစ်မှသာ စစ်ဆေးမည်
    if (Math.abs(diffX) > threshold && Math.abs(diffX) > Math.abs(diffY) * 1.6) {
      if (diffX < 0) {
        // ဘယ်ဘက်သို့ ဆွဲခြင်း (Swipe Left) -> နောက်စာမျက်နှာသို့ သွားမည်
        if (currentIndex < pages.length - 1) {
          showSwipeIndicator('Next ➔ ' + getPageName(currentIndex + 1));
          setTimeout(function() {
            window.location.href = pages[currentIndex + 1];
          }, 180);
        }
      } else {
        // ညာဘက်သို့ ဆွဲခြင်း (Swipe Right) -> ရှေ့စာမျက်နှာသို့ သွားမည်
        if (currentIndex > 0) {
          showSwipeIndicator('⬅ Prev: ' + getPageName(currentIndex - 1));
          setTimeout(function() {
            window.location.href = pages[currentIndex - 1];
          }, 180);
        }
      }
    }
  }

  function getPageName(index) {
    const titles = ['Home', 'Free', 'Course', 'Test & Review'];
    return titles[index] || '';
  }

  function showSwipeIndicator(text) {
    let badge = document.getElementById('tis-swipe-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'tis-swipe-badge';
      badge.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/90 text-blue-400 font-bold text-xs rounded-full shadow-2xl border border-blue-500/50 z-50 pointer-events-none transition-all duration-300';
      document.body.appendChild(badge);
    }
    badge.textContent = text;
    badge.style.opacity = '1';
    badge.style.transform = 'translate(-50%, 0)';
  }
})();

// Mobile Menu Toggle Function
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}
