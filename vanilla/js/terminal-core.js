// terminal-core.js
import { terminalCommands } from './terminal-commands.js';
import { appendPrompt, printWelcome, printCommand, scrollToBottom, setupScrollHandler } from './terminal-ui.js';
import { openDetailsPanel, closeDetailsPanel } from './terminal-details.js';
import { fileSystem } from './file-system.js';
import { logDebug } from './debug.js';

export class Terminal {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.currentDirectory = '~';
    this.isProcessing = false;
    this.prompt = '>';
    this.init();
    this.commands = terminalCommands(this);
    this.updatePrompt();
  }

  init() {
    this.terminal = document.querySelector('.terminal');
    this.terminalWrapper = document.querySelector('.terminal-wrapper');
    this.content = document.querySelector('.terminal-content');
    this.input = document.querySelector('.command-input');
    this.detailsPanel = document.getElementById('details-panel');
    this.setupEventListeners();
    this.scrollHandler = setupScrollHandler(this);
    printWelcome(this);
  }

  setupEventListeners() {
    this.content.addEventListener('click', (e) => {
      logDebug('terminal-content click', { target: e.target });
      if (e.target.classList.contains('clickable-item')) {
        const cmd = e.target.getAttribute('data-cmd');
        logDebug('clickable-item clicked', { cmd });
        this.input.value = cmd;
        this.executeCommand();
      } else {
        this.input.focus();
      }
    });
    this.terminal.addEventListener('click', () => {
      this.input.focus();
    });
    this.detailsPanel.addEventListener('click', (e) => {
      if (e.target.classList.contains('details-close-btn')) {
        closeDetailsPanel(this);
      }
    });
  }

  updatePrompt() {
    const path = fileSystem.getPathString();
    this.prompt = `${path}>`;
    const promptSpan = document.querySelector('.prompt');
    if (promptSpan) promptSpan.textContent = this.prompt;
  }

  async executeCommand() {
    logDebug('executeCommand called', { value: this.input.value });
    const command = this.input.value.trim();
    if (!command) return;
    this.history.push(command);
    this.historyIndex = this.history.length;
    printCommand(this, command);
    this.input.value = '';
    const audio = document.getElementById('terminal-audio');
    if (audio) { audio.currentTime = 0; audio.play(); }
    const [cmd, ...args] = command.split(' ');
    logDebug('executeCommand dispatch', { cmd, args });
    if (this.commands[cmd]) {
      await this.commands[cmd](args);
      this.updatePrompt();
      return;
    } else {
      // Use enhanced error handling for unknown commands
      const { handleCommandError } = await import('./terminal-commands.js');
      const errorMessage = handleCommandError(cmd, this.commands);
      const { typeText } = await import('./terminal-ui.js');
      await typeText(this, errorMessage, 'error');
      this.updatePrompt();
      return;
    }
  }

  navigateHistory(direction) {
    if (direction === 'up' && this.historyIndex > 0) {
      this.historyIndex--;
    } else if (direction === 'down' && this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
    }
    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      this.input.value = this.history[this.historyIndex];
    }
  }

  showAutoComplete() {}
  autoComplete() {
    const inputValue = this.input.value;
    const [cmd, ...args] = inputValue.trim().split(/\s+/);
    if (!['cd', 'ls', 'cat'].includes(cmd)) return;
    const partial = args[0] || '';
    const items = fileSystem.listDirectory();
    let candidates = [];
    if (cmd === 'cd') {
      candidates = items.filter(item => item.type === 'directory' && item.name.startsWith(partial));
    } else {
      candidates = items.filter(item => item.name.startsWith(partial));
    }
    if (candidates.length === 1) {
      this.input.value = `${cmd} ${candidates[0].name}`;
      this.input.focus();
      scrollToBottom(this);
    } else if (candidates.length > 1) {
      const output = candidates.map(item => item.type === 'directory' ? item.name + '/' : item.name).join('    ');
      printCommand(this, this.input.value);
      this.input.value = inputValue;
      this.content.innerHTML += `<div class='terminal-line'>${output}</div>`;
      appendPrompt(this);
    }
  }

  setupInputEventListeners() {
    this.input.addEventListener('keydown', (e) => {
      if (this.isProcessing) return;
      if (e.key === 'Enter') {
        this.executeCommand();
      } else if (e.key === 'ArrowUp') {
        this.navigateHistory('up');
      } else if (e.key === 'ArrowDown') {
        this.navigateHistory('down');
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autoComplete();
      }
    });
    this.input.addEventListener('input', () => {
      this.showAutoComplete();
    });
  }

  cleanup() {
    if (this.scrollHandler) {
      this.scrollHandler.disconnect();
    }
  }
}

export const handleCommand = async (input, terminal) => {
    logDebug('handleCommand called', { input });
    
    // Split input into command and arguments
    const [command, ...args] = input.trim().split(/\s+/);
    
    // Check if command exists
    if (terminal.commands[command]) {
        try {
            await terminal.commands[command](args);
        } catch (error) {
            logDebug('Command execution error', { error });
            await typeText(terminal, `Error executing command: ${error.message}`, 'error');
        }
    } else {
        // Use enhanced error handling for unknown commands
        const errorMessage = handleCommandError(command, terminal.commands);
        await typeText(terminal, errorMessage, 'error');
    }
    
    // Always append a new prompt
    appendPrompt(terminal);
}; 