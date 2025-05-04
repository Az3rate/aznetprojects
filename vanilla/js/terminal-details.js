// terminal-details.js
import { scrollToBottom } from './terminal-ui.js';
import { logDebug } from './debug.js';

function ensureMermaid(callback) {
  if (window.mermaid) {
    logDebug('Mermaid already loaded');
    window.mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
    callback();
    return;
  }
  logDebug('Loading Mermaid.js dynamically');
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js';
  script.onload = () => {
    logDebug('Mermaid.js loaded');
    window.mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
    callback();
  };
  document.head.appendChild(script);
}

export function openDetailsPanel(terminal, project) {
  logDebug('openDetailsPanel called', { terminal, project });
  const detailsPanel = document.getElementById('details-panel');
  const wrapper = document.querySelector('.terminal-wrapper');
  if (!detailsPanel) {
    logDebug('openDetailsPanel: detailsPanel not found');
    const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
    logDebug('openDetailsPanel: all elements with id', { allIds });
    return;
  }
  if (!wrapper) {
    logDebug('openDetailsPanel: terminal-wrapper not found');
    return;
  }

  // Build the details HTML with all sections
  let html = `<div class="details-header">
    <h2>${project.name}</h2>
    <button class="details-close-btn" tabindex="0" aria-label="Close details panel">×</button>
  </div>
  <div class="details-content">`;

  if (project.image) {
    logDebug('Rendering image', { image: project.image });
    html += `<div class="details-image-wrap"><img src="${project.image}" alt="Screenshot of ${project.name} project interface" class="details-image" /></div>`;
  }

  html += `<p class="details-description">${project.description}</p>`;

  if (project.overview) {
    logDebug('Rendering overview', { overview: project.overview });
    html += `<section class="details-section"><div class="details-section-title">Project Overview</div><div class="details-section-content">${project.overview}</div></section>`;
  }
  if (project.keyFeatures && project.keyFeatures.length) {
    logDebug('Rendering keyFeatures', { keyFeatures: project.keyFeatures });
    html += `<section class="details-section"><div class="details-section-title">Key Features</div><ul class="details-list">${project.keyFeatures.map(f => `<li>${f}</li>`).join('')}</ul></section>`;
  }
  if (project.architectureImage) {
    logDebug('Rendering architecture as static image only', { architectureImage: project.architectureImage });
    html += `<section class="details-section"><div class="details-section-title">Architecture Flowchart</div><img src="${project.architectureImage}" alt="Architecture flowchart for ${project.name}" class="architecture-image" /></section>`;
  }
  if (project.techStack && project.techStack.length) {
    logDebug('Rendering techStack', { techStack: project.techStack });
    html += `<section class="details-section"><div class="details-section-title">Technical Stack</div><ul class="details-list">${project.techStack.map(t => `<li><b>${t.name}</b>: ${t.description}</li>`).join('')}</ul></section>`;
  }
  if (project.directoryStructure && project.directoryStructure.length) {
    logDebug('Rendering directoryStructure', { directoryStructure: project.directoryStructure });
    html += `<section class="details-section"><div class="details-section-title">Directory Structure (Key Parts)</div><ul class="details-list">${project.directoryStructure.map(d => `<li><code>${d}</code></li>`).join('')}</ul></section>`;
  }
  if (project.apiEndpoints && project.apiEndpoints.length) {
    logDebug('Rendering apiEndpoints', { apiEndpoints: project.apiEndpoints });
    html += `<section class="details-section"><div class="details-section-title">API Endpoints</div><ul class="details-list">${project.apiEndpoints.map(api => `<li><span class='details-api-method'>${api.method}</span> <span class='details-api-path'>${api.path}</span> <span class='details-api-desc'>${api.description}</span></li>`).join('')}</ul></section>`;
  }
  if (project.workflow && project.workflow.length) {
    logDebug('Rendering workflow', { workflow: project.workflow });
    html += `<section class="details-section"><div class="details-section-title">Development Workflow</div><ul class="details-list">${project.workflow.map(w => `<li>${w}</li>`).join('')}</ul></section>`;
  }
  if (project.summary) {
    logDebug('Rendering summary', { summary: project.summary });
    html += `<section class="details-section"><div class="details-section-title">Summary</div><div class="details-section-content">${project.summary}</div></section>`;
  }
  html += '</div>';

  detailsPanel.innerHTML = html;

  // Show the panel
  wrapper.classList.add('terminal-shifted');
  logDebug('openDetailsPanel: panel opened, content set');

  // Ensure the panel is visible and scrolled into view
  detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  logDebug('openDetailsPanel: scrollIntoView called');
  
  // Force scroll to bottom of terminal after panel opens
  setTimeout(() => {
    logDebug('openDetailsPanel: scrollToBottom after open', { terminal });
    scrollToBottom(terminal);
  }, 100);
}

export function closeDetailsPanel(terminal) {
  logDebug('closeDetailsPanel called', { terminal });
  const detailsPanel = document.getElementById('details-panel');
  const wrapper = document.querySelector('.terminal-wrapper');
  if (!detailsPanel) {
    logDebug('closeDetailsPanel: detailsPanel not found');
    return;
  }
  if (wrapper) {
    wrapper.classList.remove('terminal-shifted');
  }
  logDebug('closeDetailsPanel: panel closed');
  scrollToBottom(terminal);
} 