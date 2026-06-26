"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Simple translation function
  const t = (key) => {
    if (!key) return '';
    return translations[key]?.[language] || key;
  };

  // Load translations
  const loadTranslations = async (lang) => {
    try {
      setIsLoading(true);
      // Load translations from your API or local files
      // For now, we'll use a simple object
      const response = await fetch(`/api/translate?lang=${lang}`);
      
      if (!response.ok) {
        console.warn(`Translation API not found for ${lang}, using fallback.`);
        setTranslations(prev => ({ ...prev, [lang]: {} }));
        return;
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setTranslations(prev => ({
          ...prev,
          [lang]: data
        }));
      } else {
        console.warn('Translation API did not return JSON');
        setTranslations(prev => ({ ...prev, [lang]: {} }));
      }
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Change language
  const changeLanguage = (lang) => {
    if (language !== lang) {
      setLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
      loadTranslations(lang);
    }
  };

  // Load preferred language on mount
  useEffect(() => {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(preferredLanguage);
    loadTranslations(preferredLanguage);
  }, []);

  return (
    <TranslationContext.Provider value={{ t, language, changeLanguage, isLoading }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
