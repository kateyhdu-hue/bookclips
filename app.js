const STORAGE_KEY = "bookclips.v4";

let state = loadState();
let activeBookId = state.books[0]?.id || null;
let imageFile = null;
let selection = null;
let dragStart = null;

const $ = (id) => document.getElementById(id);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { books: [] };
  } catch {
    return { books: [] };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activeBook() {
  return state.books.find(b => b.id === activeBookId);
}

function render() {
  renderBooks();
  renderWorkspace();
}

function renderBooks() {
  const list = $("bookList");
  list.innerHTML = "";

  if (!state.books.length) {
    list.innerHTML = "<p>还没有书。先新增一本。</p>";
    return;
  }

  state.books.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card" + (book.id === activeBookId ? " active" : "");
    card.innerHTML = `
      <strong>${escapeHtml(book.title)}</strong>
      <span>${escapeHtml(book.author || "未知作者")} · ${book.clips.length} 条摘录</span>
    `;
    card.onclick = () => {
      activeBookId = book.id;
      render();
    };
    list.appendChild(card);
  });
}

function renderWorkspace() {
  const book = activeBook();
  $("emptyState").classList.toggle("hidden", !!book);
  $("bookWorkspace").classList.toggle("hidden", !book);
  if (!book) return;

  $("activeBookTitle").textContent = book.title;
  $("activeBookMeta").textContent = `${book.author || "未知作者"} · ${book.clips.length} 条摘录`;
  renderClips();
}

function addBook() {
  const title = $("bookTitle").value.trim();
  const author = $("bookAuthor").value.trim();
  if (!title) return alert("请先输入书名");

  const book = {
    id: uid(),
    title,
    author,
    createdAt: new Date().toISOString(),
    clips: []
  };

  state.books.unshift(book);
  activeBookId = book.id;
  $("bookTitle").value = "";
  $("bookAuthor").value = "";
  saveState();
  render();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  imageFile = file;
  selection = null;
  hideSelection();

  const url = URL.createObjectURL(file);
  $("previewImage").src = url;
  $("cropCard").classList.remove("hidden");
  $("ocrStatus").textContent = "图片已载入。请在图片上拖拽框选要识别的文字区域。";
}

function getPoint(event) {
  const touch = event.touches?.[0] || event.changedTouches?.[0];
  const clientX = touch ? touch.clientX : event.clientX;
  const clientY = touch ? touch.clientY : event.clientY;
  const rect = $("imageStage").getBoundingClientRect();

  return {
    x: clientX - rect.left + $("imageStage").scrollLeft,
    y: clientY - rect.top + $("imageStage").scrollTop
  };
}

function startSelection(event) {
  if (!$("previewImage").src) return;
  event.preventDefault();
  dragStart = getPoint(event);
  selection = { x: dragStart.x, y: dragStart.y, w: 0, h: 0 };
  updateSelectionBox();
}

function moveSelection(event) {
  if (!dragStart) return;
  event.preventDefault();
  const point = getPoint(event);

  selection = {
    x: Math.min(dragStart.x, point.x),
    y: Math.min(dragStart.y, point.y),
    w: Math.abs(point.x - dragStart.x),
    h: Math.abs(point.y - dragStart.y)
  };

  updateSelectionBox();
}

function endSelection() {
  if (!dragStart) return;
  dragStart = null;

  if (!selection || selection.w < 20 || selection.h < 20) {
    selection = null;
    hideSelection();
    $("ocrStatus").textContent = "框选太小，请重新拖拽选择文字区域。";
    return;
  }

  $("ocrStatus").textContent = "已框选区域。点击「识别框选区域」。";
}

function updateSelectionBox() {
  if (!selection) return hideSelection();
  const box = $("selectionBox");
  box.classList.remove("hidden");
  box.style.left = `${selection.x}px`;
  box.style.top = `${selection.y}px`;
  box.style.width = `${selection.w}px`;
  box.style.height = `${selection.h}px`;
}

function hideSelection() {
  $("selectionBox").classList.add("hidden");
}

function clearSelection() {
  selection = null;
  hideSelection();
  $("ocrStatus").textContent = "已清除框选。可以重新拖拽选择文字区域。";
}

