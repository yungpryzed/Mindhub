// Local debounce utility per i requisiti
const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const getIconForType = (type) => {
  switch (type) {
    case "box": return "bi-folder-fill";
    case "movie": return "bi-film";
    case "note": return "bi-file-earmark-text";
    case "todo_list": return "bi-check2-square";
    case "recipe": return "bi-egg-fried";
    default: return "bi-file-earmark";
  }
};

const findDeepMatch = (item, lowerCaseQuery) => {
  const payload = item.payload;
  if (typeof payload !== 'object' || payload === null) {
    return { isMatch: false, context: null };
  }

  switch (item.type) {
    case 'note':
      if (payload.content?.toLowerCase().includes(lowerCaseQuery)) {
        return { isMatch: true, context: "Trovato nel testo della nota" };
      }
      break;

    case 'todo_list':
      if (Array.isArray(payload.items)) {
        const foundTask = payload.items.find(task => task.text?.toLowerCase().includes(lowerCaseQuery));
        if (foundTask) {
          return { isMatch: true, context: `Include il task: "${foundTask.text}"` };
        }
      }
      break;

    case 'recipe':
      if (typeof payload.ingredients === 'string' && payload.ingredients.toLowerCase().includes(lowerCaseQuery)) {
        return { isMatch: true, context: "Trovato negli ingredienti" };
      }
      if (Array.isArray(payload.ingredients) && payload.ingredients.some(ing => typeof ing === 'string' && ing.toLowerCase().includes(lowerCaseQuery))) {
        return { isMatch: true, context: "Trovato negli ingredienti" };
      }
      const steps = payload.instructions || payload.steps;
      if (typeof steps === 'string' && steps.toLowerCase().includes(lowerCaseQuery)) {
        return { isMatch: true, context: "Trovato nella preparazione" };
      }
      if (Array.isArray(steps) && steps.some(step => typeof step === 'string' && step.toLowerCase().includes(lowerCaseQuery))) {
        return { isMatch: true, context: "Trovato nella preparazione" };
      }
      break;

    case 'movie':
      const description = payload.overview || payload.description;
      if (description?.toLowerCase().includes(lowerCaseQuery)) {
        return { isMatch: true, context: "Trovato nella trama del film" };
      }
      break;
  }

  return { isMatch: false, context: null };
};


const showResults = (dom) => {
  if (!dom.searchResults || !dom.searchModal) return;
  dom.searchResults.classList.remove("hidden");
  dom.searchModal.classList.add("is-focused");
};

const hideResults = (dom) => {
  if (!dom.searchResults || !dom.searchModal) return;
  dom.searchResults.classList.add("hidden");
  dom.searchModal.classList.remove("is-focused");
};

const renderResults = (results, { dom, onResultClick }) => {
  if (!dom.searchResults) return;
  dom.searchResults.innerHTML = "";

  if (!results || !results.length) {
    dom.searchResults.innerHTML = '<p class="text-center text-secondary small p-3">Nessun risultato</p>';
    return;
  }

  results.forEach(({ item, matchContext }) => {
    const resultEl = document.createElement("div");
    resultEl.className = "result-item";
    resultEl.dataset.id = item.id;

    const contextHTML = matchContext 
      ? `<span class="result-item-context">${matchContext}</span>`
      : "";

    let visualHTML = '';
    const posterPath = item.payload?.poster_path;
    const mediaType = item.payload?.media_type || 'movie';

    if (item.type === 'movie' && posterPath) {
        let badgeText = mediaType === 'tv' ? "Serie TV / Anime" : "Film";
        let rating = item.payload?.vote_average ? Number(item.payload.vote_average).toFixed(1) : "0.0";
        visualHTML = `
          <div class="position-relative d-inline-block">
            <img src="https://image.tmdb.org/t/p/w92${posterPath}" alt="poster" class="search-result-thumb">
            <div class="position-absolute d-flex flex-column gap-1" style="top: 4px; right: -12px;">
              <span class="glass-text" style="font-size: 0.55rem; padding: 0.2rem 0.4rem; white-space: nowrap;">${badgeText}</span>
              <span class="glass-text" style="font-size: 0.55rem; padding: 0.2rem 0.4rem; white-space: nowrap;"><i class="bi bi-star-fill" style="color: #F5C518;"></i> ${rating}</span>
            </div>
          </div>`;
    } else {
        visualHTML = `<div class="result-icon-wrapper"><i class="bi ${getIconForType(item.type)} result-item-icon"></i></div>`;
    }

    resultEl.innerHTML = `
      ${visualHTML}
      <div class="result-text-wrapper">
        <span class="result-item-label">${item.title || '(senza titolo)'}</span>
        ${contextHTML}
      </div>
    `;

    resultEl.addEventListener("click", () => {
      onResultClick(item);
      hideResults(dom);
      if (dom.searchInput) dom.searchInput.value = "";
    });
    dom.searchResults.appendChild(resultEl);
  });
};

