// Virtual File System for Terminal
export class VirtualFileSystem {
    constructor() {
        this.root = {
            name: '/',
            type: 'directory',
            children: {
                'projects': {
                    name: 'projects',
                    type: 'directory',
                    children: {
                        'web': {
                            name: 'web',
                            type: 'directory',
                            children: {}
                        },
                        'ai': {
                            name: 'ai',
                            type: 'directory',
                            children: {}
                        },
                        'data': {
                            name: 'data',
                            type: 'directory',
                            children: {}
                        }
                        // Project files will be added here dynamically
                    }
                },
                'about': {
                    name: 'about.txt',
                    type: 'file',
                    content: 'Hugo Villeneuve - Full Stack Developer\nAzNet Projects Terminal Interface'
                }
            }
        };
        this.currentPath = ['/'];
        this.addProjectFiles();
    }

    addProjectFiles() {
        if (window.PROJECTS && Array.isArray(window.PROJECTS)) {
            const projectsDir = this.root.children['projects'].children;
            window.PROJECTS.forEach(project => {
                projectsDir[project.name.toLowerCase()] = {
                    name: project.name.toLowerCase(),
                    type: 'file',
                    content: `${project.name}\n${project.description || ''}\n${project.details || ''}`
                };
            });
        }
    }

    getCurrentDirectory() {
        let current = this.root;
        for (const dir of this.currentPath.slice(1)) {
            current = current.children[dir];
        }
        return current;
    }

    getPathString() {
        return this.currentPath.join('/');
    }

    listDirectory() {
        const current = this.getCurrentDirectory();
        return Object.entries(current.children).map(([name, item]) => ({
            name,
            type: item.type,
            size: item.type === 'file' ? item.content.length : 0
        }));
    }

    changeDirectory(path) {
        if (path === '..') {
            if (this.currentPath.length > 1) {
                this.currentPath.pop();
            }
            return true;
        }

        if (path === '/') {
            this.currentPath = ['/'];
            return true;
        }

        const current = this.getCurrentDirectory();
        if (current.children[path] && current.children[path].type === 'directory') {
            this.currentPath.push(path);
            return true;
        }

        return false;
    }

    getFileContent(path) {
        const current = this.getCurrentDirectory();
        // Try current directory first
        if (current.children[path] && current.children[path].type === 'file') {
            return current.children[path].content;
        }
        // If not found, try /projects for project files
        const projectsDir = this.root.children['projects'].children;
        if (projectsDir[path] && projectsDir[path].type === 'file') {
            return projectsDir[path].content;
        }
        return null;
    }
} 