async function runOcr(useCrop = true) {
  if (!imageFile) return alert("请先选择或拍摄一张书页照片");

  let sourceBlob = imageFile;

  if (useCrop) {
    if (!selection) return alert("请先在图片上框选要识别的文字区域");
    sourceBlob = await makeCroppedImage();
  } else {
    sourceBlob = await makeFullImage();
  }

  const languageHint = $("ocrLanguage").value;
  const shouldClean = $("autoClean").checked;

  $("ocrCropBtn").disabled = true;
  $("ocrFullBtn").disabled = true;
  $("rawOcrBox").classList.add("hidden");
  $("rawOcrText").textContent = "";

  try {
    $("ocrStatus").textContent = useCrop ? "正在使用 Google Vision 识别框选区域……" : "正在使用 Google Vision 识别整张图片……";
    const base64Image = await blobToDataUrl(sourceBlob);
    const rawText = await runGoogleVisionOcr(base64Image, languageHint);

    $("rawOcrText").textContent = rawText;
    $("rawOcrBox").classList.remove("hidden");

    if (shouldClean && rawText.trim()) {
      $("ocrStatus").textContent = "Google Vision 识别完成，正在用 AI 自动修正文字……";
      const cleaned = await runAiClean(rawText, languageHint);
      $("ocrText").value = cleaned.trim();
      $("ocrStatus").textContent = "OCR + AI 修正完成。你可以自动分句或手动微调。";
    } else {
      $("ocrText").value = rawText.trim();
      $("ocrStatus").textContent = "Google Vision OCR 完成。";
    }
  } catch (e) {
    console.error(e);
    $("ocrStatus").textContent = `识别失败：${e.message || "请检查 Google/OpenAI API key、Vercel 环境变量和图片大小。"}`;
  } finally {
    $("ocrCropBtn").disabled = false;
    $("ocrFullBtn").disabled = false;
  }
}

async function runGoogleVisionOcr(base64Image, languageHint) {
  const response = await fetch("/api/ocr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      base64Image,
      languageHint
    })
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Google Vision OCR failed");
  }

  return data.text || "";
}

async function runAiClean(rawText, languageHint) {
  const response = await fetch("/api/clean", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      rawText,
      languageHint
    })
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "AI correction failed");
  }

  return data.text || rawText;
}

async function makeFullImage() {
  const img = $("previewImage");
  const canvas = $("cropCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  preprocessCanvas(ctx, canvas.width, canvas.height);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.92);
  });
}

async function makeCroppedImage() {
  const img = $("previewImage");
  const canvas = $("cropCanvas");
  const ctx = canvas.getContext("2d");

  const scaleX = img.naturalWidth / img.clientWidth;
  const scaleY = img.naturalHeight / img.clientHeight;

  const sx = Math.max(0, Math.round(selection.x * scaleX));
  const sy = Math.max(0, Math.round(selection.y * scaleY));
  const sw = Math.min(img.naturalWidth - sx, Math.round(selection.w * scaleX));
  const sh = Math.min(img.naturalHeight - sy, Math.round(selection.h * scaleY));

  canvas.width = sw;
  canvas.height = sh;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  preprocessCanvas(ctx, sw, sh);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.92);
  });
}

function preprocessCanvas(ctx, width, height) {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const contrast = 1.25;
    const intercept = 128 * (1 - contrast);

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const v = Math.max(0, Math.min(255, gray * contrast + intercept));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }

    ctx.putImageData(imageData, 0, 0);
  } catch (e) {
    console.warn("Image preprocessing skipped", e);
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function splitSentences() {
  const text = $("ocrText").value.trim();
  if (!text) return alert("没有可分句的文字");

  const cleaned = text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const sentences = cleaned
    .split(/(?<=[。！？!?；;])\s*/)
    .map(s => s.trim())
    .filter(s => s.length >= 4);

  const list = $("sentenceList");
  list.innerHTML = "";

  if (!sentences.length) {
    list.innerHTML = "<p>没有识别出完整句子。你可以直接在上方选中文字保存。</p>";
    return;
  }

  sentences.forEach(sentence => {
    const item = document.createElement("div");
    item.className = "sentence";
    item.innerHTML = `
      <div>${escapeHtml(sentence)}</div>
      <button>保存这句</button>
    `;
    item.querySelector("button").onclick = () => saveClip(sentence);
    list.appendChild(item);
  });
}

function saveSelectedText() {
  const textarea = $("ocrText");
  const selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd).trim();
  if (!selected) return alert("请先在识别结果中选中一句或一段文字");
  saveClip(selected);
}

