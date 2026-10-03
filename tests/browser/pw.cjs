// Use a local Playwright install if present, otherwise the one preinstalled in the dev container.
let pw;
try { pw = require('playwright'); } catch (e) { pw = require('/opt/node-tools/node_modules/playwright'); }
module.exports = pw;
