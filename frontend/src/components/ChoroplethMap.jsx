import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { statesData as rawStatesData } from '../data/us-states';
import { stateArray, statePopulation } from '../utils/stateData';
import { getChoroplethColor, CHOROPLETH_COLORS } from '../utils/colors';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function InfoControl({ statesData, normalize, infoRef }) {
  const map = useMap();

  useEffect(() => {
    const info = L.control();
    info.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    info.update = function (props) {
      if (normalize) {
        this._div.innerHTML =
          '<h5>Number of Recalls</h5><p style="margin:0;font-size:11px">(per 1,000,000 people)</p>' +
          (props
            ? '<b>' + props.name + '</b><br />' + props.density.toFixed(2) + ' recalls'
            : 'Hover over a state');
      } else {
        this._div.innerHTML =
          '<h5>Number of Recalls</h5>' +
          (props
            ? '<b>' + props.name + '</b><br />' + props.density + ' recalls'
            : 'Hover over a state');
      }
    };
    info.addTo(map);
    if (infoRef) infoRef.current = info;
    return () => {
      if (infoRef) infoRef.current = null;
      info.remove();
    };
  }, [map, normalize, infoRef]);

  return null;
}

function LegendControl({ minDensity, maxDensity }) {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'bottomright' });
    const rangeStep = (maxDensity - minDensity) * 0.125;

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = Array.from({ length: 8 }, (_, i) => minDensity + rangeStep * i);

      let labels;
      if (maxDensity - minDensity < 8) {
        labels = [
          `${Math.round(minDensity)}`, '...', '...', '...', '...', '...', '...',
          `${Math.round(maxDensity)}`,
        ];
      } else {
        labels = grades.map((g, i) => {
          const lo = Math.round(g) + (i > 0 ? 1 : 0);
          const hi = i < 7 ? Math.round(g + rangeStep) : Math.round(maxDensity);
          return `${lo}-${hi}`;
        });
      }

      div.innerHTML =
        '<div style="text-align:center"><b>Legend</b><hr style="margin:.2rem 0 .5rem"/></div>';
      for (let i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' +
          CHOROPLETH_COLORS[i] +
          '">&nbsp;&nbsp;</i>&nbsp;' +
          labels[i] +
          '<br/>';
      }
      return div;
    };

    legend.addTo(map);
    return () => legend.remove();
  }, [map, minDensity, maxDensity]);

  return null;
}

export default function ChoroplethMap({
  stateRecallCount = [],
  normalize = false,
  stateRecallDetails = null,
  showPopups = false,
}) {
  const geoJsonRef = useRef(null);
  const infoRef = useRef(null);

  const { geoData, minDensity, maxDensity } = useMemo(() => {
    // Deep clone the raw GeoJSON so mutations don't leak
    const clone = JSON.parse(JSON.stringify(rawStatesData));

    for (let i = 0; i < stateArray.length && i < clone.features.length; i++) {
      let density = stateRecallCount[i] || 0;
      if (normalize && statePopulation[i]) {
        density = (density / statePopulation[i]) * 1000000;
      }
      clone.features[i].properties.density = density;

      if (stateRecallDetails) {
        clone.features[i].properties.recallDetails = stateRecallDetails[i] || [];
      }
    }

    let max = -Infinity;
    let min = Infinity;
    for (const feature of clone.features) {
      const d = feature.properties.density;
      if (d > max) max = d;
      if (d < min) min = d;
    }
    if (!isFinite(max)) max = 0;
    if (!isFinite(min)) min = 0;

    return { geoData: clone, minDensity: min, maxDensity: max };
  }, [stateRecallCount, normalize, stateRecallDetails]);

  const style = (feature) => ({
    fillColor: getChoroplethColor(feature.properties.density, maxDensity, minDensity),
    weight: 1,
    opacity: 1,
    color: '#475569',
    dashArray: '3',
    fillOpacity: 0.7,
  });

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({ weight: 2, color: '#94A3B8', dashArray: '', fillOpacity: 0.85 });
        target.bringToFront();

        // Update info control with hovered state properties
        if (infoRef.current) {
          infoRef.current.update(feature.properties);
        }
      },
      mouseout: (e) => {
        if (geoJsonRef.current) {
          geoJsonRef.current.resetStyle(e.target);
        }
        // Reset info control to default state
        if (infoRef.current) {
          infoRef.current.update();
        }
      },
    });

    if (showPopups && feature.properties.recallDetails && feature.properties.recallDetails.length > 0) {
      let html = `<div style="max-width:350px"><h5 style="text-align:center;margin:0 0 8px"><strong>${escapeHtml(feature.properties.name)} Recall Details</strong></h5>`;
      for (const detail of feature.properties.recallDetails) {
        html += `<hr style="margin:4px 0"/><p style="margin:2px 0;font-size:12px"><strong>Firm:</strong> ${escapeHtml(detail.recalling_firm)}<br/>
          <strong>Product:</strong> ${escapeHtml(detail.product_description)}<br/>
          <strong>Reason:</strong> ${escapeHtml(detail.reason_for_recall)}<br/>
          <strong>Class:</strong> ${escapeHtml(detail.classification)}</p>`;
      }
      html += '</div>';
      layer.bindPopup(html, { maxHeight: 200 });
    }
  };

  return (
    <div className="bg-[#1E293B] rounded-xl overflow-hidden" style={{ height: '500px' }}>
      <MapContainer
        center={[37.8, -96]}
        zoom={4}
        maxZoom={4}
        minZoom={3}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#1E293B' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <GeoJSON
          key={JSON.stringify(stateRecallCount) + String(normalize)}
          data={geoData}
          style={style}
          onEachFeature={onEachFeature}
          ref={geoJsonRef}
        />
        <InfoControl statesData={geoData} normalize={normalize} infoRef={infoRef} />
        <LegendControl minDensity={minDensity} maxDensity={maxDensity} />
      </MapContainer>
    </div>
  );
}
