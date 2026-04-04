const fs = require('fs');
const path = require('path');
const os = require('os');

function patchFile(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Log that we are examining the file
            console.log(`Examining: ${filePath}`);

            // Fix std::format in graphicsConversions.h
            // Using regex to be more flexible with whitespace
            const formatRegex = /std::format\s*\(\s*"\{\}%"\s*,\s*dimension\.value\s*\)/g;
            if (formatRegex.test(content)) {
                console.log(`Match found! Patching std::format in: ${filePath}`);
                content = content.replace(formatRegex, '(folly::to<std::string>(dimension.value) + "%")');
                modified = true;
            }

            // Fallback for more general std::format if it's really stuck
            // return std::format("{}%", dimension.value);
            if (!modified && content.includes('std::format("{}%", dimension.value)')) {
                console.log(`Manual match found! Patching in: ${filePath}`);
                content = content.replace('std::format("{}%", dimension.value)', '(folly::to<std::string>(dimension.value) + "%")');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`SUCCESS: Patched ${filePath}`);
                return true;
            } else {
                console.log(`No match in: ${filePath}`);
            }
        } catch (e) {
            console.error(`ERROR: Failed to patch ${filePath}: ${e.message}`);
        }
    }
    return false;
}

console.log("Starting React Native header patch script...");

// 1. Patch node_modules
const nmPaths = [
    path.join(__dirname, 'node_modules/react-native/ReactCommon/react/renderer/core/graphicsConversions.h'),
    path.join(__dirname, 'node_modules/react-native/ReactAndroid/src/main/jni/react/renderer/core/graphicsConversions.h')
];

nmPaths.forEach(p => {
    if (patchFile(p)) {
        console.log(`Successfully patched node_modules version: ${p}`);
    }
});

// 2. Patch Gradle cache for prefab headers
const homeDir = os.homedir();
const cacheBase = path.join(homeDir, '.gradle/caches');

if (fs.existsSync(cacheBase)) {
    console.log(`Searching for headers in Gradle cache: ${cacheBase}`);

    function scanTransforms(baseDir) {
        if (!fs.existsSync(baseDir)) return;
        try {
            const entries = fs.readdirSync(baseDir);
            for (const entry of entries) {
                const entryPath = path.join(baseDir, entry);
                try {
                    const stats = fs.lstatSync(entryPath);
                    if (stats.isDirectory()) {
                        if (entry === 'transforms') {
                            console.log(`Scanning transforms dir: ${entryPath}`);
                            walkDir(entryPath);
                        } else if (!['modules-2', 'jars-9', 'build-cache-1'].includes(entry)) {
                            scanTransforms(entryPath);
                        }
                    }
                } catch (e) { }
            }
        } catch (e) { }
    }

    function walkDir(dir, depth = 0) {
        if (depth > 20) return;
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                try {
                    const stats = fs.lstatSync(fullPath);
                    if (stats.isDirectory()) {
                        walkDir(fullPath, depth + 1);
                    } else if (file === 'graphicsConversions.h') {
                        patchFile(fullPath);
                    }
                } catch (e) { }
            }
        } catch (e) { }
    }

    // Scan all subdirectories (like 8.14.3) for 'transforms' folders
    scanTransforms(cacheBase);
}

console.log("Header patch script completed.");
