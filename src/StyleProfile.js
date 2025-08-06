import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StyleProfile.css';

const StyleProfile = ({ user, onUpdateUser, onBack }) => {
  const [styleImages, setStyleImages] = useState(user?.styleImages || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showPinterestForm, setShowPinterestForm] = useState(false);
  const [styleProfile, setStyleProfile] = useState(user?.styleProfile || {});
  const [pinterestScreenshotUrl, setPinterestScreenshotUrl] = useState('');

  useEffect(() => {
    loadStyleProfile();
  }, []);

  const loadStyleProfile = async () => {
    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setStyleImages(response.data.user.styleImages || []);
        setStyleProfile(response.data.user.styleProfile || {});
      }
    } catch (error) {
      console.error('Error loading style profile:', error);
    }
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }

    if (styleImages.length >= 10) {
      alert('You can only add up to 10 style images');
      return;
    }

    try {
      setLoading(true);
      const authToken = localStorage.getItem('token');
      
      const imageData = {
        url: newImageUrl,
        source: 'upload'
      };

      const response = await axios.post('http://localhost:3001/api/style/add-image', imageData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStyleImages(prev => [...prev, response.data.image]);
        setNewImageUrl('');
        setShowUploadForm(false);
        
        // Trigger style analysis
        analyzeStyleProfile();
      } else {
        alert('Failed to add image');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Error adding image');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (imageId) => {
    if (!window.confirm('Remove this style inspiration image?')) {
      return;
    }

    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:3001/api/style/remove-image/${imageId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setStyleImages(prev => prev.filter(img => img._id !== imageId));
        // Re-analyze style profile
        analyzeStyleProfile();
      } else {
        alert('Failed to remove image');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Error removing image');
    }
  };

  const addPinterestScreenshot = async () => {
    if (!pinterestScreenshotUrl.trim()) {
      alert('Please enter the Pinterest screenshot URL');
      return;
    }

    if (styleImages.length >= 10) {
      alert('You can only add up to 10 style images');
      return;
    }

    try {
      setLoading(true);
      const authToken = localStorage.getItem('token');
      
      const imageData = {
        url: pinterestScreenshotUrl,
        source: 'pinterest'
      };

      const response = await axios.post('http://localhost:3001/api/style/add-image', imageData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setStyleImages(prev => [...prev, response.data.image]);
        setPinterestScreenshotUrl('');
        setShowPinterestForm(false);
        
        // Trigger style analysis
        analyzeStyleProfile();
      } else {
        alert('Failed to add Pinterest screenshot');
      }
    } catch (error) {
      console.error('Error adding Pinterest screenshot:', error);
      alert('Error adding Pinterest screenshot');
    } finally {
      setLoading(false);
    }
  };

  const analyzeStyleProfile = async () => {
    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/style/analyze', {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setStyleProfile(response.data.styleProfile);
      }
    } catch (error) {
      console.error('Error analyzing style profile:', error);
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return '#28a745';
      case 'medium': return '#ffc107';
      case 'low': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const isValidImageUrl = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext)) || 
           url.includes('pinterest.com') || 
           url.includes('pinimg.com');
  };

  return (
    <div className="style-profile-container">
      <div className="style-profile-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="style-profile-title">
          <h2>Your Style Profile</h2>
          <p>Add 5-10 outfit inspiration images or upload a Pinterest homepage screenshot to get personalized recommendations</p>
        </div>
        <div className="images-count">
          {styleImages.length}/10 Images
        </div>
      </div>

      {/* Style Analysis Results */}
      {styleProfile.confidence && styleProfile.confidence !== 'low' && (
        <div className="style-analysis">
          <h3>Your Style Analysis</h3>
          <div className="confidence-indicator">
            <span 
              className="confidence-badge"
              style={{ backgroundColor: getConfidenceColor(styleProfile.confidence) }}
            >
              {styleProfile.confidence.toUpperCase()} CONFIDENCE
            </span>
          </div>
          
          {styleProfile.detectedStyles && styleProfile.detectedStyles.length > 0 && (
            <div className="detected-styles">
              <h4>Detected Styles:</h4>
              <div className="style-tags">
                {styleProfile.detectedStyles.map((style, index) => (
                  <span key={index} className="style-tag">{style}</span>
                ))}
              </div>
            </div>
          )}

          {styleProfile.colors && styleProfile.colors.length > 0 && (
            <div className="color-palette">
              <h4>Preferred Colors:</h4>
              <div className="color-tags">
                {styleProfile.colors.map((color, index) => (
                  <span key={index} className="color-tag">{color}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Images Section */}
      <div className="add-images-section">
        <div className="add-options">
          <button 
            className="add-option-btn upload-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
            disabled={styleImages.length >= 10}
          >
            📷 Add Image URL
          </button>
          
          <button 
            className="add-option-btn pinterest-btn"
            onClick={() => setShowPinterestForm(!showPinterestForm)}
            disabled={styleImages.length >= 10}
          >
            📌 Pinterest Screenshot
          </button>
        </div>

        {showUploadForm && (
          <div className="upload-form">
            <h4>Add Style Inspiration Image</h4>
            <div className="form-group">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="image-url-input"
              />
              {newImageUrl && !isValidImageUrl(newImageUrl) && (
                <p className="url-warning">⚠️ Please enter a valid image URL</p>
              )}
            </div>
            <div className="form-actions">
              <button 
                onClick={() => setShowUploadForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddImage}
                disabled={loading || !isValidImageUrl(newImageUrl)}
                className="add-btn"
              >
                {loading ? 'Adding...' : 'Add Image'}
              </button>
            </div>
          </div>
        )}

        {showPinterestForm && (
          <div className="pinterest-form">
            <h4>Add Pinterest Homepage Screenshot</h4>
            <p className="pinterest-instructions">
              Take a screenshot of your Pinterest homepage or profile page and upload the image URL. This helps us understand your style preferences from your saved pins.
            </p>
            <div className="form-group">
              <input
                type="url"
                value={pinterestScreenshotUrl}
                onChange={(e) => setPinterestScreenshotUrl(e.target.value)}
                placeholder="https://example.com/pinterest-screenshot.jpg"
                className="pinterest-url-input"
              />
              {pinterestScreenshotUrl && !isValidImageUrl(pinterestScreenshotUrl) && (
                <p className="url-warning">⚠️ Please enter a valid image URL</p>
              )}
            </div>
            <div className="form-actions">
              <button 
                onClick={() => setShowPinterestForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={addPinterestScreenshot}
                disabled={loading || !isValidImageUrl(pinterestScreenshotUrl)}
                className="connect-btn"
              >
                {loading ? 'Adding...' : 'Add Screenshot'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Style Images Grid */}
      <div className="style-images-grid">
        {styleImages.length === 0 ? (
          <div className="no-images">
            <div className="no-images-icon">🎨</div>
            <h3>No style images yet</h3>
            <p>Add some outfit inspiration images or upload a Pinterest homepage screenshot to help us understand your style preferences and get personalized recommendations!</p>
          </div>
        ) : (
          styleImages.map((image, index) => (
            <div key={image._id || index} className="style-image-card">
              <div className="image-container">
                <img 
                  src={image.url} 
                  alt={`Style inspiration ${index + 1}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="image-error" style={{ display: 'none' }}>
                  <span>❌ Image failed to load</span>
                </div>
              </div>
              
              <div className="image-actions">
                <div className="image-source">
                  {image.source === 'pinterest' ? (
                    <span className="source-badge pinterest">📌 Pinterest</span>
                  ) : (
                    <span className="source-badge upload">📷 Upload</span>
                  )}
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveImage(image._id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {styleImages.length > 0 && styleImages.length < 5 && (
        <div className="recommendation-tip">
          <p>💡 Add {5 - styleImages.length} more images to improve your personalized recommendations!</p>
        </div>
      )}


    </div>
  );
};

export default StyleProfile; 