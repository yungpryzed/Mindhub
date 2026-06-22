let domRef = null;
let showRecipeRef = null;

export const initRecipes = ({ dom, showRecipe }) => {
  domRef = dom;
  showRecipeRef = showRecipe;
};

export const renderRecipe = (item) => {
  if (!domRef || !showRecipeRef) return;
  domRef.recipeTitle.textContent = item.title || "Ricetta";
  domRef.recipeIngredients.innerHTML = "";
  domRef.recipeSteps.innerHTML = "";

  const ingredients = Array.isArray(item.payload?.ingredients)
    ? item.payload.ingredients
    : [];
  const steps = Array.isArray(item.payload?.steps) ? item.payload.steps : [];

  ingredients.forEach((ing) => {
    const li = document.createElement("li");
    li.className = "list-group-item px-0";
    if (typeof ing === "string") {
      li.textContent = ing;
    } else {
      const name = ing?.name || "";
      const qty = ing?.qty || ing?.quantity || "";
      li.textContent = `${name} ${qty}`.trim();
    }
    domRef.recipeIngredients.appendChild(li);
  });

  steps.forEach((step) => {
    const row = document.createElement("div");
    row.className = "list-group-item d-flex align-items-start gap-2 px-0";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input mt-1";

    const text = document.createElement("span");
    text.textContent = typeof step === "string" ? step : step?.text || "";

    checkbox.addEventListener("change", () => {
      text.classList.toggle("text-decoration-line-through", checkbox.checked);
    });

    row.appendChild(checkbox);
    row.appendChild(text);
    domRef.recipeSteps.appendChild(row);
  });

  showRecipeRef();
};
