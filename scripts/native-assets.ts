import { copyFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const source = 'assets/native';
const android = 'android/app/src/main/res';
const ios = 'ios/App/App/Assets.xcassets';
// Checked-in raster sizes avoid adding a heavyweight image toolchain to every Bun install.
if (existsSync(android)) {
  for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    const target = join(android, `mipmap-${density}`);
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png'])
      copyFileSync(join(source, `icon-${density}.png`), join(target, name));
    copyFileSync(
      join(source, `foreground-${density}.png`),
      join(target, 'ic_launcher_foreground.png'),
    );
  }
  for (const directory of readdirSync(android)) {
    const target = join(android, directory, 'splash.png');
    if (directory.startsWith('drawable') && existsSync(target))
      copyFileSync(join(source, 'splash.png'), target);
  }
  writeFileSync(
    join(android, 'values/ic_launcher_background.xml'),
    '<resources><color name="ic_launcher_background">#111111</color></resources>\n',
  );
  writeFileSync(
    join(android, 'drawable/ic_launcher_background.xml'),
    '<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle"><solid android:color="#111111"/></shape>\n',
  );
  console.log('REEO Android launcher and splash assets applied.');
}
if (existsSync(ios)) {
  copyFileSync(join(source, 'icon-1024.png'), join(ios, 'AppIcon.appiconset/AppIcon-512@2x.png'));
  for (const file of readdirSync(join(ios, 'Splash.imageset')))
    if (file.endsWith('.png'))
      copyFileSync(join(source, 'splash.png'), join(ios, 'Splash.imageset', file));
  console.log('REEO iOS app icon and splash assets applied.');
}
