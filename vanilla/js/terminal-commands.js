import { typeText, printWelcome } from './terminal-ui.js';
import { openDetailsPanel, closeDetailsPanel } from './terminal-details.js';
import { fileSystem } from './file-system.js';
import { renderDirectoryPanel } from './directory-panel.js';
import { logDebug } from './debug.js';

export function terminalCommands(terminal) {
  return {
    async help() {
      const helpText = `\nAvailable commands:\n  <span class='clickable-item' data-cmd='help'>help</span>        - Show this help message\n  <span class='clickable-item' data-cmd='clear'>clear</span>       - Clear the terminal\n  <span class='clickable-item' data-cmd='about'>about</span>       - Show about information\n  <span class='clickable-item' data-cmd='projects'>projects</span>    - List all projects\n  <span class='clickable-item' data-cmd='contact'>contact</span>     - Show contact information\n  <span class='clickable-item' data-cmd='ls'>ls</span>          - List directory contents\n  <span class='clickable-item' data-cmd='cd projects'>cd [dir]</span>    - Change directory\n  <span class='clickable-item' data-cmd='cat about.txt'>cat [file]</span>  - Read file contents\n  <span class='clickable-item' data-cmd='echo hello'>echo [text]</span> - Print text\n  <span class='clickable-item' data-cmd='neofetch'>neofetch</span>    - Show system information\n  <span class='clickable-item' data-cmd='exit'>exit</span>        - Exit the terminal\n`;
      await typeText(terminal, helpText);
    },
    clear() {
      printWelcome(terminal);
    },
    async about() {
      const aboutText = `\nAZNET - Terminal Interface\nVersion: 1.0.0\nCreated with ❤️ by Hugo Villeneuve\n\nHi, I'm Hugo! I build tools for gamers and devs who want more than just pretty interfaces.\nThis is a modern terminal-style interface for the AzNet community.\nNavigate through our content using terminal commands or by clicking the menu.\n`;
      await typeText(terminal, aboutText);
    },
    async projects() {
      const projects = window.PROJECTS || [];
      let output = 'Available projects:\n\n';
      projects.forEach(project => {
        output += `<span class='clickable-item' data-cmd='cat ${project.name.toLowerCase()}'>${project.name}</span> – ${project.description}\n`;
      });
      await typeText(terminal, output);
    },
    async contact() {
      const contactText = `\nContact Information:\nEmail: contact@aznet.com\nTwitter: @aznet\nGitHub: github.com/aznet\n`;
      await typeText(terminal, contactText);
    },
    async ls() {
      const items = fileSystem.listDirectory();
      if (items.length === 0) {
        await typeText(terminal, 'Directory is empty');
        return;
      }
      const output = items.map(item => {
        const typeIndicator = item.type === 'directory' ? '/' : '';
        return `${item.name}${typeIndicator}`;
      }).join('\n');
      await typeText(terminal, output);
    },
    async cd(args) {
      if (!args || args.length === 0) {
        await typeText(terminal, 'Usage: cd <directory>');
        return;
      }
      const success = fileSystem.changeDirectory(args[0]);
      if (!success) {
        await typeText(terminal, `cd: ${args[0]}: No such directory`);
        return;
      }
      renderDirectoryPanel();
    },
    async pwd() {
      await typeText(terminal, fileSystem.getPathString());
    },
    async cat(args) {
      logDebug('cat command called', { args });
      if (!args || args.length === 0) {
        logDebug('cat: no args');
        await typeText(terminal, 'Usage: cat <file>');
        return;
      }
      // Check if the argument matches a project in window.PROJECTS
      const projects = window.PROJECTS || [];
      const argName = args[0].toLowerCase();
      const project = projects.find(p => p.name.toLowerCase() === argName);
      logDebug('cat: project lookup', { argName, project });
      if (project) {
        logDebug('cat: opening details panel', { project });
        openDetailsPanel(terminal, project);
        setTimeout(() => {
          logDebug('cat: scrollToBottom after openDetailsPanel');
          scrollToBottom(terminal);
        }, 100);
        return;
      }
      // Fallback to virtual file system
      const content = fileSystem.getFileContent(argName);
      logDebug('cat: file system lookup', { argName, content });
      if (content === null) {
        await typeText(terminal, `cat: ${args[0]}: No such file`);
        return;
      }
      await typeText(terminal, content);
    },
    async echo(args) {
      await typeText(terminal, args.join(' '));
    },
    async neofetch() {
      const neofetchText = `\nvisitor@aznet\n------------\nOS: AZNET Terminal 1.0.0\nHost: Web Browser\nShell: Custom Terminal\nTerminal: AZNET Terminal\nCPU: JavaScript Engine\nMemory: Dynamic\nUptime: ${Math.floor(performance.now() / 1000)}s\n`;
      await typeText(terminal, neofetchText);
    },
    async exit() {
      if (terminal.detailsPanel.classList.contains('open')) {
        closeDetailsPanel(terminal);
        return;
      }
      await typeText(terminal, 'Goodbye!', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  };
}

// Fuzzy matching function for command suggestions
const fuzzyMatch = (input, command) => {
    const inputLower = input.toLowerCase();
    const commandLower = command.toLowerCase();
    
    // Exact match
    if (inputLower === commandLower) return 1.0;
    
    // Starts with
    if (commandLower.startsWith(inputLower)) return 0.9;
    
    // Contains
    if (commandLower.includes(inputLower)) return 0.8;
    
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(inputLower, commandLower);
    const maxLength = Math.max(inputLower.length, commandLower.length);
    return 1 - (distance / maxLength);
};

// Levenshtein distance calculation
const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + cost
            );
        }
    }
    
    return matrix[b.length][a.length];
};

// Get command suggestions with fuzzy matching
export const getCommandSuggestions = (input, commandsObj) => {
    const commands = Object.keys(commandsObj);
    const suggestions = commands
        .map(cmd => ({
            command: cmd,
            score: fuzzyMatch(input, cmd)
        }))
        .filter(suggestion => suggestion.score > 0.3)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    
    return suggestions;
};

// Enhanced command error handling
export const handleCommandError = (input, commandsObj) => {
    const suggestions = getCommandSuggestions(input, commandsObj);
    if (suggestions.length > 0) {
        const bestMatch = suggestions[0];
        const otherMatches = suggestions.slice(1);
        
        let message = `Command not found: ${input}\n`;
        message += `Did you mean: ${bestMatch.command}?\n`;
        
        if (otherMatches.length > 0) {
            message += `Other possibilities: ${otherMatches.map(m => m.command).join(', ')}\n`;
        }
        
        message += `\nType 'help' for a list of available commands.`;
        return message;
    }
    
    return `Command not found: ${input}\nType 'help' for a list of available commands.`;
}; 