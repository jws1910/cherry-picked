import React, { useState, useEffect } from 'react';
import './SaleTypeMenu.css';

const SaleTypeMenu = ({ selectedSaleType, onSaleTypeChange, allSalesData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  // Get available sale types based on actual sales data
  const getAvailableSaleTypes = () => {
    const baseTypes = [
      { key: 'all', label: 'All Sales', icon: '🛍️' }
    ];

    if (!allSalesData || !allSalesData.categorizedResults) {
      return baseTypes;
    }

    const availableTypes = [...baseTypes];
    
    // Check which categories actually have sales
    const categoryMapping = {
      'flash-sale': { label: 'Flash Sales', icon: '⚡' },
      'end-of-season': { label: 'End of Season', icon: '🏁' },
      'student-sale': { label: 'Student Deals', icon: '🎓' },
      'black-friday': { label: 'Black Friday', icon: '🖤' },
      'cyber-monday': { label: 'Cyber Monday', icon: '💻' },
      'final-markdown': { label: 'Final Markdown', icon: '🏷️' },
      'fifty-percent': { label: '50% Off', icon: '5️⃣0️⃣' },
      'sixty-percent': { label: '60% Off', icon: '6️⃣0️⃣' },
      'seventy-percent': { label: '70% Off', icon: '7️⃣0️⃣' }
    };

    Object.entries(allSalesData.categorizedResults).forEach(([categoryKey, sales]) => {
      if (sales && sales.length > 0 && categoryMapping[categoryKey]) {
        availableTypes.push({
          key: categoryKey,
          label: categoryMapping[categoryKey].label,
          icon: categoryMapping[categoryKey].icon
        });
      }
    });

    return availableTypes;
  };

  const saleTypes = getAvailableSaleTypes();
  const visibleTypes = saleTypes.slice(currentIndex, currentIndex + visibleCount);

  const handlePrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(saleTypes.length - visibleCount, currentIndex + 1));
  };

  // Reset to first page when sale type changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [saleTypes.length]);

  return (
    <div className="sale-type-menu">
      {currentIndex > 0 && (
        <button className="nav-arrow prev-arrow" onClick={handlePrev}>
          ‹
        </button>
      )}
      
      <div className="menu-container">
        {visibleTypes.map((saleType) => (
          <button
            key={saleType.key}
            className={`sale-type-btn ${selectedSaleType === saleType.key ? 'active' : ''}`}
            onClick={() => onSaleTypeChange(saleType.key)}
          >
            <span className="sale-icon">{saleType.icon}</span>
            <span className="sale-label">{saleType.label}</span>
          </button>
        ))}
      </div>

      {currentIndex + visibleCount < saleTypes.length && (
        <button className="nav-arrow next-arrow" onClick={handleNext}>
          ›
        </button>
      )}
    </div>
  );
};

export default SaleTypeMenu; 