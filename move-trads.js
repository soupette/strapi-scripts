'use strict';

const { join } = require('path');
const { promisify } = require('util');
const fs = require('fs-extra');
const glob = promisify(require('glob').glob);

const copyFile = async (entry) => {
  try {
    const locale = entry.split('/').splice(-1, 1)[0];
    const dest = join('packages', 'core', 'admin', 'admin', 'src', 'translations', locale);
    const cmLocaleContentJSON = await fs.readJSON(entry);
    const adminLocaleContentJSON = await fs.readJSON(dest);

    const prefixedContent = Object.keys(cmLocaleContentJSON).reduce((acc, current) => {
      acc['content-manager.' + current] = cmLocaleContentJSON[current];

      return acc;
    }, {});

    const merged = { ...adminLocaleContentJSON, ...prefixedContent };
    const reordered = Object.keys(merged)
      .sort()
      .reduce((acc, current) => {
        acc[current] = merged[current];

        return acc;
      }, {});

    await fs.writeJSON(dest, reordered, { spaces: 2 });

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
};

const run = async () => {
  const cmPath = ['packages', 'core', 'content-manager', 'admin', 'src', 'translations', '/*'];

  const entries = await glob(join(...cmPath));

  await Promise.all(entries.map(copyFile));
};

run();
