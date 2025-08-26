//execute below command to remove unused resources from assets
//node find-unused-assets.js 

const fs = require('fs');
const path = require('path');
const readline = require('readline'); // For interactive input

const projectRoot = process.cwd(); // This will be your Angular project's root
const assetsDir = path.join(projectRoot, 'src', 'assets');
const srcDir = path.join(projectRoot, 'src'); // The entire src folder for scanning code references

// Define file extensions to search within for asset references in your code
const searchExtensions = ['.ts', '.html', '.scss', '.css'];

/**
 * Recursively gets all files in a directory that match the given extensions.
 * @param {string} dirPath The directory to scan.
 * @param {string[]} extensions An array of file extensions to include (e.g., ['.ts', '.html']). Use ['.*'] for all files.
 * @param {string[]} [arrayOfFiles] Internal array for recursion.
 * @returns {string[]} An array of absolute file paths.
 */
function getAllFilesByExtensions(dirPath, extensions, arrayOfFiles) {
    arrayOfFiles = arrayOfFiles || [];
    if (!fs.existsSync(dirPath)) {
        // console.warn(`Directory not found: ${dirPath}`); // Optional: for debugging
        return arrayOfFiles;
    }

    let files = fs.readdirSync(dirPath);

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        try {
            const stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                arrayOfFiles = getAllFilesByExtensions(fullPath, extensions, arrayOfFiles);
            } else {
                // Check if the file's extension is in the list of desired extensions
                // Or if '.*' is specified, include all files
                if (extensions.includes('.*') || extensions.some(ext => fullPath.endsWith(ext))) {
                    arrayOfFiles.push(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error accessing ${fullPath}: ${error.message}`);
        }
    });

    return arrayOfFiles;
}

/**
 * Checks if an asset file is referenced within a list of source files.
 * @param {string} assetFilePath The absolute path to the asset file.
 * @param {string[]} sourceFiles An array of absolute paths to source files to search within.
 * @returns {boolean} True if a reference is found, false otherwise.
 */
function findReferences(assetFilePath, sourceFiles) {
    const fileName = path.basename(assetFilePath);
    // Create a relative path from the project root, ensuring forward slashes for consistency
    const relativePath = path.relative(projectRoot, assetFilePath).replace(/\\/g, '/');

    for (const sourceFile of sourceFiles) {
        try {
            const content = fs.readFileSync(sourceFile, 'utf8');

            // Check for both the base filename and the full relative path
            // The relative path check is generally more robust for assets
            if (content.includes(fileName) || content.includes(relativePath)) {
                return true; // Found a reference
            }
        } catch (error) {
            console.error(`Error reading file ${sourceFile}: ${error.message}`);
        }
    }
    return false; // No reference found
}

/**
 * Prompts the user for confirmation.
 * @param {string} question The question to ask the user.
 * @returns {Promise<boolean>} Resolves to true if 'y' is entered, false otherwise.
 */
async function confirmAction(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question + ' (y/N): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

// --- Main Execution Logic ---
async function runScript() {
    console.log('Starting scan for unused assets...');

    // 1. Get all assets from src/assets (all file types)
    const allAssets = getAllFilesByExtensions(assetsDir, ['.*']);
    if (allAssets.length === 0) {
        console.log('No assets found in src/assets directory or its subfolders. Exiting.');
        process.exit(0);
    }

    // 2. Get all relevant source files from src (TS, HTML, SCSS, CSS)
    const allSourceFiles = getAllFilesByExtensions(srcDir, searchExtensions);
    if (allSourceFiles.length === 0) {
        console.warn('Warning: No relevant source files (.ts, .html, .scss, .css) found in src/ to check for references. Exiting.');
        process.exit(0);
    }

    console.log(`Found ${allAssets.length} assets in 'src/assets'.`);
    console.log(`Scanning ${allSourceFiles.length} source files for asset references...`);

    const unusedAssets = [];
    let scannedCount = 0;
    const totalAssets = allAssets.length;

    // 3. Iterate through assets and check for references
    for (const assetPath of allAssets) {
        scannedCount++;
        // Use process.stdout.write for a single-line progress update
        process.stdout.write(`Total Scanned assets ${scannedCount}/${totalAssets}\r`);

        if (!findReferences(assetPath, allSourceFiles)) {
            unusedAssets.push(path.relative(projectRoot, assetPath)); // Store relative path for display/deletion
        }
    }
    process.stdout.write('\n'); // Move to a new line after progress updates

    // 4. Report and optionally delete unused assets
    if (unusedAssets.length > 0) {
        console.log('\n--- Potentially Unused Assets Found ---');
        unusedAssets.forEach(asset => console.log(asset));
        console.log(`\nTotal potentially unused assets: ${unusedAssets.length}`);

        const confirmDelete = await confirmAction('Do you want to delete these unused assets?');

        if (confirmDelete) {
            let deletedCount = 0;
            for (const assetRelPath of unusedAssets) {
                const fullPath = path.join(projectRoot, assetRelPath);
                try {
                    fs.unlinkSync(fullPath); // Synchronously delete the file
                    console.log(`Deleted: ${assetRelPath}`);
                    deletedCount++;
                } catch (error) {
                    console.error(`Error deleting ${assetRelPath}: ${error.message}`);
                }
            }
            console.log(`\nSuccessfully deleted ${deletedCount} unused assets.`);
        } else {
            console.log('\nDeletion canceled. No assets were removed.');
        }

    } else {
        console.log('\nNo potentially unused assets found!');
    }

    console.log('\nScan complete.');
}

// Execute the main script function
runScript();
