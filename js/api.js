// =========================================================================
// 🌐 The Insights Solution (TIS) - Universal CMS & Dynamic Rendering Engine
// =========================================================================

const MASTER_API = "https://script.google.com/macros/s/AKfycbwuwM_avvTVZyYqgXVwzF_IAd5klnlvdmJ13JwBWiByUxXAq7dXKAiuLB5sjSornBfH/exec";
const DATA_CACHE = {};

function resolveMedia(folder, filename) {
  if (!filename || filename === "" || filename === "null" || filename === "undefined") {
    return "../Media_Files/branding/placeholder.png";
  }
  const cleanName = String(filename).trim();
  if (cleanName.startsWith("http://") || cleanName.startsWith("https://") || cleanName.startsWith("data:")) {
    return cleanName;
  }
  // Determine if running from within pages/ subdirectory or root
  const isInPagesDir = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/');
  const prefix = isInPagesDir ? '../Media_Files' : 'Media_Files';
  
  if (cleanName.includes("/")) {
    return `${prefix}/${cleanName}`;
  }
  return `${prefix}/${folder}/${cleanName}`;
}

function createButtonHtml(url, label, customClass = "bg-blue-600 hover:bg-blue-700 text-white") {
  if (!url || url.trim() === "" || url === "#") return "";
  return `
    <a href="${url}" target="_blank" rel="noopener noreferrer" 
       class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition shadow-sm ${customClass}">
      <span>${label}</span>
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
    </a>
  `;
}

