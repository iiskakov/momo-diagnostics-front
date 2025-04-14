'use client'


import React, { useState } from 'react';
import Image from 'next/image';

export default function Seed() {
  const [activeLogoType, setActiveLogoType] = useState('original');

  const logos = [
    { type: 'original', src: '/poster/logos/original.png' },
    { type: '1', src: '/poster/logos/1.png' },
    { type: '2', src: '/poster/logos/2.png' },
    { type: '3', src: '/poster/logos/3.png' },
    { type: '4', src: '/poster/logos/4.png' },
    { type: '5', src: '/poster/logos/5.png' },
    { type: '6', src: '/poster/logos/6.png' }
  ];

  const handleLogoChange = () => {
    const currentIndex = logos.findIndex(logo => logo.type === activeLogoType);
    const nextIndex = (currentIndex + 1) % logos.length;
    setActiveLogoType(logos[nextIndex].type);
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh" 
    }}> 
      <div style={{ 
        backgroundImage: "url('/poster/poster_background.jpg')", 
        backgroundSize: "cover", 
        backgroundPosition: "center", 
        backgroundRepeat: "no-repeat", 
        height: "100%", 
        width: "100%", 
        position: "relative", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "end" 
      }}> 
        <div style={{ 
          textAlign: "center", 
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}> 
          <h1 style={{ 
            color: "white", 
            margin: "0", 
            padding: "0" 
          }}> 
            No one grows ketchup like Heinz 
          </h1>
          {logos.map(logo => (
            <div 
              key={logo.type} 
              style={{ 
                marginTop: "10px",
                display: logo.type === activeLogoType ? 'block' : 'none',
                position: "relative",
                height: "60px",
                width: "auto"
              }}
            >
              <Image 
                src={logo.src}
                alt={`Heinz Logo ${logo.type}`}
                width={120}
                height={60}
                style={{ height: "60px", width: "auto" }}
              />
            </div>
          ))}
          <button 
            onClick={handleLogoChange}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Change Logo
          </button>
        </div>
      </div>
    </div>
  );
}