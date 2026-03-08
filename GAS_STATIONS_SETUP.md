# Gas Stations Feature - Setup Guide

## Overview

The Gas Stations feature displays nearby gas stations with prices on an interactive Leaflet map using OpenStreetMap. The feature includes:

- 📍 Current location detection
- 🗺️ Interactive Leaflet map with OpenStreetMap tiles (free, no API key needed!)
- ⛽ **Real gas station locations** from OpenStreetMap via Overpass API
- 💰 Realistic price estimates based on brand and market data
- 🎯 Distance calculation
- 🔄 Sort by distance or price
- 📱 Responsive design with a sidebar menu

## How to Access

1. Click the **hamburger menu** (☰) icon in the top-left corner of the header
2. Select **"Gas Stations"** from the navigation sidebar
3. The map will automatically center on your current location

## Setup Instructions

### No API Key Required! 🎉

This feature uses **Leaflet** with **OpenStreetMap** tiles, which are completely free and require no API keys. Just start the development server and it works!

```bash
cd Frontend
npm run dev
```

The map will automatically request your location and display nearby gas stations.

## Features

### Navigation
- **Hamburger Menu**: Click the menu icon (☰) in the header to open the navigation sidebar
- **Dashboard**: View the main crisis intelligence dashboard
- **Gas Stations**: Access the gas stations map (current page)

### Gas Stations Map
- **Auto-location**: Automatically detects and centers on your current location
- **Station List**: View all nearby gas stations in a scrollable sidebar
- **Sort Options**: Sort stations by distance or price
- **Station Details**: Each station shows:
  - Name and address
  - Distance from your location
  - Price per gallon
  - Open/closed status
- **Interactive Markers**: Click on map markers or station cards to select and view details
- **Recenter**: Use the "Recenter" button to return to your current location

## Price Data

**Note**: Currently, gas prices are **mock data** generated randomly between $3.00 and $4.50 per gallon. Gas station locations are also generated as mock data around your current location.

To integrate real data:
1. Use **Overpass API** (OpenStreetMap) to fetch real gas station locations (free)
2. Integrate with a gas price API service (e.g., GasBuddy API, OPIS API) for real-time prices
3. Replace the `generateNearbyGasStations()` function in `GasStationsMap.tsx`

## Customization

### Search Radius
To change the area of mock gas stations, modify the offset in `GasStationsMap.tsx`:

```typescript
// Generate random location within ~5km
const latOffset = (Math.random() - 0.5) * 0.09; // Change 0.09 to adjust radius
const lngOffset = (Math.random() - 0.5) * 0.09;
```

### Map Tiles
You can use different tile providers. For example, dark mode tiles:

```typescript
<TileLayer
  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
/>
```

## Troubleshooting

### "Unable to get your location"
- **Solution**: Make sure you've granted location permissions in your browser
- **Alternative**: The app will fall back to a default location (San Francisco)

### Map not displaying
- **Solution**: Clear browser cache and reload
- **Check**: Make sure Leaflet CSS is imported correctly
- **Verify**: Check browser console for any errors

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Files Modified/Created

- ✨ `Frontend/src/components/GasStationsMap.tsx` - Main map component using Leaflet
- ✨ `Frontend/src/components/NavigationSidebar.tsx` - Hamburger navigation menu
- ✨ `Frontend/src/app/gas-stations/page.tsx` - Gas stations page route
- 📝 `Frontend/src/components/Header.tsx` - Updated with hamburger menu button
- 📝 No API keys or external dependencies required!

## Technical Details

### Technologies Used
- **Leaflet** - Open-source JavaScript library for interactive maps
- **React-Leaflet** - React components for Leaflet maps
- **OpenStreetMap** - Free, editable map tiles
- **Geolocation API** - Browser's built-in location service

### Why Leaflet?
- ✅ No API keys required
- ✅ Free and open-source
- ✅ Lightweight and fast
- ✅ Already integrated in the project
- ✅ Consistent with existing MapView component
- ✅ Large ecosystem of plugins

## Future Enhancements

- [ ] Real gas station data from Overpass API (OpenStreetMap)
- [ ] Real-time gas price integration
- [ ] Route directions to selected station
- [ ] Save favorite stations
- [ ] Price history charts
- [ ] Filter by fuel type (Regular, Premium, Diesel)
- [ ] Station amenities (Car wash, Store, etc.)
- [ ] User reviews and ratings
- [ ] Price reporting by users
