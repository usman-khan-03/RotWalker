/**
 * HeroMap - Displays a journey route on a map with progress marker
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { theme } from '../theme/theme';

interface HeroMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  progressRatio: number; // 0 to 1
  mode: 'solo' | 'crew' | 'season';
  multipleLines?: Array<{
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    progressRatio: number;
    mode: 'solo' | 'crew' | 'season';
  }>;
}

export function HeroMap({ origin, destination, progressRatio, mode, multipleLines }: HeroMapProps) {
  const getColor = (mapMode: 'solo' | 'crew' | 'season') => {
    switch (mapMode) {
      case 'solo':
        return theme.colors.solo.primary;
      case 'crew':
        return theme.colors.crew.primary;
      case 'season':
        return theme.colors.season.primary;
    }
  };

  // Calculate current position along the line
  const currentLat = origin.lat + (destination.lat - origin.lat) * progressRatio;
  const currentLng = origin.lng + (destination.lng - origin.lng) * progressRatio;

  // Calculate region to show both origin and destination
  const minLat = Math.min(origin.lat, destination.lat);
  const maxLat = Math.max(origin.lat, destination.lat);
  const minLng = Math.min(origin.lng, destination.lng);
  const maxLng = Math.max(origin.lng, destination.lng);

  const latDelta = (maxLat - minLat) * 1.5 + 0.1;
  const lngDelta = (maxLng - minLng) * 1.5 + 0.1;

  const region = {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };

  const lines = multipleLines || [{ origin, destination, progressRatio, mode }];

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        mapType="standard"
        customMapStyle={darkMapStyle}
      >
        {lines.map((line, index) => (
          <React.Fragment key={index}>
            <Polyline
              coordinates={[line.origin, line.destination]}
              strokeColor={getColor(line.mode)}
              strokeWidth={4}
            />
            <Marker
              coordinate={{
                latitude: line.origin.lat + (line.destination.lat - line.origin.lat) * line.progressRatio,
                longitude: line.origin.lng + (line.destination.lng - line.origin.lng) * line.progressRatio,
              }}
              pinColor={getColor(line.mode)}
            />
          </React.Fragment>
        ))}
        
        {/* Origin marker */}
        <Marker coordinate={origin} pinColor={theme.colors.textMuted} />
        
        {/* Destination marker */}
        <Marker coordinate={destination} pinColor={getColor(mode)} />
      </MapView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.cardBackground,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

// Dark map style
const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

