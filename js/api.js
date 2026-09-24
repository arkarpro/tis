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
    return "Media_Files/" + cleanName;
  }
  return "Media_Files/" + folder + "/" + cleanName;
}

// Fetch any tab data from Google Sheet
async function fetchTabData(tabName, forceRefresh = false) {
  if (!forceRefresh && DATA_CACHE[tabName]) {
    return DATA_CACHE[tabName];
  }
  const url = MASTER_API + "?tab=" + encodeURIComponent(tabName) + (forceRefresh ? "&nocache=1" : "");
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === "success" && json.data) {
      DATA_CACHE[tabName] = json.data;
      return json.data;
    }
    return [];
  } catch (err) {
    console.error("Error fetching tab [" + tabName + "]:", err);
    return [];
  }
}

// Universal Content Card HTML Builder
function createUniversalCardHtml(item, folder, fallbackFolder = "courses") {
  const id = String(item.Course_ID || item.ID || item.Project_ID || item.Hack_No || item.Article_ID || item.Review_ID || Math.random().toString(36).substring(7)).trim();
  const title = item.Title || item.Headline || item.Course_Title || item.Student_Name || "The Insights Solution";
  const rawImg = item.Photo_Name || item.Image_Name || item.Thumbnail_URL || "";
  const imgSrc = resolveMedia(folder, rawImg);
  const fallbackSrc = "Media_Files/" + rawImg;
  
  // 1. Dynamic Button Text (from Google Sheet Button_Text column)
  const actionText = item.Button_Text || item.Action_Text || "သင်တန်း အပ်နှံရန်";
  const actionLink = item.Action_Link || item.Form_Link || item.Live_Demo_URL || "viber://chat?number=%2B959425320949";
  
  const summary = item.Summary || item.Description || item.Problem_Statement || "";
  const fullContent = item.Content_Markdown || item.Detailed_MD || item.Solution_Steps_MD || item.Syllabus_Outline_MD || item.Review_Text || "";
  
  // 2. Dynamic Likes (from Google Sheet Likes column + LocalStorage sync)
  const baseLikes = parseInt(item.Likes || item.Like_Count || item.Likes_Count || 0);
  const isLiked = localStorage.getItem("tis_liked_" + id) === "true";
  const totalLikes = baseLikes + (isLiked ? 1 : 0);
  
  // 3. Dynamic Comments (comma-separated from Google Sheet Comments column)
  let rawComments = item.Comments || "";
  let commentList = [];
  if (rawComments && typeof rawComments === "string" && rawComments.trim()) {
    commentList = rawComments.split(",").map(c => c.trim()).filter(c => c.length > 0);
  }
  try {
    const localComments = JSON.parse(localStorage.getItem("tis_local_comments_" + id) || "[]");
    if (Array.isArray(localComments)) {
      commentList = commentList.concat(localComments);
    }
  } catch(e) {}
  
  const category = item.Batch_No || item.Category || item.Tech_Stack || item.Topic || "";

  return `
  <div class="universal-card bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col mb-6 transition hover:shadow-md" data-tab-name="${folder}">
    
    <!-- 1. Title -->
    <div class="p-4 pb-3 border-b border-gray-100 flex items-center justify-between gap-3">
      <h3 class="font-extrabold text-slate-900 text-base sm:text-lg leading-snug">${title}</h3>
      ${category ? `<span class="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] shrink-0">${category}</span>` : ""}
    </div>

    <!-- 2. Media Display (Strict 16:9 Ratio, object-fit: contain) -->
    <div class="media-frame" style="position: relative; width: 100%; aspect-ratio: 16 / 9; background-color: #f4f4f4; overflow: hidden; display: flex; align-items: center; justify-content: center;">
      <img src="${imgSrc}" alt="${title}" class="w-full h-full object-contain" 
           onerror="if(!this.dataset.fallback){this.dataset.fallback=1; this.src='${fallbackSrc}';}else{this.src='Media_Files/branding/logo1.jpg';}">
      
      <!-- Action Button (Absolute Bottom Right overlay) -->
      <a href="${actionLink}" target="_blank" rel="noopener noreferrer" 
         class="action-btn"
         style="position: absolute; bottom: 10px; right: 10px; z-index: 10; background-color: #1e3a8a; color: #ffffff; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(30,58,138,0.35); text-decoration: none; transition: 0.2s;"
         onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#1e3a8a'">
        <span>${actionText}</span>
        <span>➔</span>
      </a>
    </div>

    <!-- 3. Social Actions Row (Flexbox: Left: Like | Center: Comment | Right: Share) -->
    <div class="flex items-center justify-between px-4 py-2.5 border-t border-b border-gray-100 bg-slate-50/70 text-xs text-gray-500 font-semibold select-none">
      <button onclick="handleLike('${id}')" id="like-btn-${id}" class="flex items-center gap-1.5 transition ${isLiked ? "text-rose-600 font-bold" : "hover:text-rose-600"}">
        <span id="like-icon-${id}">${isLiked ? "❤️" : "🤍"}</span>
        <span id="like-count-${id}">${totalLikes}</span> Likes
      </button>
      <button onclick="toggleCommentDrawer('${id}')" class="flex items-center gap-1.5 hover:text-blue-600 transition">
        <span>💬</span>
        <span>မှတ်ချက်များ (<span id="btn-cmt-count-${id}">${commentList.length}</span>)</span>
      </button>
      <button onclick="handleShare('${title}', '${actionLink}')" class="flex items-center gap-1.5 hover:text-indigo-600 transition">
        <span>🔗</span>
        <span>မျှဝေမည်</span>
      </button>
    </div>

    <!-- 4. Comments Drawer (Anonymous IDs with #User-XX) -->
    <div id="comments-drawer-${id}" style="display: none;" class="border-b border-gray-100 bg-slate-50/70 p-4 transition-all duration-300">
      <div class="flex items-center justify-between mb-2.5">
        <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span>💬</span> ကျောင်းသား/သူများ၏ မှတ်ချက်များ
        </span>
        <button onclick="toggleCommentDrawer('${id}')" class="text-[11px] text-gray-400 hover:text-gray-600 font-semibold">ပိတ်မည် ✕</button>
      </div>
      
      <div id="comments-list-${id}" class="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
        ${commentList.length > 0 ? commentList.map((cmt, idx) => `
          <div class="bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs flex items-start gap-2 text-xs">
            <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-black text-[10px] shrink-0">#User-${String(idx + 1).padStart(2, "0")}</span>
            <span class="text-gray-700 leading-snug">${cmt}</span>
          </div>
        `).join("") : `<p class="text-xs text-gray-400 italic py-1">မှတ်ချက် မရှိသေးပါ။ ပထမဆုံး မှတ်ချက် ရေးသားနိုင်ပါသည်။</p>`}
      </div>
      
      <!-- Anonymous Comment Input Form -->
      <div class="flex gap-2 items-center">
        <input type="text" id="comment-input-${id}" placeholder="မှတ်ချက် ရေးသားပါ (အမည် မဖော်ပြပါ)..." 
               class="flex-1 text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
               onkeydown="if(event.key==='Enter'){submitComment('${id}');}">
        <button onclick="submitComment('${id}')" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0">
          <span>ပို့မည်</span> ➔
        </button>
      </div>
    </div>

    <!-- 5. Content / Article (3-line clamp + Read more >> toggle) -->
    <div class="p-4 text-xs text-gray-600 leading-relaxed font-sans">
      <div id="content-${id}" class="content-clamped" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
        ${summary ? `<p class="font-medium text-gray-700 mb-1">${summary}</p>` : ""}
        ${fullContent ? `<div class="mt-2 space-y-1.5 text-gray-600">${fullContent}</div>` : ""}
      </div>
      <button onclick="toggleReadMore('${id}')" id="readmore-btn-${id}" class="mt-2 font-extrabold text-blue-600 hover:text-blue-800 transition inline-block">
        Read more &gt;&gt;
      </button>
    </div>

  </div>
  `;
}

