import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

// Import brand images configuration
import brandImagesConfig from './brand-images-config.json';
import countryConfig from './country-config.json';
import CountrySelector from './CountrySelector';
import Login from './Login';
import YourBrands from './YourBrands';
// import SearchBar from './SearchBar';
import HeroBanner from './HeroBanner';
import LoadingPage from './LoadingPage';
import SaleTypeMenu from './SaleTypeMenu';
import AdminPanel from './AdminPanel';
import NotificationBell from './NotificationBell';
import FriendManager from './FriendManager';
import ChatManager from './ChatManager';
import ForumManager from './ForumManager';
import BrandForum from './BrandForum';
import MyPosts from './MyPosts';
import StyleProfile from './StyleProfile';

function App() {
  const [allSalesData, setAllSalesData] = useState(null);
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
  const [activeTab, setActiveTab] = useState('sales');
  const [totalUnreadChats, setTotalUnreadChats] = useState(0);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [selectedBrandForForum, setSelectedBrandForForum] = useState(null);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showStyleProfile, setShowStyleProfile] = useState(false);

  const checkAllSales = async () => {
    // Prevent multiple simultaneous requests
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/check-all-sales?country=${selectedCountry}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 120000 // 2 minutes timeout for the entire request
      });

      if (response.data.success) {
        setAllSalesData(response.data);
        setLastRefresh(new Date());
      } else {
        setError('Failed to fetch sales data. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. The process is taking longer than expected. Please try again.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
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



  const handleLogin = async (userData) => {
    try {
      // Load complete user profile from database
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const user = response.data.user;
        setUser(user);
        
        // Check if user is admin and redirect accordingly
        if (user.role === 'admin') {
          setShowAdminPanel(true);
        } else {
          setShowLoadingPage(true);
        }
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
    console.log('🚪 Logging out user...');
    // Clear all localStorage first
    localStorage.removeItem('cherryUser');
    localStorage.removeItem('token');
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
    console.log('✅ Logout complete');
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

  // const handleSearchResult = (result) => {
  //   // Handle search results if needed
  // };

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      console.log('🔍 Checking authentication status on app load...');
      const token = localStorage.getItem('token');
      console.log('🔑 Token found:', !!token);
      
      if (token) {
        try {
          console.log('📡 Making authentication request...');
          const response = await axios.get('http://localhost:3001/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.data.success) {
            const user = response.data.user;
            setUser(user);
            console.log('✅ User authenticated on page load:', user.email);
            
            // Check if user is admin and redirect accordingly
            if (user.role === 'admin') {
              setShowAdminPanel(true);
            }
          } else {
            console.log('❌ Invalid token, clearing localStorage');
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.log('❌ Authentication check failed:', error.response?.status, error.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        console.log('🔑 No token found in localStorage');
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []); // Only run once on app load

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
  }, [selectedCountry, user?.id]); // Only depend on user ID, not the entire user object

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
            {brandData.aiReasons && brandData.aiReasons.length > 0 && (
              <div className="ai-recommendations">
                <div className="ai-header">✨ Why we picked this for you:</div>
                <ul className="ai-reasons">
                  {brandData.aiReasons.slice(0, 2).map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
                {brandData.aiScore && (
                  <div className="ai-score">Match Score: {brandData.aiScore}/100</div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="no-sale-text">No sale found</div>
        )}
        
        <div className="brand-actions">
          <a 
            href={brandData.brandUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="visit-store-btn"
          >
            Visit Store
          </a>
          <button 
            className="brand-forum-btn"
            onClick={() => setSelectedBrandForForum({
              key: brandData.brandKey,
              name: brandData.brandName
            })}
          >
            Brand Forum
          </button>
        </div>
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
      'ai-picks': 'Sales Picked Just For You',
      'end-of-season': 'End of Season Sale',
      'flash-sale': 'Flash Sale',
      'first-order': 'First Order Deals',
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
      'refer-get': 'Refer & Get X% Sale',
      'buy-one-get-one': 'Buy One Get One Sale',
      'ten-percent': 'Up to 10% Off Sale',
      'eleven-twenty': '11-20% Off Sale',
      'twenty-one-thirty': '21-30% Off Sale',
      'thirty-one-forty': '31-40% Off Sale',
      'forty-one-fifty': '41-50% Off Sale',
      'fifty-one-sixty': '51-60% Off Sale',
      'sixty-one-seventy': '61-70% Off Sale',
      'seventy-one-eighty': '71-80% Off Sale',
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
    return <AdminPanel onBack={() => setShowAdminPanel(false)} user={user} />;
  }

  // Show brand forum if requested
  if (selectedBrandForForum) {
    return (
      <BrandForum 
        brandKey={selectedBrandForForum.key}
        brandName={selectedBrandForForum.name}
        user={user}
        onBack={() => setSelectedBrandForForum(null)}
      />
    );
  }

  // Show my posts if requested
  if (showMyPosts) {
    return (
      <MyPosts 
        user={user}
        onBack={() => setShowMyPosts(false)}
      />
    );
  }

  // Show style profile if requested
  if (showStyleProfile) {
    return (
      <StyleProfile 
        user={user}
        onUpdateUser={setUser}
        onBack={() => setShowStyleProfile(false)}
      />
    );
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
                <NotificationBell />
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
              {lastRefresh && (
                <span className="last-refresh">
                  Last updated: {lastRefresh.toLocaleString()}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="header-actions">
            {user?.role === 'admin' && (
              <>
                <NotificationBell />
                <button 
                  className="admin-btn"
                  onClick={() => setShowAdminPanel(true)}
                  title="Admin Panel"
                >
                  Admin
                </button>
              </>
            )}
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
            <YourBrands user={user} onUpdateUser={handleUpdateUser} allSalesData={allSalesData} />
            
            {/* Main Content Tabs */}
            <div className="main-tabs">
              <button 
                className={`main-tab-button ${activeTab === 'sales' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('sales');
                  setSelectedFriendId(null);
                }}
              >
                Sales
              </button>
              <button 
                className={`main-tab-button ${activeTab === 'friends' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('friends');
                  setSelectedFriendId(null);
                }}
              >
                Friends
              </button>
              <button 
                className={`main-tab-button ${activeTab === 'chats' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('chats');
                  setSelectedFriendId(null);
                }}
              >
                Chats
                {totalUnreadChats > 0 && (
                  <span className="unread-badge-tab">{totalUnreadChats}</span>
                )}
              </button>
              <button 
                className={`main-tab-button ${activeTab === 'forum' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('forum');
                  setSelectedFriendId(null);
                }}
              >
                Forum
              </button>
              <button 
                className="main-tab-button my-posts-btn"
                onClick={() => setShowMyPosts(true)}
              >
                📝 My Posts
              </button>
              <button 
                className="main-tab-button style-profile-btn"
                onClick={() => setShowStyleProfile(true)}
                data-style-profile-btn="true"
              >
                🎨 Style Profile
              </button>
            </div>
            
            {activeTab === 'sales' && (
              <>
                {loading ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Checking all brands for sales...</p>
                <p className="loading-subtext">This may take a few minutes</p>
              </div>
            ) : allSalesData ? (
              <>
                {console.log('📊 Sales data received:', allSalesData)}
                {console.log('📊 Categorized results:', allSalesData.categorizedResults)}
                {console.log('📊 Available categories:', Object.keys(allSalesData.categorizedResults || {}))}
                <SaleTypeMenu 
                  selectedSaleType={selectedSaleType} 
                  onSaleTypeChange={handleSaleTypeChange}
                  allSalesData={allSalesData}
                />
                
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}



                {lastRefresh && (
                  <div className="last-refresh">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </div>
                )}

                {Object.entries(allSalesData.categorizedResults).map(([category, sales]) => {
                  if (selectedSaleType !== 'all' && category !== selectedSaleType) {
                    return null;
                  }
                  
                  if (sales.length === 0) {
                    return null;
                  }
                  
                  return (
                    <div key={category}>
                      {renderSaleSection(
                        getCategoryDisplayName(category),
                        sales,
                        category
                      )}
                    </div>
                  );
                }                )}
              </>
            ) : (
              <div className="no-data-message">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Checking for sales...</p>
                  </div>
                ) : (
                  <p>No sales data available. Please wait while we check for sales...</p>
                )}
              </div>
            )}
              </>
            )}
            
            {activeTab === 'friends' && (
              <FriendManager 
                user={user} 
                onUpdateUser={handleUpdateUser} 
                onSwitchToChats={(friendId) => {
                  setActiveTab('chats');
                  setSelectedFriendId(friendId);
                }}
              />
            )}
            
                    {activeTab === 'chats' && (
          <ChatManager
            user={user}
            onUpdateUser={handleUpdateUser}
            onUnreadCountChange={setTotalUnreadChats}
            selectedFriendId={selectedFriendId}
          />
        )}
        {activeTab === 'forum' && (
          <ForumManager
            user={user}
            onUpdateUser={handleUpdateUser}
          />
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
              {user && user.favoriteBrands && user.favoriteBrands.length > 0 && allSalesData?.results && (
                <div className="sale-section">
                  <h2 className="section-title">Your Brands</h2>
                  <div className="brands-grid">
                    {user.favoriteBrands.map(brandKey => {
                      const brandData = allSalesData.results.find(
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
              
              {allSalesData?.categorizedResults && Object.entries(allSalesData.categorizedResults)
                .sort(([aKey], [bKey]) => {
                  // Put "other-sales" at the end
                  if (aKey === 'other-sales') return 1;
                  if (bKey === 'other-sales') return -1;
                  return 0;
                })
                .map(([categoryKey, sales]) => (
                  <div key={categoryKey}>
                    {renderSaleSection(
                      getCategoryDisplayName(categoryKey),
                      sales,
                      categoryKey
                    )}
                  </div>
                ))}
              
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