// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
const overlay = document.getElementById('over');
const dialog = document.getElementById('dialog');
dialog.name = document.querySelector('#dialog h1');
dialog.container = document.querySelector('#dialog .container');
dialog.options = document.querySelector('#dialog .options');

dialog.show = function () {
  this.releaseToken = (this.releaseToken || 0) + 1;
  this.classList.remove('reeo-whats-new');
  this.container.innerHTML = '';
  this.options.innerHTML = '';
  hoverBalloon.style.display = 'none';

  overlay.style.display = 'block';
  overlay.style.pointerEvents = 'auto';
  setTimeout(() => (overlay.style.opacity = 0.8), 10);

  dialog.style.display = 'block';
  dialog.style.opacity = 1;
  dialog.style.transform = 'scale(1)';
  dialog.style.top = '16%';
  overlay.style.opacity = 0.8;
  dialog.focus();
};

dialog.hide = function () {
  overlay.style.opacity = 0;
  overlay.style.pointerEvents = 'none';
  overlay.style.display = 'none';
  dialog.style.opacity = 0;
  dialog.style.display = 'none';
  c.focus();
};

dialog.addOption = function (text, onclick) {
  const button = document.createElement('button');
  button.innerHTML = text;
  button.onclick = () => {
    dialog.hide();
    if (onclick) onclick();
  };
  dialog.options.appendChild(button);
};

dialog.onkeydown = function (e) {
  if (e.which == 13) {
    // Enter
    if (e.target.tagName !== 'BUTTON') dialog.options.lastElementChild?.click();
  } else if (e.which == 27) {
    // Esc.
    this.hide();
  }
};

dialog.welcome = function (component) {
  dialog.show();
  dialog.name.innerHTML = 'Welcome';

  dialog.container.innerHTML +=
    "<img class='reeo-brand-icon' src='brand/reeo-mark.svg' alt='REEO'>";
  dialog.container.innerHTML +=
    "<p>Welcome to <span style='font-family: Righteous; font-size: 24px;'>REEO</span> !</p>";
  dialog.container.innerHTML += "<p>If i'm right this is the first time you are using REEO.</p>";
  dialog.container.innerHTML += '<p>Need a tutorial to learn how everything works?</p>';
  dialog.addOption('Yes please!', () => tutorial.show());
  dialog.addOption('No, just start');
};

dialog.createBoard = function () {
  dialog.show();
  dialog.name.innerHTML = 'Create save file';

  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 120px'>save<i>";
  dialog.container.innerHTML +=
    "<p>This board doesn't have a save file yet. Want to create one?</p>";

  dialog.container.appendChild(document.createTextNode('Name: '));
  const name = document.createElement('input');
  dialog.container.appendChild(name);
  setTimeout(() => name.focus(), 10);

  dialog.addOption('Cancel');
  dialog.addOption('OK', () => {
    createSaveFile(name.value);
  });
};

dialog.editBoard = function (save) {
  dialog.show();
  dialog.name.innerHTML = 'Edit board';

  dialog.container.appendChild(document.createTextNode('Board name: '));
  const boardName = document.createElement('input');
  boardName.value = save.name;
  dialog.container.appendChild(boardName);
  setTimeout(() => boardName.focus(), 10);
  dialog.container.appendChild(document.createElement('br'));

  dialog.container.appendChild(document.createTextNode('File name: '));
  const fileName = document.createElement('input');
  fileName.value = save.fileName.slice(0, save.fileName.indexOf('.board'));
  dialog.container.appendChild(fileName);
  dialog.container.appendChild(document.createTextNode('.board'));

  dialog.addOption('Cancel');
  dialog.addOption('OK', () => {
    if (
      boardName.value != save.name &&
      boardName.value.length > 0 &&
      boardName.value.length < 100
    ) {
      save.name = boardName.value;

      const content = JSON.parse(fs.readFileSync(savesFolder + save.fileName));
      content.name = boardName.value;
      fs.writeFile(savesFolder + save.fileName, JSON.stringify(content), 'utf-8');
    }

    if (fileName.value + '.board' != save.fileName) {
      const newFileName = createFileName(fileName.value);
      fs.rename(savesFolder + save.fileName, savesFolder + newFileName);
      save.fileName = newFileName;
    }

    openBoardMenu.onopen();
  });
};

