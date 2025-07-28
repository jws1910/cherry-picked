import React, { useState } from 'react';
import countryConfig from './country-config.json';
import './CountrySelector.css';

function CountrySelector({ onCountrySelect }) {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    // Store the selection in localStorage for persistence
    localStorage.setItem('selectedCountry', countryCode);
    onCountrySelect(countryCode);
  };

  // Only show United States since all brand websites are US-based
  const usCountry = countryConfig.countries.us;

  return (
    <div className="country-selector">
      <div className="selector-container">
        <div className="selector-header">
          <div className="logo-container">
            <img src="/logo.png" alt="cherry-picker" className="app-logo" />
          </div>
          <p>Welcome to cherry-picked</p>
          <p className="subtitle">Your personal fashion sale tracker</p>
        </div>
        
        <div className="countries-grid">
          <div
            className={`country-card ${selectedCountry === 'us' ? 'selected' : ''}`}
            onClick={() => handleCountrySelect('us')}
          >
            <div className="country-flag">{usCountry.flag}</div>
            <div className="country-info">
              <h3>{usCountry.name}</h3>
              <p className="currency">{usCountry.currency}</p>
            </div>
            <div className="country-arrow">→</div>
          </div>
        </div>
        
        <div className="selector-footer">
          <p>Currently supporting US-based brand websites</p>
        </div>
      </div>
    </div>
  );
}

export default CountrySelector; 