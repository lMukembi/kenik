const fs = require("fs");
const path = require("path");

function combineFiles(inputDir, outputFile, exclude = []) {
  let combinedContent = "";
  let fileCount = 0;

  const defaultExclusions = [".", "node_modules", "package-lock.json", "css"];
  const allExclusions = [...new Set([...defaultExclusions, ...exclude])];

  function processDirectory(dir, prefix = "") {
    const items = fs.readdirSync(dir);

    items.forEach((item) => {
      const isExcluded = allExclusions.some((exclusion) => {
        if (
          fs.existsSync(path.join(dir, exclusion)) &&
          fs.statSync(path.join(dir, exclusion)).isDirectory()
        ) {
          return item === exclusion || item.startsWith(exclusion + path.sep);
        }
        return item === exclusion || item.startsWith(".");
      });

      if (isExcluded) {
        console.log(`Skipping excluded item: ${path.join(dir, item)}`);
        return;
      }

      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        processDirectory(itemPath, prefix + item + path.sep);
      } else {
        fileCount++;
        const content = fs.readFileSync(itemPath, "utf8");
        const relativePath = prefix + item;

        combinedContent += `\n===== FILE: ${relativePath} =====\n\n`;
        combinedContent += content;
        combinedContent += "\n\n";

        console.log(`Processed: ${relativePath}`);
      }
    });
  }

  processDirectory(inputDir);

  fs.writeFileSync(outputFile, combinedContent);
  console.log(`\nCombined ${fileCount} files into ${outputFile}`);
}

const inputDirectory = "./";
const outputFile = "./combined_files.txt";

const exclusions = ["node_modules", "dist", "my_secret_file.txt"];

combineFiles(inputDirectory, outputFile, exclusions);
