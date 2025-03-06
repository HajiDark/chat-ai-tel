"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'fa'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    home: 'Home',
    history: 'History',
    about: 'About',
    settings: 'Settings',
    generate: 'Generate',
    prompt: 'Enter your prompt',
    download: 'Download',
    delete: 'Delete',
    deleteAll: 'Delete All',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    developer: 'Developer',
    contact: 'Contact',
    loading: 'Loading...',
    noHistory: 'No history found',
    generatedAt: 'Generated at',
    downloadAs: 'Download as',
    clearPrompt: 'Clear',
    noPrompt: 'Please enter a prompt',
    generationError: 'Error generating image',
    deleteConfirm: 'Are you sure you want to delete this image?',
    deleteAllConfirm: 'Are you sure you want to delete all images?',
    yes: 'Yes',
    no: 'No',
    copied: 'Copied to clipboard',
    aboutText: 'Dog AI is a modern AI image generation platform that allows you to generate beautiful images.',
    dimensionHelp: 'Width & height must be between <strong>256</strong> and <strong>1440</strong>, and multiples of <strong>16</strong>.',
    width: 'Width',
    height: 'Height',
    enhancePrompt: 'Enhance prompt with AI',
    enhancing: 'Enhancing prompt...',
    enhanced: 'Prompt enhanced successfully',
    enhanceError: 'Failed to enhance prompt',
  },
  fa: {
    home: 'خانه',
    history: 'تاریخچه',
    about: 'درباره',
    settings: 'تنظیمات',
    generate: 'ایجاد',
    prompt: 'متن خود را وارد کنید',
    download: 'دانلود',
    delete: 'حذف',
    deleteAll: 'حذف همه',
    darkMode: 'حالت تاریک',
    lightMode: 'حالت روشن',
    language: 'زبان',
    developer: 'توسعه دهنده',
    contact: 'تماس',
    loading: 'در حال بارگذاری...',
    noHistory: 'تاریخچه‌ای یافت نشد',
    generatedAt: 'ایجاد شده در',
    downloadAs: 'دانلود به عنوان',
    clearPrompt: 'پاک کردن',
    noPrompt: 'لطفا یک متن وارد کنید',
    generationError: 'خطا در ایجاد تصویر',
    deleteConfirm: 'آیا مطمئن هستید که می‌خواهید این تصویر را حذف کنید؟',
    deleteAllConfirm: 'آیا مطمئن هستید که می‌خواهید همه تصاویر را حذف کنید؟',
    yes: 'بله',
    no: 'خیر',
    copied: 'در کلیپ بورد کپی شد',
    aboutText: 'داگ ای‌آی یک پلتفرم مدرن تولید تصویر با هوش مصنوعی است که به شما امکان می‌دهد تصاویر زیبایی ایجاد کنید.',
    dimensionHelp: 'عرض و ارتفاع باید بین <strong>256</strong> تا <strong>1440</strong> و مضربی از <strong>16</strong> باشند.',
    width: 'عرض',
    height: 'ارتفاع',
    enhancePrompt: 'بهبود متن با هوش مصنوعی',
    enhancing: 'در حال بهبود متن...',
    enhanced: 'متن با موفقیت بهبود یافت',
    enhanceError: 'خطا در بهبود متن',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage) {
      setLanguageState(savedLanguage)
    } else {
      setLanguageState('fa')
      localStorage.setItem('language', 'fa')
    }

    if (savedLanguage === 'fa' || !savedLanguage) {
      document.documentElement.dir = 'rtl'
    } else if (savedLanguage === 'en' || !savedLanguage) {
      document.documentElement.dir = 'ltr'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)

    // Set RTL direction for Farsi
    if (lang === 'fa') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}