const fs = require('fs');
const path = require('path');
const os = require('os');

function patchFile(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Fix std::format in graphicsConversions.h
            if (content.includes('std::format("{}%", dimension.value)')) {
                console.log(`Patching std::format in: ${filePath}`);
                content = content.replace('std::format("{}%", dimension.value)', 'std::to_string(dimension.value) + "%"');
                modified = true;
            }

            // Fix any other std::format uses that might break compilation on old NDKs/SDKs
            // (Add more if needed)

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                return true;
            }
        } catch (e) {
            console.error(`Failed to patch ${filePath}: ${e.message}`);
        }
    }
    return false;
}

console.log("Starting React Native header patch script...");

// 1. Patch node_modules
const nmPath = path.join(__dirname, 'node_modules/react-native/ReactCommon/react/renderer/core/graphicsConversions.h');
if (patchFile(nmPath)) {
    console.log("Successfully patched node_modules version.");
} else {
    console.log("node_modules version already patched or not found.");
}

// 2. Patch Gradle cache for prefab headers
const homeDir = os.homedir();
const cacheBase = path.join(homeDir, '.gradle/caches');

if (fs.existsSync(cacheBase)) {
    console.log(`Searching for headers in Gradle cache: ${cacheBase}`);

    function walkDir(dir) {
        try {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                try {
                    const stats = fs.lstatSync(fullPath);
                    if (stats.isDirectory()) {
                        walkDir(fullPath);
                    } else if (file === 'graphicsConversions.h' && (fullPath.includes('react-android-0.81.5') || fullPath.includes('reactnative'))) {
                        patchFile(fullPath);
                    }
                } catch (e) {
                    // Skip files that can't be accessed
                }
            }
        } catch (e) {
            // Skip directories that can't be accessed
        }
    }
    walkDir(cacheBase);
}

console.log("Header patch script completed.");
