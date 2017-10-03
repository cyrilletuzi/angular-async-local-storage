const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const PATH_DIST = path.resolve(ROOT, 'dist', 'package.json');
const PKG_DIST = JSON.parse(fs.readFileSync(PATH_DIST));
const PKG_ROOT = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'package.json')));

const MERGED = Object.assign(PKG_ROOT, PKG_DIST);

fs.writeFileSync(PATH_DIST, JSON.stringify(MERGED, undefined, 2), { encoding: 'utf8'});
