import { renderHook, act } from '@testing-library/react';
import { useTerminal } from '../hooks/useTerminal';
import { projects } from '../data/projects';

describe('useTerminal', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useTerminal(projects));
    expect(result.current.state).toEqual({
      history: [],
      currentDirectory: '~',
      isDetailsPanelOpen: false,
      selectedProject: null
    });
  });

  it('executes command and updates history', () => {
    const { result } = renderHook(() => useTerminal(projects));
    act(() => {
      result.current.executeCommand('help');
    });
    expect(result.current.state.history).toHaveLength(1);
    expect(result.current.state.history[0].command).toBe('help');
    expect(result.current.state.history[0].type).toBe('success');
  });

  it('navigates command history', () => {
    const { result } = renderHook(() => useTerminal(projects));
    act(() => {
      result.current.executeCommand('help');
      result.current.executeCommand('about');
    });

    let command;
    act(() => {
      command = result.current.navigateHistory('up');
    });
    expect(command).toBe('about');

    act(() => {
      command = result.current.navigateHistory('up');
    });
    expect(command).toBe('help');

    act(() => {
      command = result.current.navigateHistory('down');
    });
    expect(command).toBe('about');
  });

  it('gets command suggestions', () => {
    const { result } = renderHook(() => useTerminal(projects));
    const suggestions = result.current.getCommandSuggestions('h');
    expect(suggestions).toContainEqual(expect.objectContaining({ command: 'help' }));
  });

  it('opens and closes details panel', () => {
    const { result } = renderHook(() => useTerminal(projects));
    act(() => {
      result.current.openDetailsPanel(projects[0]);
    });
    expect(result.current.state.isDetailsPanelOpen).toBe(true);
    expect(result.current.state.selectedProject).toBe(projects[0]);

    act(() => {
      result.current.closeDetailsPanel();
    });
    expect(result.current.state.isDetailsPanelOpen).toBe(false);
    expect(result.current.state.selectedProject).toBe(null);
  });

  it('handles empty command history navigation', () => {
    const { result } = renderHook(() => useTerminal(projects));
    let command;
    act(() => {
      command = result.current.navigateHistory('up');
    });
    expect(command).toBe('');

    act(() => {
      command = result.current.navigateHistory('down');
    });
    expect(command).toBe('');
  });

  it('handles empty command suggestions', () => {
    const { result } = renderHook(() => useTerminal(projects));
    const suggestions = result.current.getCommandSuggestions('');
    expect(suggestions).toHaveLength(0);
  });

  it('handles invalid command', () => {
    const { result } = renderHook(() => useTerminal(projects));
    act(() => {
      result.current.executeCommand('invalid');
    });
    expect(result.current.state.history[0].type).toBe('error');
    expect(result.current.state.history[0].output).toContain('Command not found');
  });

  it('handles directory navigation', () => {
    const { result } = renderHook(() => useTerminal(projects));
    act(() => {
      result.current.executeCommand('cd projects');
    });
    expect(result.current.state.currentDirectory).toBe('~/projects');

    act(() => {
      result.current.executeCommand('cd ..');
    });
    expect(result.current.state.currentDirectory).toBe('~');
  });

  it('handles file reading', () => {
    const { result } = renderHook(() => useTerminal(projects));
    act(() => {
      result.current.executeCommand('cat about.txt');
    });
    expect(result.current.state.history[0].type).toBe('success');
    expect(result.current.state.history[0].output).toContain('Welcome to my terminal interface');
  });
}); 