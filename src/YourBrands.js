import React, { useState, useEffect } from 'react';
import axios from 'axios';
import brandsConfig from './brands-config.json';
import './YourBrands.css';

const YourBrands = ({ user, onUpdateUser }) => {
  const [selectedBrands, setSelectedBrands] = useState(user?.favoriteBrands || []);
  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [loading, setLoading] = useState(false);

  // Load favorite brands from database on component mount
  useEffect(() => {
    const loadFavoriteBrands = async () => {
      if (user) {
        try {
          const authToken = localStorage.getItem('authToken');
          const response = await axios.get('http://localhost:3001/api/auth/favorite-brands', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (response.data.success) {
            setSelectedBrands(response.data.favoriteBrands);
            // Update user object with favorite brands from database
            const updatedUser = { ...user, favoriteBrands: response.data.favoriteBrands };
            onUpdateUser(updatedUser);
          }
        } catch (error) {
          console.error('Error loading favorite brands:', error);
        }
      }
    };

    loadFavoriteBrands();
  }, [user, onUpdateUser]);

  // Save favorite brands to database
  const saveFavoriteBrands = async (brands) => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const response = await axios.post('http://localhost:3001/api/auth/favorite-brands', {
        favoriteBrands: brands
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Update user object with new favorite brands
        const updatedUser = { ...user, favoriteBrands: brands };
        onUpdateUser(updatedUser);
      } else {
        console.error('Failed to save favorite brands');
      }
    } catch (error) {
      console.error('Error saving favorite brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandToggle = (brandKey) => {
    let newSelectedBrands;
    if (selectedBrands.includes(brandKey)) {
      newSelectedBrands = selectedBrands.filter(brand => brand !== brandKey);
    } else if (selectedBrands.length < 5) {
      newSelectedBrands = [...selectedBrands, brandKey];
    } else {
      return; // Don't add if already at limit
    }
    
    setSelectedBrands(newSelectedBrands);
    saveFavoriteBrands(newSelectedBrands);
  };



  const removeBrand = (brandKey) => {
    const newSelectedBrands = selectedBrands.filter(brand => brand !== brandKey);
    setSelectedBrands(newSelectedBrands);
    saveFavoriteBrands(newSelectedBrands);
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

  const handleAddBrand = async () => {
    if (newBrandName.trim() && newBrandWebsite.trim()) {
      try {
        const authToken = localStorage.getItem('authToken');
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
        <p>Track up to 5 of your favorite brands</p>
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
        {selectedBrands.map((brandKey) => (
          <div key={brandKey} className="favorite-brand-card">
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
        ))}
        
        {selectedBrands.length < 5 && (
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
              <h3>Select Your Brands ({selectedBrands.length}/5)</h3>
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
              {brandsConfig?.brands && Object.entries(brandsConfig.brands).map(([brandKey, brandConfig]) => (
                <div 
                  key={brandKey} 
                  className={`available-brand-card ${selectedBrands.includes(brandKey) ? 'selected' : ''}`}
                  onClick={() => handleBrandToggle(brandKey)}
                  role="button"
                  tabIndex={0}
                >
                  <h4>{brandConfig.name}</h4>
                  <span className="selection-indicator">
                    {selectedBrands.includes(brandKey) ? '✓' : ''}
                  </span>
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
            </div>
            <div className="modal-actions">
              <button 
                className="save-changes-btn"
                onClick={() => setShowBrandSelector(false)}
                type="button"
              >
                Save Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowBrandSelector(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showAddBrandModal && (
        <div className="brand-selector-modal">
          <div className="brand-selector-content">
            <div className="modal-header">
              <h3>Add New Brand</h3>
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