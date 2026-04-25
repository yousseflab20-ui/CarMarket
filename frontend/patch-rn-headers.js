const fs = require('fs');
const path = require('path');
const os = require('os');

function patchFile(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Fix std::format in graphicsConversions.h
            // return std::format("{}%", dimension.value);
            const formatRegex = /std::format\s*\(\s*"\{\}%"\s*,\s*dimension\.value\s*\)/g;
            if (formatRegex.test(content)) {
                console.log(`Patching std::format in: ${filePath}`);
                content = content.replace(formatRegex, '(folly::to<std::string>(dimension.value) + "%")');
                modified = true;
            }

            // Fallback for more general std::format if it's really stuck
            if (!modified && content.includes('std::format("{}%", dimension.value)')) {
                console.log(`Manual match found! Patching in: ${filePath}`);
                content = content.replace('std::format("{}%", dimension.value)', '(folly::to<std::string>(dimension.value) + "%")');
                modified = true;
            }

            if (modified) {
                // Ensure folly/Conv.h is included if we use folly::to
                if (content.includes('folly::to<std::string>') && !content.includes('folly/Conv.h')) {
                    content = content.replace('#include <glog/logging.h>', '#include <glog/logging.h>\n#include <folly/Conv.h>');
                }
                fs.writeFileSync(filePath, content, 'utf8');
                return true;
            }
        } catch (e) {
            console.error(`ERROR: Failed to patch ${filePath}: ${e.message}`);
        }
    }
    return false;
}

console.log("Starting React Native header patch script...");

// 1. Patch node_modules
const rootDir = __dirname;
const possibleNMPaths = [
    path.join(rootDir, 'node_modules'),
    path.join(rootDir, '..', 'node_modules'),
];

possibleNMPaths.forEach(nm => {
    const p = path.join(nm, 'react-native/ReactCommon/react/renderer/core/graphicsConversions.h');
    if (patchFile(p)) {
        console.log(`Successfully patched: ${p}`);
    }
});

// 2. Patch Gradle cache for prefab headers
const homeDir = os.homedir();
const cacheBase = path.join(homeDir, '.gradle/caches');

if (fs.existsSync(cacheBase)) {
    console.log(`Searching for headers in Gradle cache: ${cacheBase}`);

    function walkDir(dir, depth = 0) {
        if (depth > 25) return; 
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                try {
                    const stats = fs.lstatSync(fullPath);
                    if (stats.isDirectory()) {
                        // Search for 'transforms' or 'transformed'
                        if (file === 'transforms' || file === 'transformed') {
                            walkDirSearch(fullPath);
                        } else {
                            walkDir(fullPath, depth + 1);
                        }
                    }
                } catch (e) { }
            }
        } catch (e) { }
    }

    function walkDirSearch(dir, depth = 0) {
        if (depth > 15) return;
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                try {
                    const stats = fs.lstatSync(fullPath);
                    if (stats.isDirectory()) {
                        walkDirSearch(fullPath, depth + 1);
                    } else if (file === 'graphicsConversions.h') {
                        if (patchFile(fullPath)) {
                            console.log(`SUCCESS: Patched ${fullPath}`);
                        }
                    }
                } catch (e) { }
            }
        } catch (e) { }
    }
    
    walkDir(cacheBase);
}

console.log("Header patch script completed.");