function saveClip(text) {
  const book = activeBook();
  if (!book) return;

  const page = $("pageNumber").value.trim();

  book.clips.unshift({
    id: uid(),
    text,
    page,
    note: "",
    tags: "",
    createdAt: new Date().toISOString()
  });

  saveState();
  render();
}

function renderClips() {
  const book = activeBook();
  const query = $("searchInput").value.trim().toLowerCase();
  const list = $("clipList");

  let clips = book.clips;
  if (query) {
    clips = clips.filter(c =>
      c.text.toLowerCase().includes(query) ||
      (c.note || "").toLowerCase().includes(query) ||
      (c.tags || "").toLowerCase().includes(query) ||
      String(c.page || "").toLowerCase().includes(query)
    );
  }

  list.innerHTML = "";

  if (!clips.length) {
    list.innerHTML = "<p>还没有符合条件的书摘。</p>";
    return;
  }

  clips.forEach(clip => {
    const div = document.createElement("div");
    div.className = "clip";
    div.innerHTML = `
      <blockquote>${escapeHtml(clip.text)}</blockquote>
      <div class="clip-meta">p.${escapeHtml(clip.page || "未填")} · ${new Date(clip.createdAt).toLocaleString()}</div>
      <input class="tags" placeholder="标签，例如：焦虑 / 自由 / 交易" value="${escapeAttr(clip.tags || "")}" />
      <textarea class="note" placeholder="写一点你的想法……">${escapeHtml(clip.note || "")}</textarea>
      <div class="clip-actions">
        <button class="saveNote">保存笔记</button>
        <button class="secondary copyClip">复制</button>
        <button class="danger deleteClip">删除</button>
      </div>
    `;

    div.querySelector(".saveNote").onclick = () => {
      clip.tags = div.querySelector(".tags").value.trim();
      clip.note = div.querySelector(".note").value.trim();
      saveState();
      render();
    };

    div.querySelector(".copyClip").onclick = async () => {
      const output = `《${book.title}》${clip.page ? " p." + clip.page : ""}\n${clip.text}`;
      await navigator.clipboard.writeText(output);
      alert("已复制");
    };

    div.querySelector(".deleteClip").onclick = () => {
      book.clips = book.clips.filter(c => c.id !== clip.id);
      saveState();
      render();
    };

    list.appendChild(div);
  });
}

function deleteBook() {
  const book = activeBook();
  if (!book) return;
  if (!confirm(`确定删除《${book.title}》及其所有摘录吗？`)) return;
  state.books = state.books.filter(b => b.id !== book.id);
  activeBookId = state.books[0]?.id || null;
  saveState();
  render();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bookclips-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll('"', "&quot;");
}

$("addBookBtn").onclick = addBook;
$("imageInput").onchange = handleImageUpload;
$("ocrCropBtn").onclick = () => runOcr(true);
$("ocrFullBtn").onclick = () => runOcr(false);
$("clearSelectionBtn").onclick = clearSelection;
$("splitBtn").onclick = splitSentences;
$("saveSelectedTextBtn").onclick = saveSelectedText;
$("deleteBookBtn").onclick = deleteBook;
$("exportBtn").onclick = exportJson;
$("searchInput").oninput = renderClips;

const stage = $("imageStage");
stage.addEventListener("mousedown", startSelection);
stage.addEventListener("mousemove", moveSelection);
window.addEventListener("mouseup", endSelection);

stage.addEventListener("touchstart", startSelection, { passive: false });
stage.addEventListener("touchmove", moveSelection, { passive: false });
stage.addEventListener("touchend", endSelection);

render();
