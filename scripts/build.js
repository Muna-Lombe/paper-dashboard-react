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

  const declaredVars = new Map(); // Maps varName to its VariableDeclaration node
  const usedVars = new Set();

  walk.ancestor(ast, {
    VariableDeclarator(node, ancestors) {
      if (node.id.type === "Identifier") {
        const declarationNode = ancestors[ancestors.length - 2]; // Parent of VariableDeclarator is VariableDeclaration
        declaredVars.set(node.id.name, declarationNode);
      }
    },
    Identifier(node, ancestors) {
      const parent = ancestors[ancestors.length - 1]; // Current node's parent

      // Exclude identifiers that are part of a declaration (left-hand side of an assignment)
      if (
        (parent.type === 'VariableDeclarator' && parent.id === node) ||
        (parent.type === 'Property' && parent.key === node && parent.shorthand) || // object shorthand { foo }
        (parent.type === 'Property' && parent.key === node && parent.computed) || // computed property name { [foo] }
        (parent.type === 'FunctionDeclaration' && parent.id === node) ||
        (parent.type === 'ClassDeclaration' && parent.id === node) ||
        (parent.type === 'FunctionExpression' && parent.id === node) || // named function expression
        (parent.type === 'ClassExpression' && parent.id === node) || // named class expression
        (parent.type === 'CatchClause' && parent.param === node) ||
        (parent.type === 'ImportSpecifier' && (parent.local === node || parent.imported === node)) ||
        (parent.type === 'ImportDefaultSpecifier' && parent.local === node) ||
        (parent.type === 'ImportNamespaceSpecifier' && parent.local === node) ||
        (parent.type === 'ExportSpecifier' && (parent.local === node || parent.exported === node)) ||
        (parent.type === 'LabeledStatement' && parent.label === node)
      ) {
        return; // This is a declaration or binding, not a usage
      }

      usedVars.add(node.name);
    }
  });

  const declarationsToComment = new Set();

  declaredVars.forEach((declarationNode, varName) => {
    if (!usedVars.has(varName)) {
      declarationsToComment.add(declarationNode);
    }
  });

  let lines = content.split('\n');

  // Sort by end position in reverse to avoid messing up offsets when modifying content
  const sortedDeclarationsToComment = Array.from(declarationsToComment).sort((a, b) => b.end - a.end);

  sortedDeclarationsToComment.forEach(nodeToComment => {
    // Get line numbers for the declaration
    const startLineIdx = content.substring(0, nodeToComment.start).split('\n').length - 1;
    const endLineIdx = content.substring(0, nodeToComment.end).split('\n').length - 1;

    // Apply comments to each line
    for (let i = startLineIdx; i <= endLineIdx; i++) {
      if (lines[i] && !lines[i].trim().startsWith('//')) { // Avoid double commenting
        lines[i] = `// ${lines[i]}`;
      }
    }
  });

  content = lines.join('\n');

  // Comment out console.logs
  content = content.replace(
    /console\.log\((.*?)\);/g,
    "// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log($1);",
  );

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
    } else if (path.basename(file) === "database.js") { // Corrected from path.basename
      // Do nothing for database.js
    } else if (path.extname(file) === ".js" || path.extname(file) === ".jsx") { // Added .jsx
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
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // console.log('Build process completed!');
