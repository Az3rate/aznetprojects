import { TerminalCommands } from '../services/commands';
import { projects } from '../data/projects';

describe('TerminalCommands', () => {
  let commands: TerminalCommands;

  beforeEach(() => {
    commands = new TerminalCommands(projects);
  });

  it('executes help command', async () => {
    const result = await commands.execute('help', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('help        - Show this help message');
  });

  it('executes clear command', async () => {
    const result = await commands.execute('clear', []);
    expect(result.type).toBe('success');
    expect(result.output).toBe('');
  });

  it('executes about command', async () => {
    const result = await commands.execute('about', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('Welcome to my terminal interface');
  });

  it('executes projects command', async () => {
    const result = await commands.execute('projects', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('Terminal Interface');
  });

  it('executes contact command', async () => {
    const result = await commands.execute('contact', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('GitHub:');
  });

  it('executes ls command', async () => {
    const result = await commands.execute('ls', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('projects');
    expect(result.output).toContain('about.txt');
  });

  it('executes cd command with valid directory', async () => {
    const result = await commands.execute('cd', ['projects']);
    expect(result.type).toBe('success');
    expect(result.output).toBe('');
  });

  it('executes cd command with invalid directory', async () => {
    const result = await commands.execute('cd', ['invalid']);
    expect(result.type).toBe('error');
    expect(result.output).toContain('Directory not found');
  });

  it('executes pwd command', async () => {
    const result = await commands.execute('pwd', []);
    expect(result.type).toBe('success');
    expect(result.output).toBe('~');
  });

  it('executes cat command with valid file', async () => {
    const result = await commands.execute('cat', ['about.txt']);
    expect(result.type).toBe('success');
    expect(result.output).toContain('Welcome to my terminal interface');
  });

  it('executes cat command with invalid file', async () => {
    const result = await commands.execute('cat', ['invalid.txt']);
    expect(result.type).toBe('error');
    expect(result.output).toContain('File not found');
  });

  it('executes echo command', async () => {
    const result = await commands.execute('echo', ['Hello', 'World']);
    expect(result.type).toBe('success');
    expect(result.output).toBe('Hello World');
  });

  it('executes neofetch command', async () => {
    const result = await commands.execute('neofetch', []);
    expect(result.type).toBe('success');
    expect(result.output).toContain('OS:');
  });

  it('executes exit command', async () => {
    const result = await commands.execute('exit', []);
    expect(result.type).toBe('info');
    expect(result.output).toContain('Goodbye');
  });

  it('handles unknown command', async () => {
    const result = await commands.execute('unknown', []);
    expect(result.type).toBe('error');
    expect(result.output).toContain('Command not found');
  });

  it('handles empty command', async () => {
    const result = await commands.execute('', []);
    expect(result.type).toBe('error');
    expect(result.output).toContain('Command not found');
  });
}); 