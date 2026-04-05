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
const nmPaths = [
    path.join(rootDir, 'node_modules/react-native/ReactCommon/react/renderer/core/graphicsConversions.h'),
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

    function walkDir(dir, depth = 0) {
        if (depth > 20) return; 
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                try {
                    const stats = fs.lstatSync(fullPath);
                    if (stats.isDirectory()) {
                        // Skip some known huge non-transform folders to speed up
                        if (['modules-2', 'jars-9', 'build-cache-1', 'notifications'].includes(file)) continue;
                        
                        // If we find a transforms directory, search it deeply
                        if (file === 'transforms') {
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