export const initSearch = ({ dom, onResultClick, getCurrentContents }) => {
  if (!dom || !dom.searchInput || !dom.searchResults) return;
  dom.searchInput.placeholder = "Cerca note, film, serie TV, cartelle... (Ctrl+K)";

  let selectedIndex = -1;

  const updateSelection = () => {
    const items = dom.searchResults.querySelectorAll(".result-item");
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add("is-active");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("is-active");
      }
    });
  };

  const handleSearchInput = () => {
    selectedIndex = -1;
    const query = dom.searchInput.value.trim();
    const allContents = getCurrentContents();

    if (!query) {
      const initialResults = allContents.map(item => ({ item, matchContext: null }));
      renderResults(initialResults, { dom, onResultClick });
      showResults(dom);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();

    const scoredResults = allContents
      .map(item => {
        let score = 0;
        let matchContext = null;
        const lowerCaseTitle = (item.title || '').toLowerCase();

        const hasTitleMatch = lowerCaseTitle.includes(lowerCaseQuery);
        const startsWith = lowerCaseTitle.startsWith(lowerCaseQuery);

        if (startsWith) {
          score = 30;
        } else if (hasTitleMatch) {
          score = 20;
        }

        const deepMatch = findDeepMatch(item, lowerCaseQuery);
        if (deepMatch.isMatch) {
          if (score === 0) {
            score = 10;
          }
          matchContext = deepMatch.context;
        }

        if (score === 0) {
          return null;
        }

        if (item.type !== 'box') {
          score += 5;
        }

        return { item, score, matchContext };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    renderResults(scoredResults, { dom, onResultClick });
    showResults(dom);
  };

  const debouncedSearch = debounce(handleSearchInput, 250);

  dom.searchInput.addEventListener("input", debouncedSearch);
  dom.searchInput.addEventListener("focus", handleSearchInput);

  dom.searchInput.addEventListener("keydown", (e) => {
    const items = dom.searchResults.querySelectorAll(".result-item");
    if (dom.searchResults.classList.contains("hidden") || !items.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (selectedIndex < items.length - 1) {
          selectedIndex++;
        }
        updateSelection();
        break;
      case "ArrowUp":
        e.preventDefault();
        if (selectedIndex > 0) {
          selectedIndex--;
        }
        updateSelection();
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          items[selectedIndex].click();
        }
        break;
    }
  });

  document.addEventListener("click", (e) => {
    if (dom.searchModal && !dom.searchModal.contains(e.target)) {
      hideResults(dom);
    }
  });

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      dom.searchInput.focus();
      dom.searchInput.select();
    }

    if (e.key === "Escape") {
      if (dom.searchResults && !dom.searchResults.classList.contains("hidden")) {
        hideResults(dom);
        dom.searchInput.blur();
      }
    }
  });
};