// Global UI Handlers
function handleLike(id) {
  const icon = document.getElementById("like-icon-" + id);
  const countEl = document.getElementById("like-count-" + id);
  const btn = document.getElementById("like-btn-" + id);
  const key = "tis_liked_" + id;
  const isLiked = localStorage.getItem(key) === "true";
  let count = parseInt(countEl ? countEl.innerText : "0") || 0;

  if (isLiked) {
    localStorage.removeItem(key);
    count = Math.max(0, count - 1);
    if (countEl) countEl.innerText = count;
    if (icon) icon.innerText = "🤍";
    if (btn) {
      btn.classList.remove("text-rose-600", "font-bold");
      btn.classList.add("hover:text-rose-600");
    }
  } else {
    localStorage.setItem(key, "true");
    count += 1;
    if (countEl) countEl.innerText = count;
    if (icon) icon.innerText = "❤️";
    if (btn) {
      btn.classList.add("text-rose-600", "font-bold");
      btn.classList.remove("hover:text-rose-600");
    }

    // Live Sync with Google Sheet Backend API (Instant Write-Back)
    const cardEl = btn ? btn.closest(".universal-card") : null;
    const tabName = "COURSE_Excel";
    const syncUrl = MASTER_API + "?action=like&tab=" + encodeURIComponent(tabName) + "&id=" + encodeURIComponent(id);
    fetch(syncUrl).catch(() => {
      // Fallback with no-cors if CORS is restricted
      fetch(syncUrl, { mode: "no-cors" }).catch(e => console.log("Like sync error:", e));
    });
  }
}

