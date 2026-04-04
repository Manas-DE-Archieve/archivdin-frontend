import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function StatsBar() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/persons/stats/summary`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const loading = !stats;

  return (
    <div className="stats-bar">
      {[
        { label: t("stats.total"),        value: stats?.total },
        { label: t("stats.executed"),      value: stats?.executed },
        { label: t("stats.rehabilitated"), value: stats?.rehabilitated },
        { label: t("stats.regions"),       value: stats?.regions },
      ].map(({ label, value }) => (
        <div key={label} className="stat-item">
          <span className="stat-value">{value ?? "—"}</span>
          <span className="stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
