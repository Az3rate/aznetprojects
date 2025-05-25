#!/usr/bin/env node

/**
 * Truth Analysis Audit Helper
 * 
 * This script helps update the TRUTH-ANALYSIS.md file with audit results.
 * Usage: node audit-helper.js <action> [options]
 * 
 * Actions:
 *   pass <example-id> [notes]     - Mark example as passed
 *   fail <example-id> <issues>    - Mark example as failed
 *   progress <example-id>         - Mark example as in progress
 *   status                        - Show overall audit status
 *   next                          - Show next example to audit
 */

const fs = require('fs');
const path = require('path');

const TRUTH_ANALYSIS_FILE = 'TRUTH-ANALYSIS.md';

// Example IDs from codeExamples.ts
const ALL_EXAMPLES = [
  'simple', 'nested', 'async-await', 'multiple-functions', 'callbacks',
  'promise-chain', 'recursion', 'generators', 'complex-async', 'class-methods',
  'stress-test', 'async-stress-test', 'event-emission-test', 'sync-test',
  'delay-test', 'timing-precision', 'nested-delays', 'new-mixed-async-patterns',
  'new-parallel-promises', 'new-error-handling', 'new-recursive-promises',
  'new-timing-edge-cases', 'new-promise-race', 'new-nested-workers',
  'break-self-modifying', 'break-dynamic-functions', 'break-infinite-loops',
  'break-parser-confusion', 'break-async-chaos', 'mega-chaos-ultimate'
];

const COMPLEXITY_ORDER = ['basic', 'intermediate', 'advanced', 'expert'];

function readTruthAnalysis() {
  try {
    return fs.readFileSync(TRUTH_ANALYSIS_FILE, 'utf8');
  } catch (error) {
    console.error(`Error reading ${TRUTH_ANALYSIS_FILE}:`, error.message);
    process.exit(1);
  }
}

function writeTruthAnalysis(content) {
  try {
    fs.writeFileSync(TRUTH_ANALYSIS_FILE, content, 'utf8');
    console.log(`✅ Updated ${TRUTH_ANALYSIS_FILE}`);
  } catch (error) {
    console.error(`Error writing ${TRUTH_ANALYSIS_FILE}:`, error.message);
    process.exit(1);
  }
}

function updateExampleStatus(exampleId, newStatus, notes = '') {
  let content = readTruthAnalysis();
  
  // Find the example section
  const examplePattern = new RegExp(`(### [⭕⏳❌✅] .+\\(ID: \`${exampleId}\`\\)\\s*\\n\\*\\*Status\\*\\*: )(PENDING|IN PROGRESS|FAILED|PASSED)`, 'g');
  
  if (!examplePattern.test(content)) {
    console.error(`❌ Example "${exampleId}" not found in ${TRUTH_ANALYSIS_FILE}`);
    process.exit(1);
  }
  
  // Reset pattern for replacement
  examplePattern.lastIndex = 0;
  
  // Update status emoji and text
  const statusEmoji = {
    'PENDING': '⭕',
    'IN PROGRESS': '⏳',
    'FAILED': '❌',
    'PASSED': '✅'
  };
  
  content = content.replace(examplePattern, (match, prefix, oldStatus) => {
    return `${prefix.replace(/[⭕⏳❌✅]/, statusEmoji[newStatus])}${newStatus}`;
  });
  
  // Add audit results if notes provided
  if (notes) {
    const resultsPattern = new RegExp(`(\\*\\*Audit Results\\*\\*: )\\*To be filled\\*`, 'g');
    content = content.replace(resultsPattern, `$1${notes}`);
  }
  
  // Update timestamp
  content = content.replace(/\*Last Updated: \[Current Date\]\*/, `*Last Updated: ${new Date().toISOString().split('T')[0]}*`);
  
  writeTruthAnalysis(content);
}

