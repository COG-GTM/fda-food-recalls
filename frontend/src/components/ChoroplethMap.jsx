import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { statesData } from '../data/us-states'

const STATE_POPULATIONS = {
  "Alabama": 4779736, "Alaska": 710231, "Arizona": 6392017, "Arkansas": 2915918,
  "California": 37254523, "Colorado": 5029196, "Connecticut": 3574097, "Delaware": 897934,
  "District of Columbia": 601723, "Florida": 18801310, "Georgia": 9687653, "Hawaii": 1360301,
  "Idaho": 1567582, "Illinois": 12830632, "Indiana": 6483802, "Iowa": 3046355,
  "Kansas": 2853118, "Kentucky": 4339367, "Louisiana": 4533372, "Maine": 1328361,
  "Maryland": 5773552, "Massachusetts": 6547629, "Michigan": 9883640, "Minnesota": 5303925,
  "Mississippi": 2967297, "Missouri": 5988927, "Montana": 989415, "Nebraska": 1826341,
  "Nevada": 2700551, "New Hampshire": 1316470, "New Jersey": 8791894, "New Mexico": 2059179,
  "New York": 19378102, "North Carolina": 9535483, "North Dakota": 672591, "Ohio": 11536504,
  "Oklahoma": 3751351, "Oregon": 3831074, "Pennsylvania": 12702379, "Rhode Island": 1052567,
  "South Carolina": 4625364, "South Dakota": 814180, "Tennessee": 6346105, "Texas": 25145561,
  "Utah": 2763885, "Vermont": 625741, "Virginia": 8001024, "Washington": 6724540,
  "West Virginia": 1852994, "Wisconsin": 5686986, "Wyoming": 563626, "Puerto Rico": 3725789
}

function getColor(d, max, min) {
  const range = max - min
  const step = 0.125 * range
  if (d >= max - step) return '#22D3EE'
  if (d >= max - 2 * step) return '#38BDF8'
  if (d >= max - 3 * step) return '#60A5FA'
  if (d >= max - 4 * step) return '#818CF8'
  if (d >= max - 5 * step) return '#A78BFA'
  if (d >= max - 6 * step) return '#C4B5FD'
  if (d >= max - 7 * step) return '#DDD6FE'
  return '#1E293B'
}

export default function ChoroplethMap({ recallCounts, normalize = false, onStateClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapRef.current, {
      center: [37.8, -96],
      zoom: 4,
      maxZoom: 6,
      minZoom: 3,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map)

    const geoData = JSON.parse(JSON.stringify(statesData))

    let maxVal = 0
    let minVal = Infinity
    geoData.features.forEach(feature => {
      const stateName = feature.properties.name
      let count = recallCounts[stateName] || 0
      if (normalize && STATE_POPULATIONS[stateName]) {
        count = (count / STATE_POPULATIONS[stateName]) * 1000000
      }
      feature.properties.density = count
      if (count > maxVal) maxVal = count
      if (count < minVal) minVal = count
    })

    const geojson = L.geoJson(geoData, {
      style: (feature) => ({
        fillColor: getColor(feature.properties.density, maxVal, minVal),
        weight: 1,
        opacity: 1,
        color: '#475569',
        fillOpacity: 0.7,
      }),
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: (e) => {
            const l = e.target
            l.setStyle({ weight: 2, color: '#22D3EE', fillOpacity: 0.9 })
            l.bringToFront()
            info.update(l.feature.properties)
          },
          mouseout: (e) => {
            geojson.resetStyle(e.target)
            info.update()
          },
          click: () => {
            if (onStateClick) onStateClick(feature.properties.name)
          }
        })
      }
    }).addTo(map)

    const info = L.control()
    info.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info')
      this._div.style.cssText = 'padding:8px 12px;background:rgba(15,23,42,0.9);color:#fff;border-radius:8px;font-size:13px;border:1px solid #334155;'
      this.update()
      return this._div
    }
    info.update = function (props) {
      const val = props ? (normalize ? props.density.toFixed(2) + ' per 1M' : Math.round(props.density)) : ''
      this._div.innerHTML = props
        ? `<strong>${props.name}</strong><br/>${val} recalls`
        : '<em style="color:#94A3B8">Hover over a state</em>'
    }
    info.addTo(map)

    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = function () {
      const div = L.DomUtil.create('div')
      div.style.cssText = 'padding:8px 12px;background:rgba(15,23,42,0.9);border-radius:8px;border:1px solid #334155;'
      const step = (maxVal - minVal) / 4
      const grades = [minVal, minVal + step, minVal + 2 * step, minVal + 3 * step]
      let html = '<div style="color:#94A3B8;font-size:11px;margin-bottom:4px;">Recall Density</div>'
      grades.forEach((g, i) => {
        html += `<span style="display:inline-block;width:24px;height:12px;background:${getColor(g, maxVal, minVal)};margin-right:2px;border-radius:2px;"></span>`
      })
      html += `<div style="display:flex;justify-content:space-between;color:#CBD5E1;font-size:10px;margin-top:2px;"><span>${normalize ? minVal.toFixed(1) : Math.round(minVal)}</span><span>${normalize ? maxVal.toFixed(1) : Math.round(maxVal)}</span></div>`
      div.innerHTML = html
      return div
    }
    legend.addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [recallCounts, normalize, onStateClick])

  return <div ref={mapRef} className="w-full h-[500px] rounded-xl" />
}
