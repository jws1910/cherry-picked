import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

// Import brand images configuration
import brandImagesConfig from './brand-images-config.json';
import countryConfig from './country-config.json';
import CountrySelector from './CountrySelector';
import Login from './Login';
import YourBrands from './YourBrands';
import SearchBar from './SearchBar';
import HeroBanner from './HeroBanner';
import LoadingPage from './LoadingPage';
import SaleTypeMenu from './SaleTypeMenu';
import AdminPanel from './AdminPanel';

function App() {
  const [allSalesData, setAllSalesData] = useState(null);
  const [partialResults, setPartialResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selectedSaleType, setSelectedSaleType] = useState('all');
  const [user, setUser] = useState(null);
  const [showLoadingPage, setShowLoadingPage] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return localStorage.getItem('selectedCountry') || null;
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const checkAllSales = async () => {
    setLoading(true);
    setError(null);
    setPartialResults(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      
      // Use streaming API to get results incrementally
      const response = await fetch(`http://localhost:3001/api/check-all-sales?country=${selectedCountry}&stream=true`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'brand-result') {
                // Add individual brand result to partial results
                setPartialResults(prev => {
                  if (!prev) {
                    return {
                      results: [data.result],
                      categorizedResults: {},
                      country: selectedCountry,
                      timestamp: new Date().toISOString()
                    };
                  }
                  return {
                    ...prev,
                    results: [...prev.results, data.result]
                  };
                });
              } else if (data.type === 'categorized-update') {
                // Update categorized results
                setPartialResults(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    categorizedResults: data.categorizedResults
                  };
                });
              } else if (data.type === 'complete') {
                // Final complete result
                setAllSalesData(data);
                setPartialResults(null);
                setLastRefresh(new Date());
                setLoading(false);
                return;
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      if (error.name === 'AbortError') {
        setError('Request was cancelled.');
      } else {
        setError('Failed to fetch sales data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    // Clear any existing data when country changes
    setAllSalesData(null);
    setError(null);
  };

  const handleCountryChange = () => {
    setSelectedCountry(null);
    localStorage.removeItem('selectedCountry');
    setAllSalesData(null);
    setError(null);
  };

  const handleLogin = async (userData) => {
    try {
      // Load complete user profile from database
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setUser(response.data.user);
        setShowLoadingPage(true);
      } else {
        console.error('Failed to load user profile');
        setUser(userData); // Fallback to login data
        setShowLoadingPage(true);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setUser(userData); // Fallback to login data
      setShowLoadingPage(true);
    }
  };

  const handleLogout = () => {
    // Clear all localStorage first
    localStorage.removeItem('cherryUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedCountry');
    
    // Clear all state
    setUser(null);
    setSelectedCountry(null);
    setShowLoadingPage(false);
    setAllSalesData(null);
    setError(null);
    setLoading(false);
    setLastRefresh(null);
    setSelectedSaleType('all');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLoadingComplete = () => {
    setShowLoadingPage(false);
  };

  const handleSaleTypeChange = (saleType) => {
    setSelectedSaleType(saleType);
  };

  const handleSearchResult = (result) => {
    // Handle search results if needed
  };

  useEffect(() => {
    // Only check for sales if a country is selected and user is logged in
    if (selectedCountry && user) {
      checkAllSales();
      
      // Set up automatic refresh every 24 hours
      const interval = setInterval(() => {
        checkAllSales();
      }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      
      return () => clearInterval(interval);
    }
  }, [selectedCountry, user]);

  const renderBrandCard = (brandData) => {
    const brandImageConfig = brandImagesConfig.brandImages[brandData.brandKey];
    const useImages = brandImagesConfig.settings.useImages;
    const fallbackToText = brandImagesConfig.settings.fallbackToText;
    
    return (
      <div key={brandData.brandKey} className="brand-card">
        <div className="brand-name">
          <a 
            href={brandData.brandUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="brand-link"
          >
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
          </a>
        </div>
        {brandData.saleFound ? (
          <>
            <div className="brand-button">
              {brandData.brandName.split(' ')[0]}
            </div>
            {brandData.salePercentage && (
              <div className="sale-percentage">
                Up to {brandData.salePercentage}% OFF
              </div>
            )}
            <div className="sale-text">
              {brandData.saleText}
            </div>
          </>
        ) : (
          <div className="no-sale-text">No sale found</div>
        )}
      </div>
    );
  };

  const renderSaleSection = (title, sales, category) => {
    if (!sales || sales.length === 0) return null;
    
    return (
      <div className="sale-section">
        <h2 className="section-title">{title}</h2>
        <div className="brands-grid">
          {sales.map(renderBrandCard)}
        </div>
      </div>
    );
  };

  const getCategoryDisplayName = (categoryKey) => {
    const categoryNames = {
      'end-of-season': 'End of Season Sale',
      'flash-sale': 'Flash Sale',
      'fifty-percent': '50% Off Sale',
      'forty-percent': '40% Off Sale',
      'sixty-percent': '60% Off Sale',
      'seventy-percent': '70% Off Sale',
      'winter-sale': 'Winter Sale',
      'student-sale': 'Student Sale',
      'new-member': 'New Member Sale',
      'black-friday': 'Black Friday Sale',
      'christmas': 'Christmas Sale',
      'summer': 'Summer Sale',
      'other-sales': 'Other Sales'
    };
    return categoryNames[categoryKey] || categoryKey;
  };

  // Show loading page if user just logged in
  if (showLoadingPage && user) {
    return <LoadingPage user={user} onLoadingComplete={handleLoadingComplete} />;
  }

  // Show login if no user is logged in
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Show admin panel if requested
  if (showAdminPanel) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} />;
  }

  return (
    <div className="App">
      {/* Hero Banner at the very top */}
      <HeroBanner allSalesData={allSalesData} />
      
      <header className="App-header">
        {selectedCountry ? (
          <>
            <div className="header-top">
              <div className="logo-container">
                <img src="/logo.png" alt="cherry-picker" className="app-logo" />
              </div>
              <div className="brand-name-center">
                <h1 className="app-brand-name">cherry-picked</h1>
              </div>
              <div className="header-actions">
                <button 
                  className="country-change-btn"
                  onClick={handleCountryChange}
                  title="Change country"
                >
                  {countryConfig.countries[selectedCountry]?.flag || '🇺🇸'} {countryConfig.countries[selectedCountry]?.name || 'United States'}
                </button>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            </div>
            <p>Your Curated Compass for Fashion Sales</p>
            <div className="refresh-info">
              <span>Auto-refresh every 24 hours</span>
              {lastRefresh && (
                <span className="last-refresh">
                  Last updated: {lastRefresh.toLocaleString()}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="header-actions">
            <button 
              className="admin-btn"
              onClick={() => setShowAdminPanel(true)}
              title="Admin Panel"
            >
              Admin
            </button>
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </button>
          </div>
        )}
        
        {user && !selectedCountry && (
          <CountrySelector onCountrySelect={handleCountrySelect} />
        )}

        {user && selectedCountry && !showLoadingPage && (
          <>
            <div className="country-header">
              <h2>Sales in {countryConfig.countries[selectedCountry]?.name || 'United States'}</h2>
              <button onClick={handleCountryChange} className="change-country-btn">
                Change Country
              </button>
            </div>

            <YourBrands user={user} onUpdateUser={handleUpdateUser} />
            
            {loading && !partialResults ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Checking all brands for sales...</p>
                <p className="loading-subtext">This may take a few minutes</p>
              </div>
            ) : (allSalesData || partialResults) ? (
              <>
                <SaleTypeMenu 
                  selectedSaleType={selectedSaleType} 
                  onSaleTypeChange={handleSaleTypeChange} 
                />
                
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {loading && partialResults && (
                  <div className="partial-loading">
                    <div className="loading-spinner"></div>
                    <p>Still checking for more sales...</p>
                  </div>
                )}

                {lastRefresh && (
                  <div className="last-refresh">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </div>
                )}

                {Object.entries((allSalesData || partialResults).categorizedResults).map(([category, sales]) => {
                  if (selectedSaleType !== 'all' && category !== selectedSaleType) {
                    return null;
                  }
                  
                  if (sales.length === 0) {
                    return null;
                  }
                  
                  return renderSaleSection(
                    getCategoryDisplayName(category),
                    sales,
                    category
                  );
                })}
              </>
            ) : (
              <div className="no-data-message">
                <p>No sales data available. Please wait while we check for sales...</p>
              </div>
            )}
          </>
        )}
      </header>
      
      <main className="App-main">
        <div className="sale-checker">
          
          {/* Sales Results */}
          {allSalesData && (
            <div className="sale-results">
              {/* Your Brands with Sale Status */}
              {user && user.favoriteBrands && user.favoriteBrands.length > 0 && (allSalesData || partialResults)?.results && (
                <div className="sale-section">
                  <h2 className="section-title">Your Brands</h2>
                  <div className="brands-grid">
                    {user.favoriteBrands.map(brandKey => {
                      const brandData = (allSalesData || partialResults).results.find(
                        result => result.brandKey === brandKey
                      );
                      if (brandData) {
                        return (
                          <div 
                            key={brandKey} 
                            className={`brand-card ${brandData.saleFound ? 'on-sale' : ''}`}
                          >
                            {renderBrandCard(brandData)}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
              
              {allSalesData?.categorizedResults && Object.entries(allSalesData.categorizedResults).map(([categoryKey, sales]) => 
                renderSaleSection(
                  getCategoryDisplayName(categoryKey),
                  sales,
                  categoryKey
                )
              )}
              
              {allSalesData?.categorizedResults && Object.values(allSalesData.categorizedResults).every(sales => !sales || sales.length === 0) && (
                <div className="no-sales">
                  <p>No sales found across all brands</p>
                  <div className="timestamp">
                    Last checked: {allSalesData?.timestamp ? new Date(allSalesData.timestamp).toLocaleString() : 'Never'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 