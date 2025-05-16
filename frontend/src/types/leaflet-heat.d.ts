declare module 'leaflet.heat' {
  import * as L from 'leaflet';

  namespace HeatLayer {
    interface HeatLayerOptions {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: Record<string, string>;
    }
  }

  namespace L {
    function heatLayer(
      latlngs: Array<[number, number, number?]>,
      options?: HeatLayer.HeatLayerOptions
    ): L.Layer;
  }
}
