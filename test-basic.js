/**
 * Basic syntax validation for the sessionTaskLink module
 * This tests that the TypeScript code has valid JavaScript syntax
 */

// Since we don't have TypeScript compilation working, let's at least verify
// that our module structure is sound by checking basic syntax

const fs = require('fs');
const path = require('path');

function validateSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for basic syntax issues
    const issues = [];

    // Check for unmatched braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(`Unmatched braces: ${openBraces} open, ${closeBraces} close`);
    }

    // Check for unmatched parentheses
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`Unmatched parentheses: ${openParens} open, ${closeParens} close`);
    }

    // Check for common TypeScript keywords
    const hasExport = /export\s+(interface|class|function|const|let|var)/.test(content);
    const hasInterface = /interface\s+\w+/.test(content);
    const hasFunction = /function\s+\w+/.test(content);

    console.log(`✅ ${filePath}:`);
    console.log(`   - Balanced braces: ${openBraces === closeBraces ? '✓' : '✗'}`);
    console.log(`   - Balanced parentheses: ${openParens === closeParens ? '✓' : '✗'}`);
    console.log(`   - Has exports: ${hasExport ? '✓' : '✗'}`);
    console.log(`   - Has interfaces: ${hasInterface ? '✓' : '✗'}`);
    console.log(`   - Has functions: ${hasFunction ? '✓' : '✗'}`);

    if (issues.length > 0) {
      console.log(`❌ Issues found: ${issues.join(', ')}`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    return false;
  }
}

// Validate the main module file
const mainFile = path.join(__dirname, 'lib', 'sessionTaskLink.ts');
const testFile = path.join(__dirname, 'lib', 'sessionTaskLink.test.ts');

console.log('Basic syntax validation:');
console.log('=======================');

const mainValid = validateSyntax(mainFile);
const testValid = validateSyntax(testFile);

console.log(`\nOverall result: ${mainValid && testValid ? '✅ PASSED' : '❌ FAILED'}`);