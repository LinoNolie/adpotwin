import React, { useState } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'es', name: 'Español', flag: 'es' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'zh', name: '中文', flag: 'cn' },
  { code: 'hi', name: 'हिन्दी', flag: 'in' },
  { code: 'ja', name: '日本語', flag: 'jp' },
  { code: 'th', name: 'ไทย', flag: 'th' }
];

export const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
    setIsOpen(false);
  };

  return (
    <div className="lang-switcher-container">
      <button 
        className="lang-switcher"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src={`https://flagcdn.com/16x12/${selectedLang.flag}.png`}
          srcSet={`https://flagcdn.com/32x24/${selectedLang.flag}.png 2x,
                  https://flagcdn.com/48x36/${selectedLang.flag}.png 3x`}
          width="16"
          height="12"
          alt={selectedLang.name}
        />
        <span>{selectedLang.code.toUpperCase()}</span>
      </button>
      <div className={`lang-dropdown ${isOpen ? 'show' : ''}`}>
        {languages.map((lang) => (
          <button 
            key={lang.code}
            className="lang-option"
            onClick={() => handleLanguageSelect(lang)}
          >
            <img
              src={`https://flagcdn.com/16x12/${lang.flag}.png`}
              srcSet={`https://flagcdn.com/32x24/${lang.flag}.png 2x,
                      https://flagcdn.com/48x36/${lang.flag}.png 3x`}
              width="16"
              height="12"
              alt={lang.name}
            />
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
