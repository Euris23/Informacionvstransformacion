// script.js – Handles slide navigation, content injection, animations, and interactivity

// Utility to fetch JSON data
async function loadSlides() {
  const resp = await fetch('data/slides.json');
  if (!resp.ok) throw new Error('Failed to load slides data');
  const data = await resp.json();
  return data.slides;
}

// Global state
let slides = [];
let currentIndex = 0;

// DOM references
const contentDiv = document.getElementById('content');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn'); // may not exist in HTML yet; create if needed
const progressSpan = document.createElement('span');
progressSpan.id = 'progress-step';
progressSpan.className = 'progress-indicator';
document.body.appendChild(progressSpan);

// Road background handling – move background to give forward motion effect
function updateRoad() {
  const road = document.getElementById('background');
  if (!road) return;
  // Translate Y based on slide index (simple linear progression)
  const offset = currentIndex * 15; // adjust pixel per slide
  road.style.transform = `translateY(-${offset}px)`;
}

// Tree stage handling – replace tree image according to slide visual state
function updateTree(stage) {
  // Remove existing tree image if any
  const existing = document.getElementById('tree-stage');
  if (existing) existing.remove();

  if (!stage) return; // no tree for this slide

  const img = document.createElement('img');
  img.id = 'tree-stage';
  img.alt = 'Tree stage';
  // Map stage names to generated asset paths
  const stageMap = {
    seed: 'file:///C:/Users/Eurisja/.gemini/antigravity/brain/9fb03c57-b45b-48af-8e11-6c061dd5fe87/tree_seed_1781028641104.png',
    sprout: 'file:///C:/Users/Eurisja/.gemini/antigravity/brain/9fb03c57-b45b-48af-8e11-6c061dd5fe87/tree_sprout_1781028658724.png',
    young: 'file:///C:/Users/Eurisja/.gemini/antigravity/brain/9fb03c57-b45b-48af-8e11-6c061dd5fe87/tree_young_1781028703536.png',
    fruit: 'file:///C:/Users/Eurisja/.gemini/antigravity/brain/9fb03c57-b45b-48af-8e11-6c061dd5fe87/tree_young_1781028703536.png' // reuse young for fruit visually; replace later if needed
  };
  img.src = stageMap[stage] || '';
  img.style.maxWidth = '200px';
  img.style.display = 'block';
  img.style.margin = '0 auto';
  contentDiv.prepend(img);
}

// Progress indicator update (🧠 ➜ ❤️ ➜ 🍇)
function updateProgress(step) {
  const icons = { info: '🧠', transform: '❤️', fruit: '🍇' };
  progressSpan.textContent = icons[step] || '';
}

// Render slide content based on its type
function renderSlide(slide) {
  // Clear previous content (except persistent tree handled separately)
  contentDiv.innerHTML = '';

  // Tree stage first (if any)
  if (slide.visual && slide.visual.treeStage) {
    updateTree(slide.visual.treeStage);
  }

  // Title
  if (slide.title) {
    const h2 = document.createElement('h2');
    h2.textContent = slide.title;
    contentDiv.appendChild(h2);
  }

  // Subtitle
  if (slide.subtitle) {
    const h3 = document.createElement('h3');
    h3.textContent = slide.subtitle;
    contentDiv.appendChild(h3);
  }

  // Content (HTML string)
  if (slide.content) {
    const div = document.createElement('div');
    div.innerHTML = slide.content;
    contentDiv.appendChild(div);
  }

  // Question card (interactive)
  if (slide.question) {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = slide.question;
    card.addEventListener('click', () => {
      // Reveal answer if present in next slide or same slide answer field
      const answer = slide.answer || slide.content; // fallback
      if (answer) {
        const ansDiv = document.createElement('div');
        ansDiv.className = 'answer';
        ansDiv.innerHTML = typeof answer === 'string' ? answer : '';
        card.appendChild(ansDiv);
        ansDiv.style.display = 'block';
      }
    });
    contentDiv.appendChild(card);
  }

  // Verse split (if provided)
  if (slide.verse) {
    const verseCard = document.createElement('div');
    verseCard.className = 'verse-card';
    slide.verse.parts.forEach(part => {
      const partDiv = document.createElement('div');
      partDiv.className = 'verse-part';
      partDiv.classList.add(part.color === 'info' ? 'red-part' : 'green-part');
      partDiv.textContent = part.text;
      verseCard.appendChild(partDiv);
    });
    contentDiv.appendChild(verseCard);
  }

  // Multiple verses array
  if (slide.verses) {
    slide.verses.forEach(v => {
      const verseDiv = document.createElement('div');
      verseDiv.className = 'verse-card';
      const left = document.createElement('div');
      left.className = 'verse-part red-part';
      left.textContent = v.ref ? `${v.ref}: ${v.text}` : v.text;
      verseDiv.appendChild(left);
      contentDiv.appendChild(verseDiv);
    });
  }

  // Table comparison (dynamic building)
  if (slide.table) {
    const table = document.createElement('table');
    table.className = 'table-comparison';
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    slide.table.headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    slide.table.rows.forEach(row => {
      const tr = document.createElement('tr');
      // Detect completed rows (marked with ~~ and ✔ in the data)
      const isCompleted = row[0].includes('✔') || row[1].includes('✔');
      if (isCompleted) tr.classList.add('completed');
      row.forEach(cell => {
        const td = document.createElement('td');
        // Strip markdown styling like ~~ and ✔ for display
        const clean = cell.replace(/~~/g, '').replace(/✔/g, '').trim();
        td.textContent = clean;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    contentDiv.appendChild(table);
  }

  // Update progress indicator based on visual.progress if present
  if (slide.visual && slide.visual.progress) {
    updateProgress(slide.visual.progress);
  }

  // Update road movement
  updateRoad();
}

// Navigation handlers
function goNext() {
  if (currentIndex < slides.length - 1) {
    currentIndex++;
    renderSlide(slides[currentIndex]);
    updateNavButtons();
  }
}

function goPrev() {
  if (currentIndex > 0) {
    currentIndex--;
    renderSlide(slides[currentIndex]);
    updateNavButtons();
  }
}

function updateNavButtons() {
  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.disabled = currentIndex === slides.length - 1;
}

// Initialize app
(async () => {
  try {
    slides = await loadSlides();
  } catch (err) {
    console.warn('Fetch failed, trying inline data');
    if (window.SLIDES && window.SLIDES.slides) {
      slides = window.SLIDES.slides;
    } else {
      console.error('No slide data available');
      contentDiv.textContent = 'Error loading presentation.';
      return;
    }
  }
  renderSlide(slides[0]);
  updateNavButtons();
  nextBtn.addEventListener('click', goNext);
  if (prevBtn) prevBtn.addEventListener('click', goPrev);
  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') goNext();
    else if (e.key === 'ArrowLeft') goPrev();
  });
})();
