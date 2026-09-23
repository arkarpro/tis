// =========================================================================
// 🌐 The Insights Solution (TIS) - Universal API & Content Card Engine
// =========================================================================

const MASTER_API = "https://script.google.com/macros/s/AKfycbwuwM_avvTVZyYqgXVwzF_IAd5klnlvdmJ13JwBWiByUxXAq7dXKAiuLB5sjSornBfH/exec";
const DATA_CACHE = {};

// Universal Media Resolver (Strictly Media_Files)
function resolveMedia(folder, filename) {
  if (!filename || filename === "" || filename === "null" || filename === "undefined") {
    return "Media_Files/branding/logo1.jpg";
  }
  const cleanName = String(filename).trim();
  if (cleanName.startsWith("http://") || cleanName.startsWith("https://") || cleanName.startsWith("data:")) {
    return cleanName;
  }
  if (cleanName.startsWith("Media_Files/")) {
    return cleanName;
  }
  if (cleanName.startsWith("media_folder/")) {
    return cleanName.replace("media_folder/", "Media_Files/");
  }
  if (cleanName.includes("/")) {
    return `Media_Files/${cleanName}`;
  }
  return `Media_Files/${folder}/${cleanName}`;
}

// Fetch any tab data from Google Sheet
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
    }
    return [];
  } catch (err) {
    console.error(`Error fetching tab [${tabName}]:`, err);
    return [];
  }
}

// Universal Content Card HTML Builder
function createUniversalCardHtml(item, folder, fallbackFolder = "projects") {
  const id = item.ID || item.Project_ID || item.Hack_No || item.Article_ID || item.Course_ID || item.Review_ID || Math.random().toString(36).substring(7);
  const title = item.Title || item.Headline || item.Course_Title || item.Student_Name || "The Insights Solution";
  const rawImg = item.Photo_Name || item.Image_Name || item.Thumbnail_URL || "";
  const imgSrc = resolveMedia(folder, rawImg);
  const fallbackSrc = `Media_Files/${rawImg}`;
  
  const actionText = item.Action_Text || "သင်တန်းအပ်နှံရန် / ဆွေးနွေးရန်";
  const actionLink = item.Action_Link || item.Live_Demo_URL || item.Form_Link || "viber://chat?number=%2B959425320949";
  const summary = item.Summary || item.Description || item.Problem_Statement || "";
  const fullContent = item.Content_Markdown || item.Detailed_MD || item.Solution_Steps_MD || item.Syllabus_Outline_MD || item.Review_Text || "";
  const likes = item.Like_Count || item.Likes_Count || 100;
  
  const category = item.Category || item.Tech_Stack || item.Topic || "";

  return `
  <div class="universal-card bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col mb-6 transition hover:shadow-md">
    
    <!-- 1. Title -->
    <div class="p-4 pb-3 border-b border-gray-100 flex items-center justify-between gap-3">
      <h3 class="font-extrabold text-slate-900 text-base sm:text-lg leading-snug">${title}</h3>
      ${category ? `<span class="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] shrink-0">${category}</span>` : ''}
    </div>

    <!-- 2. Media Display (Strict 16:9 Ratio, object-fit: contain) -->
    <div class="media-frame" style="position: relative; width: 100%; aspect-ratio: 16 / 9; background-color: #f4f4f4; overflow: hidden; display: flex; align-items: center; justify-content: center;">
      <img src="${imgSrc}" alt="${title}" class="w-full h-full object-contain" 
           onerror="if(!this.dataset.fallback){this.dataset.fallback=1; this.src='${fallbackSrc}';}else{this.src='Media_Files/branding/logo1.jpg';}">
      
      <!-- Action Button (Absolute Bottom Right overlay) -->
      <a href="${actionLink}" target="_blank" rel="noopener noreferrer" 
         class="action-btn"
         style="position: absolute; bottom: 10px; right: 10px; z-index: 10; background-color: #0f172a; color: #ffffff; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); text-decoration: none; transition: 0.2s;"
         onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#0f172a'">
        <span>${actionText}</span>
        <span>➔</span>
      </a>
    </div>

    <!-- 3. Social Actions Row (Flexbox: Left: Like | Center: Comment | Right: Share) -->
    <div class="flex items-center justify-between px-4 py-2.5 border-t border-b border-gray-100 bg-slate-50/70 text-xs text-gray-500 font-semibold select-none">
      <button onclick="handleLike('${id}')" id="like-btn-${id}" class="flex items-center gap-1.5 hover:text-rose-600 transition">
        <span id="like-icon-${id}">🤍</span>
        <span id="like-count-${id}">${likes}</span> Likes
      </button>
      <button onclick="openCommentBox('${id}')" class="flex items-center gap-1.5 hover:text-blue-600 transition">
        <span>💬</span>
        <span>မှတ်ချက်ပေးရန်</span>
      </button>
      <button onclick="handleShare('${title}', '${actionLink}')" class="flex items-center gap-1.5 hover:text-indigo-600 transition">
        <span>🔗</span>
        <span>မျှဝေမည်</span>
      </button>
    </div>

    <!-- 4. Content / Article (3-line clamp + Read more >> toggle) -->
    <div class="p-4 text-xs text-gray-600 leading-relaxed font-sans">
      <div id="content-${id}" class="content-clamped" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
        ${summary ? `<p class="font-medium text-gray-700 mb-1">${summary}</p>` : ''}
        ${fullContent ? `<div class="mt-2 space-y-1.5 text-gray-600">${fullContent}</div>` : ''}
      </div>
      <button onclick="toggleReadMore('${id}')" id="readmore-btn-${id}" class="mt-2 font-extrabold text-blue-600 hover:text-blue-800 transition inline-block">
        Read more &gt;&gt;
      </button>
    </div>

  </div>
  `;
}
