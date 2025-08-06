import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = ({ onBack, user }) => {
  const [brandRequests, setBrandRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [activeTab, setActiveTab] = useState('requests');


  useEffect(() => {
    fetchBrandRequests();
  }, []);

  const fetchBrandRequests = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/brand-requests/admin/all', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        // Remove duplicates and sort by status
        const uniqueRequests = response.data.brandRequests.reduce((acc, request) => {
          const existing = acc.find(r => r.brandName.toLowerCase() === request.brandName.toLowerCase());
          if (!existing) {
            acc.push(request);
          }
          return acc;
        }, []);
        
        // Sort by status: new brand -> in progress -> added
        const sortedRequests = uniqueRequests.sort((a, b) => {
          const statusOrder = { 'new brand': 0, 'in progress': 1, 'added': 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });
        
        setBrandRequests(sortedRequests);
      } else {
        setError('Failed to fetch brand requests');
      }
    } catch (error) {
      console.error('Error fetching brand requests:', error);
      setError('Error fetching brand requests');
    } finally {
      setLoading(false);
    }
  };



  const handleStatusUpdate = async (requestId, status) => {
    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3001/api/brand-requests/admin/${requestId}`, {
        status,
        adminNotes: adminNotes[requestId] || ''
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Refresh the list
        fetchBrandRequests();
        setSelectedRequest(null);
        // Clear notes for this specific request
        setAdminNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[requestId];
          return newNotes;
        });
        alert(`Brand request ${status} successfully`);
      } else {
        alert('Failed to update brand request');
      }
    } catch (error) {
      console.error('Error updating brand request:', error);
      alert('Error updating brand request');
    }
  };



  const getStatusBadge = (status) => {
    const statusColors = {
      'new brand': '#ffa500',
      'in progress': '#17a2b8',
      'added': '#28a745',
      'rejected': '#dc3545'
    };

    return (
      <span 
        className="status-badge"
        style={{ backgroundColor: statusColors[status] }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-panel">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
          <button onClick={onBack} className="back-btn">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading brand requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Panel</h1>
        </div>
        <button onClick={fetchBrandRequests} className="refresh-btn">
          Refresh
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Brand Requests ({brandRequests.length})
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="brand-requests-container">
          {brandRequests.length === 0 ? (
            <div className="no-requests">
              <p>No brand requests found.</p>
            </div>
          ) : (
            <div className="requests-list">
              {brandRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>{request.brandName}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="request-details">
                    <p><strong>Website:</strong> <a href={request.brandWebsite} target="_blank" rel="noopener noreferrer">{request.brandWebsite}</a></p>
                    <p><strong>Requested by:</strong> {request.requestedBy?.firstName} {request.requestedBy?.lastName} ({request.requestedBy?.email})</p>
                    <p><strong>Requested on:</strong> {formatDate(request.createdAt)}</p>
                    
                    {request.processedAt && (
                      <p><strong>Processed on:</strong> {formatDate(request.processedAt)}</p>
                    )}
                    
                    {request.adminNotes && (
                      <p><strong>Admin Notes:</strong> {request.adminNotes}</p>
                    )}
                  </div>

                  <div className="request-actions">
                    <textarea
                      placeholder="Add admin notes (optional)"
                      value={adminNotes[request.id] || ''}
                      onChange={(e) => setAdminNotes(prev => ({
                        ...prev,
                        [request.id]: e.target.value
                      }))}
                      className="admin-notes"
                    />
                    <div className="action-buttons">
                      {request.status === 'new brand' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(request.id, 'in progress')}
                            className="progress-btn"
                          >
                            → In Progress
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {request.status === 'in progress' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(request.id, 'added')}
                            className="approve-btn"
                          >
                            → Added
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(request.id, 'new brand')}
                            className="back-btn"
                          >
                            ← Back to New
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {request.status === 'added' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(request.id, 'in progress')}
                            className="back-btn"
                          >
                            ← Back to In Progress
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {request.status === 'rejected' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(request.id, 'new brand')}
                            className="progress-btn"
                          >
                            → Reopen
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default AdminPanel; 