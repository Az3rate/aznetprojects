import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Terminal } from '../components/Terminal/Terminal';
import { projects } from '../data/projects';
import { ThemeProvider } from '../styles/ThemeProvider';

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Terminal', () => {
  it('renders the terminal interface', () => {
    renderWithTheme(<Terminal />);
    expect(screen.getByText('user@aznet:~$')).toBeInTheDocument();
  });

  it('executes commands and displays output', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.getByText(/help\s+-\sShow this help message/)).toBeInTheDocument();
  });

  it('navigates command history with arrow keys', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('help');
    
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('help');
  });

  it('shows command suggestions', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: 'h' } });
    const suggestions = screen.getByRole('list', { name: /suggestions/i });
    expect(suggestions).toHaveTextContent('help');
  });

  it('opens and closes the details panel', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: 'projects' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.getAllByText(/A powerful web-based utility tool for Diablo 4 players/)[0]).toBeInTheDocument();
  });

  it('handles Tab key for command completion', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: 'h' } });
    fireEvent.keyDown(input, { key: 'Tab' });
    
    expect(input).toHaveValue('help');
  });

  it('handles Escape key to clear suggestions', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: 'h' } });
    const suggestions = screen.getByRole('list', { name: /suggestions/i });
    expect(suggestions).toHaveTextContent('help');
    
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('list', { name: /suggestions/i })).not.toBeInTheDocument();
  });

  it('navigates suggestions with arrow keys', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: 'h' } });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.getByText(/help\s+-\sShow this help message/)).toBeInTheDocument();
  });

  it('handles clicking on suggestions', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: 'h' } });
    const suggestion = screen.getByRole('listitem', { name: /help/i });
    fireEvent.click(suggestion);
    
    expect(input).toHaveValue('help');
  });

  it('handles empty input', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByPlaceholderText('Type a command...');
    
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(input).toHaveValue('');
  });
}); 