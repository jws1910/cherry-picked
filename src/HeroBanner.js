import React, { useState, useEffect } from 'react';
import './HeroBanner.css';

const HeroBanner = ({ allSalesData }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  // Generate dynamic messages based on actual sales data
  const generateMessages = () => {
    const messages = [];
    
    if (allSalesData && allSalesData.allResults) {
      // Count brands on sale
      const brandsOnSale = allSalesData.allResults.filter(brand => brand.saleFound);
      const saleCount = brandsOnSale.length;
      
      // Find flash sales
      const flashSales = brandsOnSale.filter(brand => 
        brand.saleCategory === 'flash-sale' || 
        brand.saleText.toLowerCase().includes('flash')
      );
      
      // Find student discounts
      const studentDiscounts = brandsOnSale.filter(brand => 
        brand.saleCategory === 'student-sale' || 
        brand.saleText.toLowerCase().includes('student')
      );
      
      // Find high percentage sales
      const highPercentageSales = brandsOnSale.filter(brand => 
        brand.salePercentage && parseInt(brand.salePercentage) >= 50
      );
      
      // Add dynamic messages based on actual data
      if (flashSales.length > 0) {
        const flashBrand = flashSales[0];
        messages.push({
          icon: "🔥",
          text: `${flashBrand.brandName} Flash Sale - ${flashBrand.salePercentage}% Off`,
          color: "#ff6b6b"
        });
      }
      
      if (studentDiscounts.length > 0) {
        const studentBrand = studentDiscounts[0];
        messages.push({
          icon: "🎓",
          text: `${studentBrand.brandName} Student Discount - ${studentBrand.salePercentage}% Off`,
          color: "#4ecdc4"
        });
      }
      
      if (highPercentageSales.length > 0) {
        const highBrand = highPercentageSales[0];
        messages.push({
          icon: "⚡",
          text: `${highBrand.brandName} - Up to ${highBrand.salePercentage}% Off`,
          color: "#45b7d1"
        });
      }
      
      if (saleCount > 0) {
        messages.push({
          icon: "🎉",
          text: `${saleCount} Brands on Sale Right Now!`,
          color: "#ff9ff3"
        });
      }
    }
    
    // Fallback messages if no sales data
    if (messages.length === 0) {
      messages.push(
        {
          icon: "🔥",
          text: "Sandro Flash Sale Ends Tonight",
          color: "#ff6b6b"
        },
        {
          icon: "🎓",
          text: "Student Discounts: Up to 40% Off",
          color: "#4ecdc4"
        },
        {
          icon: "⚡",
          text: "New Drops: 50+ Brands Added",
          color: "#45b7d1"
        }
      );
    }
    
    return messages;
  };
  
  const messages = generateMessages();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % messages.length
      );
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="hero-banner">
      <div className="hero-content">
        <div className="hero-message">
          <span className="hero-icon" style={{ color: currentMessage.color }}>
            {currentMessage.icon}
          </span>
          <span className="hero-text">{currentMessage.text}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner; 