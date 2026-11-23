import { fitGhost, setGhost, toggleGhost } from '../ghosts';
import { button, node, text } from './dom';
import { labels } from './labels';
import { state } from './state';

export function renderDock() {
  state.dock.replaceChildren();
  const recipe = state.activeRecipe;
  const activeStep = recipe?.steps[state.step];
  if (!recipe || !activeStep) return;
  state.dock.append(
    node('strong', `${text(recipe.title)} · ${state.step + 1}/${recipe.steps.length}`),
    node('p', text(activeStep)),
  );
  const ghost = button(['Hide ghost', 'إخفاء المخطط', 'اخفي الرسم'], () => {
    const visible = toggleGhost();
    ghost.textContent = text(
      visible
        ? ['Hide ghost', 'إخفاء المخطط', 'اخفي الرسم']
        : ['Show ghost', 'إظهار المخطط', 'ورّي الرسم'],
    );
  });
  state.dock.append(ghost, button(['Fit guide', 'احتواء المخطط', 'اعرض الرسم كله'], fitGhost));
  const actions = node('div');
  const previous = button(labels.previous, () => {
    state.step--;
    renderDock();
  });
  previous.disabled = state.step === 0;
  actions.append(
    previous,
    button(state.step === recipe.steps.length - 1 ? labels.finish : labels.next, () => {
      if (state.step === recipe.steps.length - 1) {
        state.dock.hidden = true;
        setGhost(undefined);
      } else {
        state.step++;
        renderDock();
      }
    }),
    button(labels.close, () => {
      state.dock.hidden = true;
      setGhost(undefined);
    }),
  );
  state.dock.append(actions);
}
