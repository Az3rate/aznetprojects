import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferences {
  hasVisited: boolean;
  userType: 'recruiter' | 'technical' | null;
  hasCompletedTour: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setUserType: (type: 'recruiter' | 'technical') => void;
  markTourCompleted: () => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  hasVisited: false,
  userType: null,
  hasCompletedTour: false,
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const STORAGE_KEY = 'hv_portfolio_preferences';

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const setUserType = (type: 'recruiter' | 'technical') => {
    setPreferences(prev => ({
      ...prev,
      userType: type,
      hasVisited: true,
    }));
  };

  const markTourCompleted = () => {
    setPreferences(prev => ({
      ...prev,
      hasCompletedTour: true,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        setUserType,
        markTourCompleted,
        resetPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}; 