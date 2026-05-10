const STORAGE_KEY = "bookclips.v1";

let state = loadState();
let activeBookId = state.books[0]?.id || null;

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

async function runOcr() {
  const file = $("imageInput").files[0];
  if (!file) return alert("请先选择或拍摄一张书页照片");

  $("ocrStatus").textContent = "正在识别文字，第一次使用可能稍慢……";
  $("ocrBtn").disabled = true;

  try {
    const result = await Tesseract.recognize(file, "chi_sim+eng", {
      logger: m => {
        if (m.status) {
          const pct = m.progress ? ` ${Math.round(m.progress * 100)}%` : "";
          $("ocrStatus").textContent = `${m.status}${pct}`;
        }
      }
    });
    $("ocrText").value = result.data.text.trim();
    $("ocrStatus").textContent = "识别完成。你可以编辑文字，或自动分句。";
  } catch (e) {
    console.error(e);
    $("ocrStatus").textContent = "识别失败。可以换一张更清晰的照片，或手动粘贴文字。";
  } finally {
    $("ocrBtn").disabled = false;
  }
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
$("ocrBtn").onclick = runOcr;
$("splitBtn").onclick = splitSentences;
$("saveSelectedTextBtn").onclick = saveSelectedText;
$("deleteBookBtn").onclick = deleteBook;
$("exportBtn").onclick = exportJson;
$("searchInput").oninput = renderClips;

render();
