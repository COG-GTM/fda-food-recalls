import { useState, useEffect } from 'react';
import { buildRecallData, filterByClassification } from '../utils/stateData';

/**
 * Custom hook that fetches recall data from Flask API and processes it.
 * @param {Object} filters - { class1, class2, class3, startDate, endDate }
 * @returns {{ stateRecallCount, firmName, firmCount, loading, error }}
 */
export function useRecallData(filters) {
  const [data, setData] = useState({
    stateRecallCount: [],
    firmName: [],
    firmCount: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { class1, class2, class3, startDate, endDate } = filters;
    if (!startDate || !endDate) return;

    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const url = `/data/${class1}/${class2}/${class3}/${startDate}/${endDate}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((recalls) => {
        if (active) {
          const result = buildRecallData(recalls);
          setData(result);
        }
      })
      .catch((err) => {
        if (active && err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; controller.abort(); };
  }, [filters.class1, filters.class2, filters.class3, filters.startDate, filters.endDate]);

  return { ...data, loading, error };
}

/**
 * Custom hook for fetching recent recalls from FDA API.
 */
export function useCurrentRecallData() {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateInfo, setDateInfo] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError(null);

    fetch('https://api.fda.gov/food/enforcement.json?sort=recall_initiation_date:desc&limit=100')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const results = json.results;
        setRawData(results);

        // Find date range
        let max = 0;
        let min = Infinity;
        for (const item of results) {
          const d = parseFloat(item.recall_initiation_date);
          if (d > max) max = d;
          if (d < min) min = d;
        }
        const maxStr = String(max);
        const minStr = String(min);
        const startDate = `${minStr.slice(0, 4)}-${minStr.slice(4, 6)}-${minStr.slice(6, 8)}`;
        const endDate = `${maxStr.slice(0, 4)}-${maxStr.slice(4, 6)}-${maxStr.slice(6, 8)}`;
        setDateInfo(`Showing ${results.length} records from ${startDate} to ${endDate}`);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const getFilteredData = (class1, class2, class3) => {
    if (!rawData) return { stateRecallCount: [], stateRecallDetails: null, firmName: [], firmCount: [] };
    const filtered = filterByClassification(rawData, class1, class2, class3);
    return buildRecallData(filtered, true);
  };

  return { rawData, fetchData, getFilteredData, loading, error, dateInfo };
}

/**
 * Custom hook for fetching CPSC recall data.
 */
export function useCPSCRecallData(filters) {
  const [data, setData] = useState({
    stateRecallCount: [],
    firmName: [],
    firmCount: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filters.category) params.set('ProductType', filters.category);
    if (filters.startDate) params.set('RecallDateStart', filters.startDate);
    if (filters.endDate) params.set('RecallDateEnd', filters.endDate);

    fetch(`/cpsc/recalls?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((recalls) => {
        if (active) {
          const result = buildRecallData(recalls);
          setData(result);
        }
      })
      .catch((err) => {
        if (active && err.name !== 'AbortError') {
          setError(err.message);
        }
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; controller.abort(); };
  }, [filters.category, filters.startDate, filters.endDate]);

  return { ...data, loading, error };
}