function getAuditProgress() {
  const content = readTruthAnalysis();
  
  const statusCounts = {
    PASSED: (content.match(/✅.*\(ID:/g) || []).length,
    'IN PROGRESS': (content.match(/⏳.*\(ID:/g) || []).length,
    FAILED: (content.match(/❌.*\(ID:/g) || []).length,
    PENDING: (content.match(/⭕.*\(ID:/g) || []).length
  };
  
  const total = ALL_EXAMPLES.length;
  const completed = statusCounts.PASSED + statusCounts.FAILED;
  const percentage = Math.round((completed / total) * 100);
  
  return { statusCounts, total, completed, percentage };
}

function showStatus() {
  const { statusCounts, total, completed, percentage } = getAuditProgress();
  
  console.log('\n🎯 Truth Analysis Audit Status\n');
  console.log(`Total Examples: ${total}`);
  console.log(`✅ Passed: ${statusCounts.PASSED}`);
  console.log(`❌ Failed: ${statusCounts.FAILED}`);
  console.log(`⏳ In Progress: ${statusCounts['IN PROGRESS']}`);
  console.log(`⭕ Pending: ${statusCounts.PENDING}`);
  console.log(`📊 Overall Progress: ${percentage}% complete\n`);
  
  if (statusCounts.FAILED > 0) {
    console.log('⚠️  Some examples failed audit - check TRUTH-ANALYSIS.md for details\n');
  }
}

function getNextExample() {
  const content = readTruthAnalysis();
  
  // Find first pending example in order of complexity
  for (const complexity of COMPLEXITY_ORDER) {
    const pattern = new RegExp(`### ⭕ (.+)\\(ID: \`(.+)\`\\)\\s*\\n\\*\\*Status\\*\\*: PENDING\\s*\\n\\*\\*Complexity\\*\\*: ${complexity}`, 'i');
    const match = content.match(pattern);
    
    if (match) {
      const [, name, id] = match;
      console.log(`\n🎯 Next example to audit:`);
      console.log(`ID: ${id}`);
      console.log(`Name: ${name.trim()}`);
      console.log(`Complexity: ${complexity}\n`);
      console.log(`To start: Select "${id}" in the dropdown and begin testing.\n`);
      return;
    }
  }
  
  console.log('\n🎉 All examples have been audited!\n');
}

function updateProgressSummary() {
  const { statusCounts, total, completed, percentage } = getAuditProgress();
  let content = readTruthAnalysis();
  
  // Update progress tracking section
  const progressPattern = /(\*\*Total Examples\*\*: )\d+\s*\n(\*\*Audited\*\*: )\d+\s*\n(\*\*Passed\*\*: )\d+\s*\n(\*\*Failed\*\*: )\d+\s*\n(\*\*In Progress\*\*: )\d+/;
  
  const newProgress = `$1${total}\n$2${completed}\n$3${statusCounts.PASSED}\n$4${statusCounts.FAILED}\n$5${statusCounts['IN PROGRESS']}`;
  
  content = content.replace(progressPattern, newProgress);
  
  writeTruthAnalysis(content);
}

// Command line interface
const action = process.argv[2];
const exampleId = process.argv[3];
const notes = process.argv.slice(4).join(' ');

switch (action) {
  case 'pass':
    if (!exampleId) {
      console.error('❌ Please provide an example ID');
      process.exit(1);
    }
    updateExampleStatus(exampleId, 'PASSED', notes || `Audit completed on ${new Date().toISOString().split('T')[0]}. All metrics verified as accurate.`);
    updateProgressSummary();
    console.log(`✅ Marked "${exampleId}" as PASSED`);
    break;
    
  case 'fail':
    if (!exampleId || !notes) {
      console.error('❌ Please provide an example ID and failure notes');
      process.exit(1);
    }
    updateExampleStatus(exampleId, 'FAILED', `FAILED on ${new Date().toISOString().split('T')[0]}. Issues: ${notes}`);
    updateProgressSummary();
    console.log(`❌ Marked "${exampleId}" as FAILED`);
    break;
    
  case 'progress':
    if (!exampleId) {
      console.error('❌ Please provide an example ID');
      process.exit(1);
    }
    updateExampleStatus(exampleId, 'IN PROGRESS', notes || `Audit started on ${new Date().toISOString().split('T')[0]}.`);
    updateProgressSummary();
    console.log(`⏳ Marked "${exampleId}" as IN PROGRESS`);
    break;
    
  case 'status':
    showStatus();
    break;
    
  case 'next':
    getNextExample();
    break;
    
  default:
    console.log(`
🎯 Truth Analysis Audit Helper

Usage: node audit-helper.js <action> [options]

Actions:
  pass <example-id> [notes]     - Mark example as passed
  fail <example-id> <issues>    - Mark example as failed  
  progress <example-id>         - Mark example as in progress
  status                        - Show overall audit status
  next                          - Show next example to audit

Examples:
  node audit-helper.js status
  node audit-helper.js next
  node audit-helper.js progress simple
  node audit-helper.js pass simple "All metrics verified"
  node audit-helper.js fail simple "Performance metrics incorrect"
`);
    break;
} 