import MapView, { Marker } from "react-native-maps";
import { colors } from "@/src/theme";

type MarkerItem = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
};

type RegionItem = {
  latitude: number;
  longitude: number;
};

type Props = {
  region: RegionItem;
  markers: MarkerItem[];
  selectedMarkerId?: string;
  onSelectMarker?: (markerId: string) => void;
};

export function ExploreMap({ region, markers, selectedMarkerId, onSelectMarker }: Props) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: 0.022,
        longitudeDelta: 0.022,
      }}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
          onPress={() => onSelectMarker?.(marker.id)}
          title={marker.title}
          pinColor={marker.id === selectedMarkerId ? colors.teal : colors.primary}
        />
      ))}
    </MapView>
  );
}
