// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
(function () {
  const input = document.querySelector('.new-board #boardname');
  const filename = document.querySelector('.new-board #filename');
  input.onfocus = () => (filename.style.opacity = 1);
  input.onblur = () => (filename.style.opacity = 0);

  input.oninput = () => {
    setTimeout(() => {
      const name = createFileName(input.value);

      if (name != input.value + '.board') {
        filename.innerHTML = 'This board will be saved as ' + name;
        filename.style.opacity = 1;
      } else filename.style.opacity = 0;
    });
  };
})();
