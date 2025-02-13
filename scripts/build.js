const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");

// Function to process JavaScript files
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace localhost references with 0.0.0.0
  content = content.replace(
    /['"]http:\/\/localhost:[0-9]+['"]/g,
    '"https://0.0.0.0:$1"',
  );

  // Parse the code
  const ast = acorn.parse(content, {
    sourceType: "module",
    ecmaVersion: "latest",
  });

  // Track used variables
  const usedVars = new Set();
  const declaredVars = new Set();

  // Find all variable declarations and usages
  walk.simple(ast, {
    VariableDeclarator(node) {
      if (node.id.type === "Identifier") {
        declaredVars.add(node.id.name);
      }
    },
    Identifier(node) {
      usedVars.add(node.name);
    },
  });

  // Comment out unused variables
  const unusedVars = [...declaredVars].filter((v) => !usedVars.has(v));
  unusedVars.forEach((varName) => {
    const regex = new RegExp(`(const|let|var)\\s+${varName}\\s*=`);
    content = content.replace(regex, "// $&");
  });

  // Comment out console.logs
  content = content.replace(
    /console\.log\((.*?)\);/g,
    "// // console.log($1);",
  );

  // Write back to file
  fs.writeFileSync(filePath, content);
}

// Process all JS files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes("node_modules")) {
      processDirectory(filePath);
    } else if (path.basename === "databse.js") {
    } else if (path.extname(file) === ".js") {
      processFile(filePath);
    }
  });
}

// Create build directory
const buildDir = path.join(__dirname, "../build");
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Copy and process files
processDirectory(path.join(__dirname, ".."));
// console.log('Build process completed!');
