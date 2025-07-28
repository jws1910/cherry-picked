import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = ({ onBack }) => {
  const [brandRequests, setBrandRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchBrandRequests();
  }, []);

  const fetchBrandRequests = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:3001/api/brand-requests/admin/all', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setBrandRequests(response.data.brandRequests);
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
      const authToken = localStorage.getItem('authToken');
      const response = await axios.put(`http://localhost:3001/api/brand-requests/admin/${requestId}`, {
        status,
        adminNotes
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
        setAdminNotes('');
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
      pending: '#ffa500',
      approved: '#28a745',
      rejected: '#dc3545'
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
          <button onClick={onBack} className="back-btn">
            ← Back
          </button>
          <h1>Admin Panel - Brand Requests</h1>
        </div>
        <button onClick={fetchBrandRequests} className="refresh-btn">
          Refresh
        </button>
      </div>

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

                {request.status === 'pending' && (
                  <div className="request-actions">
                    <textarea
                      placeholder="Add admin notes (optional)"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="admin-notes"
                    />
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        className="approve-btn"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                        className="reject-btn"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 