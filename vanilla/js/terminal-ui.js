// Terminal UI Functions
import { logDebug } from './debug.js';

export function typeText(element, text, speed = 20) {
    return new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

export function printWelcome(terminal) {
    const welcomeText = `
    Welcome to AzNet Projects Terminal Interface
    Type 'help' to see available commands
    Type 'projects' to see available projects
    Type 'about' to learn more about this interface
    `;
    return typeText(terminal, welcomeText);
}

export function scrollToBottom(terminal) {
    terminal.scrollTop = terminal.scrollHeight;
}

export function createPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'terminal-prompt';
    prompt.innerHTML = '<span class="prompt-user">user@aznet</span>:<span class="prompt-path">~</span>$ ';
    return prompt;
}

export function createInput() {
    const input = document.createElement('input');
    input.className = 'terminal-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    return input;
}

export function createOutput() {
    const output = document.createElement('div');
    output.className = 'terminal-output';
    return output;
}

export function createClickableItem(text, className = 'clickable') {
    const item = document.createElement('span');
    item.className = className;
    item.textContent = text;
    return item;
}

export function createDirectoryItem(name) {
    const item = document.createElement('div');
    item.className = 'directory-item';
    item.innerHTML = `
        <span class="directory-icon">📁</span>
        <span class="directory-name">${name}</span>
    `;
    return item;
}

export function createFileItem(name) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
        <span class="file-icon">📄</span>
        <span class="file-name">${name}</span>
    `;
    return item;
}

export function createCommandLine() {
    const line = document.createElement('div');
    line.className = 'command-line';
    return line;
}

export function createSuggestionBox() {
    const box = document.createElement('div');
    box.className = 'suggestion-box';
    return box;
}

export function updateSuggestionBox(box, suggestions) {
    box.innerHTML = '';
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        box.appendChild(item);
    });
}

export function showSuggestionBox(box, input, terminal) {
    const rect = input.getBoundingClientRect();
    const terminalRect = terminal.getBoundingClientRect();
    box.style.top = `${rect.bottom - terminalRect.top}px`;
    box.style.left = `${rect.left - terminalRect.left}px`;
    box.style.display = 'block';
}

export function hideSuggestionBox(box) {
    box.style.display = 'none';
}

export function createDetailsPanel() {
    const panel = document.createElement('div');
    panel.className = 'details-panel';
    return panel;
}

export function createDirectoryPanel() {
    const panel = document.createElement('div');
    panel.className = 'directory-panel';
    return panel;
}

export function createTerminalContainer() {
    const container = document.createElement('div');
    container.className = 'terminal-container';
    return container;
}

export function createTerminal() {
    const terminal = document.createElement('div');
    terminal.className = 'terminal';
    return terminal;
}

export function createTerminalHeader() {
    const header = document.createElement('div');
    header.className = 'terminal-header';
    header.innerHTML = `
        <div class="terminal-title">AzNet Projects Terminal</div>
        <div class="terminal-controls">
            <button class="terminal-button minimize">_</button>
            <button class="terminal-button maximize">□</button>
            <button class="terminal-button close">×</button>
        </div>
    `;
    return header;
}

export function createTerminalContent() {
    const content = document.createElement('div');
    content.className = 'terminal-content';
    return content;
}

export function createTerminalFooter() {
    const footer = document.createElement('div');
    footer.className = 'terminal-footer';
    return footer;
}

export function createTerminalStatus() {
    const status = document.createElement('div');
    status.className = 'terminal-status';
    return status;
}

export function updateTerminalStatus(status, text, type = 'info') {
    status.textContent = text;
    status.className = `terminal-status ${type}`;
}

export function createTerminalProgress() {
    const progress = document.createElement('div');
    progress.className = 'terminal-progress';
    return progress;
}

export function updateTerminalProgress(progress, value) {
    progress.style.width = `${value}%`;
}

export function createTerminalMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `terminal-message ${type}`;
    message.textContent = text;
    return message;
}

export function appendMessage(terminal, text, type = 'info') {
    const message = createTerminalMessage(text, type);
    terminal.appendChild(message);
    scrollToBottom(terminal);
}

export function clearTerminal(terminal) {
    terminal.innerHTML = '';
    const welcome = printWelcome(terminal);
    welcome.then(() => {
        const prompt = createPrompt();
        const input = createInput();
        terminal.appendChild(prompt);
        terminal.appendChild(input);
        input.focus();
    });
}

export function setupTerminalUI(terminal) {
    const container = createTerminalContainer();
    const header = createTerminalHeader();
    const content = createTerminalContent();
    const footer = createTerminalFooter();
    const status = createTerminalStatus();
    const progress = createTerminalProgress();

    container.appendChild(header);
    container.appendChild(content);
    footer.appendChild(status);
    footer.appendChild(progress);
    container.appendChild(footer);

    terminal.appendChild(container);
    return {
        container,
        header,
        content,
        footer,
        status,
        progress
    };
} 