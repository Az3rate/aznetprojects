import { TerminalCommands } from '../services/commands';
import { projects } from '../data/projects';

describe('TerminalCommands', () => {
  let commands: TerminalCommands;

  beforeEach(() => {
    commands = new TerminalCommands(projects);
  });

  it('executes help command', () => {
    const result = commands.execute('help', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('help        - Show this help message');
  });

  it('executes clear command', () => {
    const result = commands.execute('clear', []);
    expect(result.type).toBe('success');
    expect(result.output).toBe('');
  });

  it('executes about command', () => {
    const result = commands.execute('about', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('Welcome to my terminal interface');
  });

  it('executes projects command', () => {
    const result = commands.execute('projects', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('Terminal Interface');
  });

  it('executes contact command', () => {
    const result = commands.execute('contact', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('GitHub:');
  });

  it('executes ls command', () => {
    const result = commands.execute('ls', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('projects');
    expect(result.output).toContain('about.txt');
  });

  it('executes cd command with valid directory', () => {
    const result = commands.execute('cd', ['projects']);
    expect(result.type).toBe('success');
    expect(result.output).toBe('');
  });

  it('executes cd command with invalid directory', () => {
    const result = commands.execute('cd', ['invalid']);
    expect(result.type).toBe('error');
    expect(result.output).toContain('Directory not found');
  });

  it('executes pwd command', () => {
    const result = commands.execute('pwd', []);
    expect(result.type).toBe('success');
    expect(result.output).toBe('~');
  });

  it('executes cat command with valid file', () => {
    const result = commands.execute('cat', ['about.txt']);
    expect(result.type).toBe('success');
    expect(result.output).toContain('Welcome to my terminal interface');
  });

  it('executes cat command with invalid file', () => {
    const result = commands.execute('cat', ['invalid.txt']);
    expect(result.type).toBe('error');
    expect(result.output).toContain('File not found');
  });

  it('executes echo command', () => {
    const result = commands.execute('echo', ['Hello', 'World']);
    expect(result.type).toBe('success');
    expect(result.output).toBe('Hello World');
  });

  it('executes neofetch command', () => {
    const result = commands.execute('neofetch', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('OS:');
  });

  it('executes exit command', () => {
    const result = commands.execute('exit', []);
    expect(result.type).toBe('info');
    expect(result.output).toContain('Goodbye');
  });

  it('handles unknown command', () => {
    const result = commands.execute('unknown', []);
    expect(result.type).toBe('error');
    expect(result.output).toContain('Command not found');
  });

  it('handles empty command', () => {
    const result = commands.execute('', []);
    expect(result.type).toBe('error');
    expect(result.output).toContain('Command not found');
  });
}); 