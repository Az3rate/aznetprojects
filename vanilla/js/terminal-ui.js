import { logDebug } from './debug.js';

export function appendPrompt(terminal) {
  logDebug('appendPrompt called', { terminal });
  // Remove any existing input fields from .command-line
  const commandLine = document.querySelector('.command-line');
  if (commandLine) {
    commandLine.innerHTML = '';
    let promptDiv = document.createElement('div');
    promptDiv.className = 'prompt-block';
    promptDiv.innerHTML = `
      <span class="prompt">${terminal.prompt}</span>
      <input type="text" class="command-input-terminal" autofocus spellcheck="false" autocomplete="off">
    `;
    commandLine.appendChild(promptDiv);
    terminal.input = promptDiv.querySelector('.command-input-terminal');
    terminal.input.focus();
    if (typeof terminal.setupInputEventListeners === 'function') {
      terminal.setupInputEventListeners();
    }
  }
  scrollToBottom(terminal);
}

// Check for first-time user in localStorage
function isFirstTimeUser() {
  return !localStorage.getItem('aznet_terminal_visited');
}

function setFirstTimeUserFlag() {
  localStorage.setItem('aznet_terminal_visited', 'true');
}

export async function printWelcome(terminal) {
  const projects = window.PROJECTS || [];
  let welcomeText = `\n`;
  welcomeText += `<span class='ascii-art'>
    █████╗ ███████╗███╗   ██╗███████╗████████╗
   ██╔══██╗╚══███╔╝████╗  ██║██╔════╝╚══██╔══╝
   ███████║  ███╔╝ ██╔██╗ ██║█████╗     ██║   
   ██╔══██║ ███╔╝  ██║╚██╗██║██╔══╝     ██║   
   ██║  ██║███████╗██║ ╚████║███████╗   ██║   
   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚══════╝   ╚═╝   
</span>\n`;
  welcomeText += `<div class='welcome-title'>Welcome to AZNET Terminal Interface</div>`;
  welcomeText += `<div class='welcome-subtitle'>Created with <span class='heart'>♥</span> by <b>Hugo Villeneuve</b></div>`;
  welcomeText += `<div class='welcome-text'>Type <span class='clickable-item' data-cmd='help'>help</span> or click a command below to get started.</div>`;
  welcomeText += `<div class='welcome-heading'>Quick Menu:</div>`;
  welcomeText += `<div class='quick-menu'>
    <span class='clickable-item' data-cmd='about'>about</span> | 
    <span class='clickable-item' data-cmd='projects'>projects</span> | 
    <span class='clickable-item' data-cmd='contact'>contact</span> | 
    <span class='clickable-item' data-cmd='ls'>ls</span> | 
    <span class='clickable-item' data-cmd='neofetch'>neofetch</span>
  </div>`;
  if (projects.length > 0) {
    welcomeText += `<div class='welcome-heading project-heading'>Projects:</div>`;
    projects.forEach(project => {
      welcomeText += `<span class='clickable-item' data-cmd='cat ${project.name.toLowerCase()}'>${project.name}</span> – ${project.description}<br/>`;
    });
  }
  welcomeText += `<div class='welcome-info'>You can also type commands directly, just like a real terminal.</div>`;

  // First-time user hint system
  if (isFirstTimeUser()) {
    welcomeText += `<div class='first-time-hint'>
      <b>First time here?</b><br>
      <ul>
        <li>Try typing <span class='clickable-item' data-cmd='help'>help</span> to see all available commands.</li>
        <li>Click any <span class='highlight'>purple</span> command or project name to run it instantly.</li>
        <li>Use <b>Tab</b> for autocomplete and <b>Arrow keys</b> for command history.</li>
        <li>Type <span class='clickable-item' data-cmd='about'>about</span> to learn more about this project.</li>
      </ul>
    </div>`;
    setFirstTimeUserFlag();
  }

  terminal.content.innerHTML = '';
  const div = document.createElement('div');
  div.innerHTML = welcomeText;
  terminal.content.appendChild(div);
  appendPrompt(terminal);
  scrollToBottom(terminal);
}

export async function typeText(terminal, text, className = '', clickableMap = null) {
  terminal.isProcessing = true;
  const lines = text.split('\n');
  for (const line of lines) {
    const div = document.createElement('div');
    div.className = `terminal-line ${className}`;
    let html = line;
    for (const [token, cmd] of Object.entries(clickableMap || {})) {
      const regex = new RegExp(token, 'g');
      html = html.replace(regex, `<span class='clickable-item' data-cmd="${cmd}">${token}</span>`);
    }
    div.innerHTML = html;
    terminal.content.appendChild(div);
  }
  appendPrompt(terminal);
  terminal.isProcessing = false;
}

export function printCommand(terminal, command) {
  const div = document.createElement('div');
  div.className = 'command-block';
  div.innerHTML = `
    <div>
      <span class="prompt">visitor@aznet:~$</span>
      <span>${command}</span>
    </div>
  `;
  terminal.content.appendChild(div);
}

export function scrollToBottom(terminal) {
  logDebug('scrollToBottom called', { terminal });
  // Use both requestAnimationFrame and setTimeout to ensure reliable scrolling
  requestAnimationFrame(() => {
    terminal.content.scrollTop = terminal.content.scrollHeight;
    // Add a small delay to handle cases where content might still be rendering
    setTimeout(() => {
      terminal.content.scrollTop = terminal.content.scrollHeight;
      logDebug('scrollToBottom: after setTimeout', { scrollTop: terminal.content.scrollTop, scrollHeight: terminal.content.scrollHeight });
    }, 50);
  });
}

// Add new function to handle scroll events
export function setupScrollHandler(terminal) {
  // Create a ResizeObserver to detect content changes
  const resizeObserver = new ResizeObserver(() => {
    scrollToBottom(terminal);
  });
  
  // Observe the terminal content
  resizeObserver.observe(terminal.content);
  
  // Also observe the command input area
  const commandLine = document.querySelector('.command-line');
  if (commandLine) {
    resizeObserver.observe(commandLine);
  }
  
  return resizeObserver;
}