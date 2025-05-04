import { fileSystem } from './file-system.js';

export function renderDirectoryPanel() {
    const panel = document.getElementById('directory-panel');
    if (!panel) return;
    // Remove leading empty string for root
    const currentPath = fileSystem.currentPath.length === 1 && fileSystem.currentPath[0] === '/' ? [] : fileSystem.currentPath.slice(1);
    panel.innerHTML = `<div class="directory-tree-title">Directory</div>` + renderTree(fileSystem.root, [], currentPath);
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function renderTree(node, pathArr, currentPathArr) {
    if (!node.children) return '';
    let html = '<ul class="directory-tree">';
    for (const [name, child] of Object.entries(node.children)) {
        const thisPathArr = [...pathArr, name];
        const isActive = arraysEqual(thisPathArr, currentPathArr);
        html += `<li class="directory-tree-item${isActive ? ' active' : ''}${child.type === 'directory' ? ' dir' : ' file'}">`;
        html += `<span>${child.type === 'directory' ? '📁' : '📄'} ${child.name}</span>`;
        if (child.type === 'directory') {
            html += renderTree(child, thisPathArr, currentPathArr);
        }
        html += '</li>';
    }
    html += '</ul>';
    return html;
}

// Call this after every cd/ls or on terminal init
export function setupDirectoryPanelAutoUpdate(terminal) {
    renderDirectoryPanel();
    // Optionally, add listeners to update on cd/ls
    // For now, you can call renderDirectoryPanel() after each command
} 