dialog.releaseNotes = function (release) {
  const sections = window.reeoRelease.sections(release);
  dialog.container.replaceChildren();

  const version = document.createElement('p');
  version.className = 'reeo-release-version';
  version.setAttribute('data-no-i18n', '');
  const tag = release.tagName.startsWith('v') ? release.tagName : 'v' + release.tagName;
  version.textContent = 'REEO ' + tag;
  dialog.container.appendChild(version);

  if (release.publishedAt) {
    const date = new Date(release.publishedAt);
    if (!Number.isNaN(date.getTime())) {
      const published = document.createElement('p');
      published.className = 'reeo-release-meta';
      published.setAttribute('data-no-i18n', '');
      published.textContent = 'Published ' + date.toLocaleDateString();
      dialog.container.appendChild(published);
    }
  }

  if (!sections.length) {
    const empty = document.createElement('p');
    empty.textContent = 'Release notes are not available right now.';
    dialog.container.appendChild(empty);
  }

  for (const section of sections) {
    const heading = document.createElement('p');
    heading.className = 'reeo-release-section';
    heading.setAttribute('data-no-i18n', '');
    heading.dir = 'ltr';
    heading.textContent = section.title;
    const changes = document.createElement('ul');
    changes.dir = 'ltr';
    for (const text of section.items) {
      const item = document.createElement('li');
      item.setAttribute('data-no-i18n', '');
      item.textContent = text;
      changes.appendChild(item);
    }
    dialog.container.append(heading, changes);
  }

  const source = document.createElement('a');
  source.className = 'reeo-release-source';
  source.href = release.url;
  source.target = '_blank';
  source.rel = 'noreferrer';
  source.setAttribute('data-no-i18n', '');
  source.textContent =
    release.source === 'fallback' ? 'View releases on GitHub' : 'View this release on GitHub';
  dialog.container.appendChild(source);
};

dialog.update = function () {
  dialog.show();
  dialog.classList.add('reeo-whats-new');
  dialog.name.textContent = "What's new";
  if (!window.reeoRelease) {
    const error = document.createElement('p');
    error.textContent = 'Release notes are not available in this build.';
    dialog.container.appendChild(error);
    dialog.addOption('Close');
    return;
  }

  const token = dialog.releaseToken;
  dialog.releaseNotes(window.reeoRelease.current());
  dialog.addOption('Close');

  window.reeoRelease
    .refresh()
    .then((release) => {
      if (dialog.releaseToken !== token || !dialog.classList.contains('reeo-whats-new')) return;
      dialog.releaseNotes(release);
    })
    .catch(() => {});
};

dialog.openBoard = function () {
  dialog.show();
  dialog.name.innerHTML = 'Open board';

  dialog.container.innerHTML +=
    "<i class='material-icons' style='font-size: 60px'>insert_drive_file<i>";

  const openboard = document.getElementById('openboard').cloneNode(true);
  openboard.style.display = 'block';
  dialog.container.appendChild(openboard);

  dialog.addOption('Cancel');
};

dialog.connectToServer = function () {
  dialog.show();
  dialog.name.innerHTML = 'Connect to server';

  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>dns<i>";

  dialog.container.innerHTML += '<p>There are no public servers available.</p>';

  dialog.container.appendChild(document.createTextNode('Server URL: '));
  const url = document.createElement('input');
  dialog.container.appendChild(url);
  setTimeout(() => url.focus(), 10);
  dialog.container.appendChild(document.createElement('br'));

  const msg = document.createElement('p');
  msg.show = function (text) {
    this.innerHTML = text;
    this.style.opacity = 1;
  };
  dialog.container.appendChild(msg);

  dialog.addOption('Cancel');
  dialog.addOption('Connect', function () {
    msg.show('Connecting...');
    connectToSocket(url.value, (connected) => {
      if (connected) {
        dialog.hide();
      } else {
        msg.className = 'errormsg';
        msg.show("Could not connect to '" + url.value + "'");
      }
    });
    this.onmouseup = () => undefined;
  });
};