function toggleCommentDrawer(id) {
  const drawer = document.getElementById("comments-drawer-" + id);
  if (!drawer) return;
  if (drawer.style.display === "none" || drawer.style.display === "") {
    drawer.style.display = "block";
    const input = document.getElementById("comment-input-" + id);
    if (input) setTimeout(() => input.focus(), 60);
  } else {
    drawer.style.display = "none";
  }
}

function submitComment(id) {
  const input = document.getElementById("comment-input-" + id);
  if (!input || !input.value.trim()) return;
  const newComment = input.value.trim();
  
  // Save to localStorage for instant user preview
  const localKey = "tis_local_comments_" + id;
  let existing = [];
  try {
    existing = JSON.parse(localStorage.getItem(localKey) || "[]");
  } catch(e) { existing = []; }
  existing.push(newComment);
  localStorage.setItem(localKey, JSON.stringify(existing));
  
  // Append to UI list
  const list = document.getElementById("comments-list-" + id);
  const countEl = document.getElementById("btn-cmt-count-" + id);
  const currentTotal = (parseInt(countEl ? countEl.innerText : "0") || 0) + 1;
  if (countEl) countEl.innerText = currentTotal;
  
  if (list) {
    if (list.querySelector("p")) {
      list.innerHTML = "";
    }
    const div = document.createElement("div");
    div.className = "bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs flex items-start gap-2 text-xs";
    div.innerHTML = `
      <span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-black text-[10px] shrink-0">#User-${String(currentTotal).padStart(2, "0")}</span>
      <span class="text-gray-700 leading-snug">${newComment}</span>
    `;
    list.appendChild(div);
  }
  input.value = "";

  // Live Sync with Google Sheet Backend API
  const syncUrl = MASTER_API + "?action=comment&tab=COURSE_Excel&id=" + encodeURIComponent(id) + "&comment=" + encodeURIComponent(newComment);
  fetch(syncUrl, { mode: "no-cors" }).catch(e => console.log("Comment sync error:", e));
}

function toggleReadMore(id) {
  const content = document.getElementById("content-" + id);
  const btn = document.getElementById("readmore-btn-" + id);
  if (!content || !btn) return;
  
  if (content.style.webkitLineClamp === "unset" || content.style.display === "block") {
    content.style.display = "-webkit-box";
    content.style.webkitLineClamp = "3";
    btn.innerHTML = "Read more &gt;&gt;";
  } else {
    content.style.display = "block";
    content.style.webkitLineClamp = "unset";
    btn.innerHTML = "&lt;&lt; Show less";
  }
}

function handleShare(title, link) {
  if (navigator.share) {
    navigator.share({ title: title, url: link || window.location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(link || window.location.href).then(() => {
      alert("လင့်ခ်ကို ကူးယူပြီးပါပြီခင်ဗျာ: " + (link || window.location.href));
    }).catch(() => {});
  }
}

// Expose globals for onclick handlers
window.handleLike = handleLike;
window.toggleCommentDrawer = toggleCommentDrawer;
window.openCommentBox = toggleCommentDrawer;
window.submitComment = submitComment;
window.toggleReadMore = toggleReadMore;
window.handleShare = handleShare;
window.createUniversalCardHtml = createUniversalCardHtml;
window.fetchTabData = fetchTabData;
window.resolveMedia = resolveMedia;
