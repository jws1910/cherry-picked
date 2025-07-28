import React, { useState } from 'react';
import './SearchBar.css';
import brandsConfig from './brands-config.json';
import brandImagesConfig from './brand-images-config.json';

const SearchBar = ({ allSalesData, onSearchResult }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      
      // Search through all brands
      const allBrands = Object.entries(brandsConfig.brands);
      const matchingBrands = allBrands.filter(([brandKey, brandConfig]) => 
        brandConfig.name.toLowerCase().includes(query) ||
        brandKey.toLowerCase().includes(query)
      );

      if (matchingBrands.length === 0) {
        setSearchResults({ found: false, message: 'Brand not found' });
      } else {
        // Check if any matching brands are on sale
        const brandsWithSaleStatus = matchingBrands.map(([brandKey, brandConfig]) => {
          const saleData = allSalesData?.allResults?.find(
            result => result.brandKey === brandKey
          );
          
          return {
            brandKey,
            brandName: brandConfig.name,
            brandUrl: brandConfig.url,
            saleFound: saleData?.saleFound || false,
            saleText: saleData?.saleText || '',
            salePercentage: saleData?.salePercentage || null,
            saleCategory: saleData?.saleCategory || null
          };
        });

        const onSaleBrands = brandsWithSaleStatus.filter(brand => brand.saleFound);
        
        if (onSaleBrands.length === 0) {
          setSearchResults({ 
            found: false, 
            message: `${matchingBrands[0].brandConfig.name} is currently not on sale`,
            brandName: matchingBrands[0].brandConfig.name
          });
        } else {
          setSearchResults({ 
            found: true, 
            brands: onSaleBrands 
          });
        }
      }
      
      setIsSearching(false);
    }, 500);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    onSearchResult(null);
  };

  const renderBrandCard = (brandData) => {
    const brandImageConfig = brandImagesConfig.brandImages[brandData.brandKey];
    const useImages = brandImagesConfig.settings.useImages;
    const fallbackToText = brandImagesConfig.settings.fallbackToText;
    
    return (
      <div className="search-brand-card">
        <div className="brand-logo-container">
          {useImages && brandImageConfig ? (
            <img 
              src={brandImageConfig.imagePath}
              alt={brandImageConfig.altText}
              style={{
                width: brandImageConfig.width || brandImagesConfig.settings.defaultWidth,
                height: brandImageConfig.height || brandImagesConfig.settings.defaultHeight,
                maxWidth: '100%',
                objectFit: 'contain'
              }}
              className="brand-logo"
              onError={(e) => {
                if (fallbackToText) {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }
              }}
            />
          ) : null}
          {(!useImages || !brandImageConfig || fallbackToText) && (
            <span className="brand-text" style={{ display: useImages && brandImageConfig ? 'none' : 'block' }}>
              {brandData.brandName}
            </span>
          )}
        </div>
        
        {brandData.saleFound && (
          <div className="sale-info">
            <div className="sale-text">{brandData.saleText}</div>
            {brandData.salePercentage && (
              <div className="sale-percentage">{brandData.salePercentage}</div>
            )}
          </div>
        )}
        
        <a 
          href={brandData.brandUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="shop-now-btn"
        >
          Shop Now
        </a>
      </div>
    );
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search for a brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {searchResults && (
        <div className="search-results">
          {searchResults.found ? (
            <div className="search-results-content">
              <h3>Search Results</h3>
              <div className="search-brands-grid">
                {searchResults.brands.map(brand => renderBrandCard(brand))}
              </div>
            </div>
          ) : (
            <div className="no-results">
              <h3>No Sale Found</h3>
              <p>{searchResults.message}</p>
              {searchResults.brandName && (
                <p className="brand-suggestion">
                  Try searching for "{searchResults.brandName}" later when they have sales!
                </p>
              )}
            </div>
          )}
          <button onClick={clearSearch} className="clear-search-btn">
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 