async function fetchTabData(tabName, forceRefresh = false) {
  if (!forceRefresh && DATA_CACHE[tabName]) {
    return DATA_CACHE[tabName];
  }
  
  const url = `${MASTER_API}?tab=${encodeURIComponent(tabName)}${forceRefresh ? '&nocache=1' : ''}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === "success" && json.data) {
      DATA_CACHE[tabName] = json.data;
      return json.data;
    } else {
      console.warn("API returned error or empty data for tab:", tabName, json);
      return [];
    }
  } catch (err) {
    console.error(`Error fetching tab [${tabName}]:`, err);
    return [];
  }
}

async function initSection(tabName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-16 w-full">
      <div class="w-8 h-8 border-3 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Cloud CMS မှ ဒေတာများ ဆွဲယူနေပါသည်...</p>
    </div>
  `;

  const data = await fetchTabData(tabName);
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-500">
        <p class="font-bold text-xs">လက်ရှိတွင် အချက်အလက်များ မရှိသေးပါ</p>
        <p class="text-[10px] text-gray-400 mt-1">Google Sheet တွင် ဒေတာဖြည့်သွင်းပြီးပါက အလိုအလျောက် ပေါ်လာမည်ဖြစ်ပါသည်။</p>
      </div>
    `;
    return;
  }

  switch (tabName) {
    case "HOME_About":
      renderAbout(data, container);
      break;
    case "HOME_Projects":
      renderProjects(data, container);
      break;
    case "FREE_Excel_Hacks":
      renderHacks(data, container);
      break;
    case "FREE_Videos":
      renderVideos(data, container);
      break;
    case "FREE_Articles":
      renderArticles(data, container);
      break;
    case "COURSE_Excel":
    case "COURSE_PowerQuery":
    case "COURSE_PowerBI":
    case "COURSE_SQL":
      renderCourse(data, tabName, container);
      break;
    case "TEST_Reviews":
      renderReviews(data, container);
      break;
    default:
      console.warn("No specific renderer for tab:", tabName);
  }
}

function renderAbout(rows, container) {
  const item = rows[0] || {};
  const photoUrl = resolveMedia('about', item.Image_Name || 'arkar_linn.png');
  
  container.innerHTML = `
    <div class="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
      <div class="w-36 h-36 md:w-48 md:h-48 rounded-2xl overflow-hidden shrink-0 shadow-md border-2 border-blue-50">
        <img src="${photoUrl}" alt="${item.Headline || 'Sayar Arkar Linn'}" class="w-full h-full object-cover" onerror="this.src='../Media_Files/branding/placeholder.png'">
      </div>
      <div class="flex-1 text-left space-y-3">
        <span class="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-extrabold uppercase tracking-wider">
          ${item.Subheadline || 'Founder & Lead Instructor'}
        </span>
        <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          ${item.Headline || 'About The Insights Solution'}
        </h2>
        <div class="text-gray-600 text-sm leading-relaxed space-y-2">
          ${item.Founder_Bio_MD ? `<p>${item.Founder_Bio_MD}</p>` : ''}
          ${item.Vision_Mission_MD ? `<p class="font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border-l-4 border-blue-600">${item.Vision_Mission_MD}</p>` : ''}
        </div>
        <div class="pt-2 flex flex-wrap gap-3">
          ${createButtonHtml(item.CTA_Link, item.CTA_Text || 'ဆက်သွယ်ရန်')}
          ${item.Viber_Link ? `<a href="${item.Viber_Link}" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 transition">Viber ဆက်သွယ်မည်</a>` : ''}
          ${item.Facebook_Link ? `<a href="${item.Facebook_Link}" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition">Facebook Page</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderProjects(rows, container) {
  let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">`;
  rows.forEach(p => {
    const imgUrl = resolveMedia('projects', p.Image_Name);
    const techTags = (p.Tech_Stack || '').split('/').map(t => `<span class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold">${t.trim()}</span>`).join('');
    
    html += `
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
        <div>
          <div class="h-44 w-full bg-gray-100 overflow-hidden relative">
            <img src="${imgUrl}" alt="${p.Title}" class="w-full h-full object-cover transition hover:scale-105 duration-300" onerror="this.src='../Media_Files/branding/placeholder.png'">
            <span class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">${p.Category || 'Project'}</span>
          </div>
          <div class="p-5 space-y-3">
            <h3 class="font-extrabold text-base text-gray-900 leading-snug">${p.Title}</h3>
            <p class="text-xs text-gray-500 line-clamp-2 leading-relaxed">${p.Summary || ''}</p>
            <div class="flex flex-wrap gap-1.5">${techTags}</div>
          </div>
        </div>
        <div class="p-5 pt-0">
          <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            ${createButtonHtml(p.Live_Demo_URL, 'Live Demo စမ်းသပ်ရန် ➔', 'bg-slate-900 hover:bg-blue-600 text-white flex-1 text-center')}
            ${p.GitHub_URL ? `<a href="${p.GitHub_URL}" target="_blank" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition">GitHub</a>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderHacks(rows, container) {
  let html = `<div class="space-y-4 w-full">`;
  rows.forEach((h, idx) => {
    const imgUrl = resolveMedia('hacks', h.Image_Name);
    html += `
      <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-emerald-200 transition">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-lg">${h.Hack_No || `Hack #${idx+1}`}</span>
              <span class="text-xs font-bold text-gray-400">${h.Category || 'Excel'}</span>
            </div>
            <h3 class="font-extrabold text-base text-gray-800">${h.Title}</h3>
            ${h.Problem_Statement ? `<p class="text-xs text-rose-600 font-medium bg-rose-50/60 p-2.5 rounded-xl border-l-2 border-rose-400">⚠️ ပြဿနာ: ${h.Problem_Statement}</p>` : ''}
            <div class="text-xs text-gray-600 whitespace-pre-line leading-relaxed bg-slate-50 p-3.5 rounded-xl font-mono">${h.Solution_Steps_MD || ''}</div>
          </div>
          ${h.Image_Name ? `
            <div class="w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer" onclick="window.open('${imgUrl}', '_blank')">
              <img src="${imgUrl}" alt="${h.Title}" class="w-full h-full object-cover hover:scale-110 transition" onerror="this.src='../Media_Files/branding/placeholder.png'">
            </div>
          ` : ''}
        </div>
        ${h.Download_File_URL ? `
          <div class="mt-3 pt-3 border-t border-gray-100 flex justify-end">
            ${createButtonHtml(h.Download_File_URL, 'Practice File ဒေါင်းလုဒ်ရယူရန် 📥', 'bg-emerald-600 hover:bg-emerald-700 text-white')}
          </div>
        ` : ''}
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderVideos(rows, container) {
  let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">`;
  rows.forEach(v => {
    const thumbUrl = resolveMedia('videos', v.Image_Name);
    const ytUrl = v.YouTube_Embed_ID ? `https://www.youtube.com/watch?v=${v.YouTube_Embed_ID}` : '#';
    
    html += `
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col justify-between">
        <div>
          <div class="h-44 w-full bg-gray-900 relative group cursor-pointer" onclick="window.open('${ytUrl}', '_blank')">
            <img src="${thumbUrl}" alt="${v.Title}" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" onerror="this.src='../Media_Files/branding/placeholder.png'">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                <svg class="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <span class="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">${v.Duration || '15:00'}</span>
          </div>
          <div class="p-4 space-y-2">
            <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider">${v.Topic || 'Tutorial'}</span>
            <h3 class="font-extrabold text-sm text-gray-900 leading-snug">${v.Title}</h3>
          </div>
        </div>
        <div class="p-4 pt-0">
          <div class="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
            ${createButtonHtml(ytUrl, 'YouTube တွင် ကြည့်ရှုမည်', 'bg-red-600 hover:bg-red-700 text-white text-xs')}
            ${v.Notes_URL ? `<a href="${v.Notes_URL}" target="_blank" class="text-xs font-bold text-gray-600 hover:text-blue-600">Lecture Notes 📥</a>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderArticles(rows, container) {
  let html = `<div class="space-y-6 w-full">`;
  rows.forEach(a => {
    const coverUrl = resolveMedia('articles', a.Image_Name);
    html += `
      <article class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
        ${a.Image_Name ? `
          <div class="w-full md:w-48 h-36 rounded-2xl overflow-hidden shrink-0 bg-gray-100">
            <img src="${coverUrl}" alt="${a.Title}" class="w-full h-full object-cover" onerror="this.src='../Media_Files/branding/placeholder.png'">
          </div>
        ` : ''}
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-2 text-xs font-bold text-gray-400">
            <span class="text-blue-600">${a.Category || 'Data Analytics'}</span>
            <span>•</span>
            <span>${a.Published_Date || ''}</span>
            <span>•</span>
            <span>${a.Author || 'Sayar Arkar Linn'}</span>
          </div>
          <h3 class="text-lg md:text-xl font-extrabold text-gray-900 leading-snug">${a.Title}</h3>
          <p class="text-xs text-gray-500 leading-relaxed">${a.Summary || ''}</p>
          <div class="text-xs text-gray-700 bg-gray-50 p-4 rounded-2xl whitespace-pre-line leading-relaxed font-sans">${a.Content_Markdown || ''}</div>
          <div class="pt-2 flex items-center justify-between text-xs text-gray-500">
            <span class="flex items-center gap-1 font-bold text-rose-500">❤️ ${a.Likes_Count || 0} Likes</span>
          </div>
        </div>
      </article>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function renderCourse(rows, tabName, container) {
  const c = rows[0] || {};
  const bannerUrl = resolveMedia('courses', c.Image_Name);
  const colorMap = {
    'COURSE_Excel': 'text-emerald-600 border-emerald-500 bg-emerald-50',
    'COURSE_PowerQuery': 'text-amber-600 border-amber-500 bg-amber-50',
    'COURSE_PowerBI': 'text-blue-600 border-blue-500 bg-blue-50',
    'COURSE_SQL': 'text-cyan-600 border-cyan-500 bg-cyan-50'
  };
  const theme = colorMap[tabName] || 'text-blue-600 border-blue-500 bg-blue-50';

  container.innerHTML = `
    <div class="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 p-6 md:p-8 mb-8">
      <div class="w-full md:w-5/12 rounded-2xl overflow-hidden bg-gray-100 relative min-h-[220px]">
        <img src="${bannerUrl}" alt="${c.Course_Title || c.Title}" class="w-full h-full object-cover" onerror="this.src='../Media_Files/branding/placeholder.png'">
        <span class="absolute top-4 left-4 bg-slate-900/90 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">${c.Batch_No || 'Next Batch'}</span>
      </div>
      <div class="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${theme}">${c.Subtitle || tabName.replace('COURSE_', '')}</span>
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2 tracking-tight">${c.Course_Title || c.Title}</h2>
          <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div class="bg-gray-50 p-3 rounded-xl"><span class="text-gray-400 block font-bold">သင်တန်းကာလ:</span> <span class="font-extrabold text-gray-800">${c.Duration || '4-6 Weeks'}</span></div>
            <div class="bg-gray-50 p-3 rounded-xl"><span class="text-gray-400 block font-bold">အချိန်ဇယား:</span> <span class="font-extrabold text-gray-800">${c.Schedule || 'Live Online'}</span></div>
            <div class="bg-gray-50 p-3 rounded-xl"><span class="text-gray-400 block font-bold">ပုံမှန်သင်တန်းကြေး:</span> <span class="line-through text-gray-400 font-bold">${c.Regular_Fee_MMK || c.Fee_Regular || '0'} MMK</span></div>
            <div class="bg-emerald-50 p-3 rounded-xl border border-emerald-200"><span class="text-emerald-700 block font-bold">Early Bird ကြေး:</span> <span class="text-emerald-700 font-extrabold text-sm">${c.Promo_Fee_MMK || c.Fee_Discount || '0'} MMK</span></div>
          </div>
          <div class="mt-4 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl whitespace-pre-line leading-relaxed">
            <strong class="text-gray-800 block mb-1">📋 Course Syllabus Overview:</strong>
            ${c.Syllabus_Outline_MD || 'Course modules and detailed topics covered in live classes.'}
          </div>
        </div>
        <div class="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <div class="text-xs font-bold text-gray-500">Status: <span class="text-emerald-600 font-extrabold">${c.Status || 'Enrolling Open'}</span></div>
          ${createButtonHtml(c.Form_Link || c.Enroll_Form_URL, 'ကျောင်းအပ်နှံရန် လျှောက်ထားမည်', 'bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-6 py-3 shadow-md')}
        </div>
      </div>
    </div>
  `;
}

function renderReviews(rows, container) {
  let html = `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">`;
  rows.forEach(r => {
    const avatarUrl = resolveMedia('reviews', r.Image_Name);
    const stars = '⭐'.repeat(Number(r.Rating_Stars) || 5);
    html += `
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
        <div class="space-y-3">
          <div class="text-sm">${stars}</div>
          <p class="text-xs text-gray-600 leading-relaxed italic">"${r.Review_Text || r.Feedback_Text || ''}"</p>
        </div>
        <div class="pt-4 border-t border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
            <img src="${avatarUrl}" alt="${r.Student_Name}" class="w-full h-full object-cover" onerror="this.src='../Media_Files/branding/placeholder.png'">
          </div>
          <div>
            <h4 class="font-extrabold text-xs text-gray-900">${r.Student_Name}</h4>
            <p class="text-[10px] text-gray-400 font-bold">${r.Role_Company || ''} • <span class="text-blue-600">${r.Course_Taken || ''}</span></p>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}
