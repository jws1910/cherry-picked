import React, { useState, useEffect } from 'react';
import './SaleTypeMenu.css';

const SaleTypeMenu = ({ selectedSaleType, onSaleTypeChange, allSalesData }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  // Get available sale types based on actual sales data
  const getAvailableSaleTypes = () => {
    console.log('🔍 SaleTypeMenu - allSalesData:', allSalesData);
    console.log('🔍 SaleTypeMenu - categorizedResults:', allSalesData?.categorizedResults);
    
    const baseTypes = [
      { key: 'all', label: 'All Sales', icon: '🛍️' }
    ];

    if (!allSalesData || !allSalesData.categorizedResults) {
      console.log('⚠️ No sales data available for menu');
      return baseTypes;
    }

    const availableTypes = [...baseTypes];
    
    // Check which categories actually have sales
    const categoryMapping = {
      'ai-picks': { label: 'Sales Picked For You', icon: '✨', order: 0 },
      'flash-sale': { label: 'Flash Sales', icon: '⚡', order: 1 },
      'end-of-season': { label: 'End of Season', icon: '🏁', order: 2 },
      'first-order': { label: 'First Order Deals', icon: '🆕', order: 3 },
      'student-sale': { label: 'Student Deals', icon: '🎓', order: 4 },
      'black-friday': { label: 'Black Friday', icon: '🖤', order: 5 },
      'cyber-monday': { label: 'Cyber Monday', icon: '💻', order: 6 },
      'final-markdown': { label: 'Final Markdown', icon: '🏷️', order: 7 },
      'refer-get': { label: 'Refer & Get X%', icon: '🎁', order: 8 },
      'buy-one-get-one': { label: 'Buy One Get One', icon: '2️⃣4️⃣1️⃣', order: 9 },
      'ten-percent': { label: 'Up to 10% Off', icon: '1️⃣0️⃣', order: 10 },
      'eleven-twenty': { label: '11-20% Off', icon: '1️⃣1️⃣-2️⃣0️⃣', order: 11 },
      'twenty-one-thirty': { label: '21-30% Off', icon: '2️⃣1️⃣-3️⃣0️⃣', order: 12 },
      'thirty-one-forty': { label: '31-40% Off', icon: '3️⃣1️⃣-4️⃣0️⃣', order: 13 },
      'forty-one-fifty': { label: '41-50% Off', icon: '4️⃣1️⃣-5️⃣0️⃣', order: 14 },
      'fifty-one-sixty': { label: '51-60% Off', icon: '5️⃣1️⃣-6️⃣0️⃣', order: 15 },
      'sixty-one-seventy': { label: '61-70% Off', icon: '6️⃣1️⃣-7️⃣0️⃣', order: 16 },
      'seventy-one-eighty': { label: '71-80% Off', icon: '7️⃣1️⃣-8️⃣0️⃣', order: 17 },
      'fifty-percent': { label: '50% Off', icon: '5️⃣0️⃣', order: 18 },
      'sixty-percent': { label: '60% Off', icon: '6️⃣0️⃣', order: 19 },
      'seventy-percent': { label: '70% Off', icon: '7️⃣0️⃣', order: 20 },
      'other-sales': { label: 'Other Sales', icon: '📦', order: 21 }
    };

    console.log('🔍 Checking categories:', Object.keys(allSalesData.categorizedResults));
    
    Object.entries(allSalesData.categorizedResults).forEach(([categoryKey, sales]) => {
      console.log(`🔍 Category ${categoryKey}:`, sales?.length, 'sales');
      if (sales && sales.length > 0 && categoryMapping[categoryKey]) {
        console.log(`✅ Adding category: ${categoryKey}`);
        availableTypes.push({
          key: categoryKey,
          label: categoryMapping[categoryKey].label,
          icon: categoryMapping[categoryKey].icon,
          order: categoryMapping[categoryKey].order
        });
      } else if (sales && sales.length > 0) {
        console.log(`⚠️ Category ${categoryKey} has ${sales.length} sales but no mapping`);
        // Add unmapped categories as "Other Sales" at the end
        availableTypes.push({
          key: categoryKey,
          label: 'Other Sales',
          icon: '📦',
          order: 999 // High order to put at end
        });
      }
    });

    // Sort by order, with "All Sales" always first
    availableTypes.sort((a, b) => {
      if (a.key === 'all') return -1;
      if (b.key === 'all') return 1;
      return (a.order || 999) - (b.order || 999);
    });

    console.log('📋 Final available types (sorted):', availableTypes);
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