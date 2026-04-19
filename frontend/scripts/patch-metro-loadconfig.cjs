const fs = require('fs');
const path = require('path');

/**
 * Patch all instances of metro-config to support Windows absolute paths in import().
 * Use require("url").pathToFileURL — @expo/metro's nested metro-config omits `var _url = require("url")`,
 * so patched code that referenced _url throws ReferenceError: _url is not defined.
 */
function patchFile(target) {
    if (!fs.existsSync(target)) return;

    let s = fs.readFileSync(target, 'utf8');
    const original = s;

    const needle = `        const configModule = await import(
          path.isAbsolute(absolutePath)
            ? (0, _url.pathToFileURL)(absolutePath).toString()
            : absolutePath
        );`;

    const needleSimple = `        const configModule = await import(absolutePath);`;

    const replacement = `        const resolvedForImport = path.resolve(absolutePath);
        const configModule = await import(
          require("url").pathToFileURL(resolvedForImport).toString()
        );`;

    if (s.includes(needle)) {
        s = s.replace(needle, replacement);
    } else if (s.includes(needleSimple)) {
        s = s.replace(needleSimple, replacement);
    }

    // Fix nested metro-config that was patched with _url but never defines it
    s = s.replace(
        /\(0, _url\.pathToFileURL\)\(([^)]+)\)/g,
        'require("url").pathToFileURL($1)',
    );

    if (s !== original) {
        fs.writeFileSync(target, s, 'utf8');
        console.log(`[patch-metro-loadconfig] Patched: ${target}`);
    } else if (
        s.includes('resolvedForImport') &&
        s.includes('pathToFileURL(resolvedForImport)')
    ) {
        console.log(`[patch-metro-loadconfig] Already patched: ${target}`);
    } else {
        console.warn(`[patch-metro-loadconfig] Pattern not found in: ${target}`);
    }
}

function findAndPatch(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file === 'node_modules') {
                findInNodeModules(fullPath);
            } else {
                findAndPatch(fullPath);
            }
        }
    }
}

function findInNodeModules(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const itemPath = path.join(dir, item);
        if (item === 'metro-config') {
            const loadConfigPath = path.join(itemPath, 'src/loadConfig.js');
            patchFile(loadConfigPath);
        } else if (fs.statSync(itemPath).isDirectory()) {
            // Recurse into scoped packages or other directories
            findInNodeModules(itemPath);
        }
    }
}

const nodeModulesRoot = path.join(__dirname, '../node_modules');
if (fs.existsSync(nodeModulesRoot)) {
    findInNodeModules(nodeModulesRoot);
} else {
    console.error('node_modules folder not found!');
}
