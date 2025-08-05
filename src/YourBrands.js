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
  const [loading, setLoading] = useState(false);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
              <p>Add Brand</p>
            </div>
          </div>
        )}
      </div>

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
              <button 
                className="add-brand-btn"
                onClick={handleAddBrandClick}
                type="button"
              >
                + Add Brand
              </button>
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