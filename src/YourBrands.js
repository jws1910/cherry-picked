import React, { useState, useEffect } from 'react';
import axios from 'axios';
import brandsConfig from './brands-config.json';
import './YourBrands.css';

const YourBrands = ({ user, onUpdateUser, allSalesData }) => {
  const [selectedBrands, setSelectedBrands] = useState(user?.favoriteBrands || []);
  const [pendingBrands, setPendingBrands] = useState(user?.favoriteBrands || []); // New state for pending changes
  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [requestBrandSubmitting, setRequestBrandSubmitting] = useState(false);
  const [newlyDiscoveredBrands, setNewlyDiscoveredBrands] = useState([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);

  // Load favorite brands from database on component mount
  useEffect(() => {
    const loadFavoriteBrands = async () => {
      if (user) {
        try {
          console.log('🔍 Loading favorite brands for user:', user.email);
          console.log('👤 User ID:', user.id);
          const authToken = localStorage.getItem('token');
          console.log('🔑 Auth token for loading:', authToken ? 'Present' : 'Missing');
          
          const response = await axios.get('http://localhost:3001/api/auth/favorite-brands', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          console.log('✅ Load response:', response.data);

          if (response.data.success) {
            console.log('📋 Loaded favorite brands from database:', response.data.favoriteBrands);
            setSelectedBrands(response.data.favoriteBrands);
            setPendingBrands(response.data.favoriteBrands);
            setHasUnsavedChanges(false);
            // Update user object with favorite brands from database
            const updatedUser = { ...user, favoriteBrands: response.data.favoriteBrands };
            onUpdateUser(updatedUser);
          } else {
            console.error('❌ Failed to load favorite brands:', response.data);
          }
        } catch (error) {
          console.error('❌ Error loading favorite brands:', error);
          console.error('❌ Error response:', error.response?.data);
          console.error('❌ Error status:', error.response?.status);
          console.error('❌ Error message:', error.message);
        }
      } else {
        console.log('⚠️ No user available for loading favorite brands');
      }
    };

    loadFavoriteBrands();
  }, [user?.id]); // Only depend on user ID, not the entire user object or onUpdateUser function

  // Load newly discovered brands
  useEffect(() => {
    const loadNewlyDiscoveredBrands = async () => {
      if (user) {
        try {
          setDiscoveryLoading(true);
          const authToken = localStorage.getItem('token');
          
          const response = await axios.get('http://localhost:3001/api/discovery/current', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (response.data.success) {
            console.log('✨ Loaded newly discovered brands:', response.data.discoveries);
            setNewlyDiscoveredBrands(response.data.discoveries);
          }
        } catch (error) {
          console.error('❌ Error loading discovered brands:', error);
        } finally {
          setDiscoveryLoading(false);
        }
      }
    };

    loadNewlyDiscoveredBrands();
  }, [user?.id]);

  // Save favorite brands to database
  const saveFavoriteBrands = async (brands) => {
    try {
      console.log('💾 Saving favorite brands to database:', brands);
      console.log('👤 User ID:', user?.id);
      setLoading(true);
      const authToken = localStorage.getItem('token');
      console.log('🔑 Auth token:', authToken ? 'Present' : 'Missing');
      
      const response = await axios.post('http://localhost:3001/api/auth/favorite-brands', {
        favoriteBrands: brands
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Save response:', response.data);

      if (response.data.success) {
        // Update user object with new favorite brands
        const updatedUser = { ...user, favoriteBrands: brands };
        onUpdateUser(updatedUser);
        console.log('✅ Successfully saved favorite brands to database');
        return true;
      } else {
        console.error('❌ Failed to save favorite brands:', response.data);
        throw new Error('Failed to save favorite brands');
      }
    } catch (error) {
      console.error('❌ Error saving favorite brands:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      throw error;
    } finally {
      setLoading(false);
      console.log('🏁 Finished saving favorite brands');
    }
  };

  const handleBrandToggle = (brandKey) => {
    // Validate brandKey exists in config
    if (!brandsConfig?.brands?.[brandKey]) {
      console.error('Invalid brand key:', brandKey);
      return;
    }

    // Prevent rapid clicking
    if (selectionLoading) return;

    let newPendingBrands;
    if (pendingBrands.includes(brandKey)) {
      // Remove brand
      newPendingBrands = pendingBrands.filter(brand => brand !== brandKey);
    } else if (pendingBrands.length < 10) {
      // Add brand (if under limit)
      newPendingBrands = [...pendingBrands, brandKey];
    } else {
      // Show feedback when trying to add more than 10 brands
      alert('You can only select up to 10 brands. Please remove one before adding another.');
      return;
    }
    
    setPendingBrands(newPendingBrands);
    setHasUnsavedChanges(true);
  };



  const removeBrand = (brandKey) => {
    if (selectionLoading) return;
    
    const newPendingBrands = pendingBrands.filter(brand => brand !== brandKey);
    setPendingBrands(newPendingBrands);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!hasUnsavedChanges) return;
    
    setSelectionLoading(true);
    try {
      await saveFavoriteBrands(pendingBrands);
      setSelectedBrands(pendingBrands);
      setHasUnsavedChanges(false);
      // Update user object with new favorite brands
      const updatedUser = { ...user, favoriteBrands: pendingBrands };
      onUpdateUser(updatedUser);
    } catch (error) {
      console.error('Error saving brand selection:', error);
      // Revert the pending changes if save failed
      setPendingBrands(selectedBrands);
      setHasUnsavedChanges(false);
    } finally {
      setSelectionLoading(false);
    }
  };

  const handleCancelChanges = () => {
    setPendingBrands(selectedBrands);
    setHasUnsavedChanges(false);
  };

  const getBrandName = (brandKey) => {
    try {
      return brandsConfig?.brands?.[brandKey]?.name || brandKey;
    } catch (error) {
      console.error('Error getting brand name:', error);
      return brandKey;
    }
  };

  const getBrandUrl = (brandKey) => {
    try {
      return brandsConfig?.brands?.[brandKey]?.url || '#';
    } catch (error) {
      console.error('Error getting brand URL:', error);
      return '#';
    }
  };

  const isBrandOnSale = (brandKey) => {
    if (!allSalesData?.results) return false;
    const brandData = allSalesData.results.find(result => result.brandKey === brandKey);
    return brandData?.saleFound || false;
  };

  const getSaleInfo = (brandKey) => {
    if (!allSalesData?.results) return null;
    const brandData = allSalesData.results.find(result => result.brandKey === brandKey);
    if (!brandData?.saleFound) return null;
    
    return {
      saleText: brandData.saleText || 'Sale',
      salePercentage: brandData.salePercentage,
      brandUrl: brandData.brandUrl || getBrandUrl(brandKey)
    };
  };

  const handleAddBrand = async () => {
    if (newBrandName.trim() && newBrandWebsite.trim()) {
      try {
        const authToken = localStorage.getItem('token');
        const response = await axios.post('http://localhost:3001/api/brand-requests/submit', {
          brandName: newBrandName.trim(),
          brandWebsite: newBrandWebsite.trim()
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          alert('Brand request submitted successfully! An admin will review your request.');
          // Reset form
          setNewBrandName('');
          setNewBrandWebsite('');
          setShowAddBrandModal(false);
        } else {
          alert('Failed to submit brand request. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting brand request:', error);
        alert('Error submitting brand request. Please try again.');
      }
    } else {
      alert('Please fill in both brand name and website.');
    }
  };

  const handleAddBrandClick = () => {
    setShowAddBrandModal(true);
  };

  // Handle discovery brand interactions
  const handleDiscoveryAction = async (brandId, action) => {
    try {
      const authToken = localStorage.getItem('token');
      
      if (action === 'add_to_favorites') {
        // Add to favorite brands
        const newPendingBrands = [...pendingBrands, brandId];
        if (newPendingBrands.length <= 10) {
          setPendingBrands(newPendingBrands);
          setHasUnsavedChanges(true);
          
          // Update discovery status
          await axios.post('http://localhost:3001/api/discovery/status', {
            brandId,
            status: 'added_to_favorites'
          }, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
        } else {
          alert('You can only have up to 10 favorite brands.');
          return;
        }
      }
      
      // Update discovery status
      await axios.post('http://localhost:3001/api/discovery/status', {
        brandId,
        status: action
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Update local state
      setNewlyDiscoveredBrands(prevDiscoveries =>
        prevDiscoveries.map(discovery =>
          discovery.brandId === brandId
            ? { ...discovery, status: action }
            : discovery
        )
      );
    } catch (error) {
      console.error('Error updating discovery status:', error);
    }
  };

  const generateNewDiscoveries = async () => {
    try {
      setDiscoveryLoading(true);
      const authToken = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:3001/api/discovery/generate', {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setNewlyDiscoveredBrands(response.data.discoveries || []);
        alert(`Generated ${response.data.discoveries?.length || 0} new brand discoveries!`);
      } else {
        alert(response.data.message || 'No new discoveries available this month.');
      }
    } catch (error) {
      console.error('Error generating discoveries:', error);
      alert('Error generating new discoveries. Please try again.');
    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Add error boundary
  if (!brandsConfig || !brandsConfig.brands) {
    return (
      <div className="your-brands-container">
        <div className="your-brands-header">
          <h2>Your Brands</h2>
          <p>Error loading brands configuration. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="your-brands-container">
      <div className="your-brands-header">
        <h2>Your Brands</h2>
        <p>Track up to 10 of your favorite brands</p>
        <button 
          className="manage-brands-btn"
          onClick={() => setShowBrandSelector(!showBrandSelector)}
          type="button"
          disabled={loading}
        >
          {loading ? 'Saving...' : (showBrandSelector ? 'Done' : 'Manage Brands')}
        </button>
      </div>

      <div className="your-brands-grid">
        {selectedBrands.map((brandKey) => {
          const isOnSale = isBrandOnSale(brandKey);
          
          return (
            <div key={brandKey} className={`favorite-brand-card ${isOnSale ? 'on-sale' : ''}`}>
              <div className="brand-info">
                <h3>{getBrandName(brandKey)}</h3>
                <a 
                  href={getBrandUrl(brandKey)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="brand-link"
                >
                  Visit Store
                </a>
              </div>
              {showBrandSelector && (
                <button 
                  className="remove-brand-btn"
                  onClick={() => removeBrand(brandKey)}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        
        {selectedBrands.length < 10 && (
          <div className="add-brand-card" onClick={() => setShowBrandSelector(true)}>
            <div className="add-brand-content">
              <span className="add-icon">+</span>
              <p>Manage Brands</p>
            </div>
          </div>
        )}
      </div>

      {/* Newly Discovered Brands Section */}
      {newlyDiscoveredBrands && newlyDiscoveredBrands.length > 0 && (
        <div className="discovered-brands-section">
          <div className="discovered-brands-header">
            <h3>✨ Newly Discovered Brands</h3>
            <p>Up to 3 brands discovered this month based on your style</p>
          </div>
          <div className="discovered-brands-grid">
            {newlyDiscoveredBrands.map((discovery) => (
              <div key={discovery.brandId} className={`discovered-brand-card ${discovery.status}`}>
                <div className="discovered-brand-info">
                  <h4>{discovery.brandInfo?.name || discovery.brandId}</h4>
                  <p className="discovery-reason">{discovery.discoveryReason}</p>
                  <p className="brand-description">{discovery.brandInfo?.description}</p>
                  {discovery.trending && (
                    <span className="trending-badge">🔥 Trending</span>
                  )}
                </div>
                <div className="discovery-actions">
                  {discovery.status === 'new' && (
                    <>
                      <button
                        className="discovery-action-btn like-btn"
                        onClick={() => handleDiscoveryAction(discovery.brandId, 'liked')}
                      >
                        👍 Like
                      </button>
                      <button
                        className="discovery-action-btn add-btn"
                        onClick={() => handleDiscoveryAction(discovery.brandId, 'add_to_favorites')}
                      >
                        ❤️ Add to Favorites
                      </button>
                    </>
                  )}
                  {discovery.status === 'liked' && (
                    <div className="discovery-status">
                      <span>👍 Liked</span>
                      <button
                        className="discovery-action-btn add-btn"
                        onClick={() => handleDiscoveryAction(discovery.brandId, 'add_to_favorites')}
                      >
                        ❤️ Add to Favorites
                      </button>
                    </div>
                  )}
                  {discovery.status === 'added_to_favorites' && (
                    <div className="discovery-status">
                      <span>❤️ Added to Favorites</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {discoveryLoading && (
            <div className="discovery-loading">
              <p>🔍 Finding new brands for you...</p>
            </div>
          )}
        </div>
      )}

      {/* Generate New Discoveries Button */}
      {(!newlyDiscoveredBrands || newlyDiscoveredBrands.length === 0) && (
        <div className="generate-discoveries-section">
          <h3>✨ Discover New Brands</h3>
          <p>Let us find new brands that match your style!</p>
          <button
            className="generate-discoveries-btn"
            onClick={generateNewDiscoveries}
            disabled={discoveryLoading}
          >
            {discoveryLoading ? 'Discovering...' : 'Discover New Brands'}
          </button>
        </div>
      )}

      {showBrandSelector && (
        <div className="brand-selector-modal">
          <div className="brand-selector-content">
            <div className="modal-header">
              <div>
                <h3>Select Your Brands ({pendingBrands.length}/10)</h3>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>
                  Click on brands to add or remove them from your favorites. Click "Save Changes" when done.
                </p>
              </div>
              <button 
                className="close-modal-btn"
                onClick={() => setShowBrandSelector(false)}
                type="button"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="available-brands-grid">
              {brandsConfig?.brands && Object.entries(brandsConfig.brands)
                .sort(([,a], [,b]) => a.name.localeCompare(b.name)) // Sort alphabetically
                .map(([brandKey, brandConfig]) => (
                <div 
                  key={brandKey} 
                  className={`available-brand-card ${pendingBrands.includes(brandKey) ? 'selected' : ''} ${selectionLoading ? 'loading' : ''}`}
                  onClick={() => handleBrandToggle(brandKey)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBrandToggle(brandKey);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${pendingBrands.includes(brandKey) ? 'Remove' : 'Add'} ${brandConfig.name}`}
                  style={{ opacity: selectionLoading ? 0.7 : 1, pointerEvents: selectionLoading ? 'none' : 'auto' }}
                >
                  <h4>{brandConfig.name}</h4>
                  <span className="selection-indicator">
                    {pendingBrands.includes(brandKey) ? '✓' : ''}
                  </span>
                  {selectionLoading && (
                    <div className="selection-loading">
                      <div className="loading-spinner-small"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="add-brand-section">
              {user?.role === 'customer' && (
                <button 
                  className="request-brand-btn"
                  onClick={handleAddBrandClick}
                  type="button"
                >
                  📝 Request New Brand
                </button>
              )}
            </div>
            <div className="modal-actions">
              {hasUnsavedChanges && (
                <div className="unsaved-changes-indicator">
                  <span>⚠️ You have unsaved changes</span>
                </div>
              )}
              <div className="button-group">
                <button 
                  className="save-changes-btn"
                  onClick={handleSaveChanges}
                  type="button"
                  disabled={selectionLoading || !hasUnsavedChanges}
                >
                  {selectionLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancelChanges}
                  type="button"
                  disabled={selectionLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showAddBrandModal && (
        <div className="brand-selector-modal">
          <div className="brand-selector-content">
            <div className="modal-header">
              <h3>{user?.role === 'admin' ? 'Add New Brand' : 'Request New Brand'}</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowAddBrandModal(false)}
                type="button"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="add-brand-form">
              <div className="form-group">
                <label htmlFor="brandName">Brand Name *</label>
                <input
                  type="text"
                  id="brandName"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Enter brand name"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="brandWebsite">Brand Website *</label>
                <input
                  type="url"
                  id="brandWebsite"
                  value={newBrandWebsite}
                  onChange={(e) => setNewBrandWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-note">
                <p>This will notify an admin to add the brand logo to the website.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="save-changes-btn"
                onClick={handleAddBrand}
                type="button"
              >
                Submit Request
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowAddBrandModal(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourBrands; 