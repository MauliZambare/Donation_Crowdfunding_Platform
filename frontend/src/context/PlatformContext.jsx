/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const PlatformContext = createContext(null);

const DEFAULT_STATS = {
  totalDonations: 18345210,
  livesImpacted: 9240,
  verifiedNgos: 118,
};

const SUPPORTED_LANGUAGES = ["en", "hi", "mr"];

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export const PlatformProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem("language");
    return SUPPORTED_LANGUAGES.includes(stored) ? stored : "en";
  });
  const [favorites, setFavorites] = useState(() => readJson("favorites", []));
  const [followedNgos, setFollowedNgos] = useState(() => readJson("followedNgos", []));
  const [donationHistory, setDonationHistory] = useState(() => readJson("donationHistory", []));
  const [impactStats, setImpactStats] = useState(() => readJson("impactStats", DEFAULT_STATS));

  const persist = useCallback((key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const addDonationRecord = useCallback((record) => {
    setDonationHistory((prev) => {
      const next = [record, ...prev].slice(0, 100);
      persist("donationHistory", next);
      return next;
    });

    setImpactStats((prev) => {
      const next = {
        ...prev,
        totalDonations: Math.round((prev.totalDonations || 0) + Number(record.amount || 0)),
        livesImpacted: Math.round((prev.livesImpacted || 0) + Math.max(1, Number(record.amount || 0) / 250)),
      };
      persist("impactStats", next);
      return next;
    });
  }, [persist]);

  const toggleFavorite = useCallback((campaignId) => {
    setFavorites((prev) => {
      const next = prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId];
      persist("favorites", next);
      return next;
    });
  }, [persist]);

  const toggleFollowNgo = useCallback((ngoName) => {
    setFollowedNgos((prev) => {
      const next = prev.includes(ngoName)
        ? prev.filter((name) => name !== ngoName)
        : [...prev, ngoName];
      persist("followedNgos", next);
      return next;
    });
  }, [persist]);

  const changeLanguage = useCallback((lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      return;
    }
    setLanguage(lang);
    localStorage.setItem("language", lang);
  }, []);

  const gamification = useMemo(() => {
    const totalAmount = donationHistory.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const donationDays = new Set(
      donationHistory.map((entry) => new Date(entry.timestamp || Date.now()).toDateString())
    );
    const streak = donationDays.size;
    const xp = Math.round(totalAmount / 10 + donationHistory.length * 40 + streak * 25);
    const level = Math.max(1, Math.floor(xp / 400));

    return {
      totalAmount,
      totalDonations: donationHistory.length,
      streak,
      xp,
      level,
      badges: buildBadges(donationHistory.length, totalAmount, streak),
    };
  }, [donationHistory]);

  const value = useMemo(() => ({
    language,
    changeLanguage,
    favorites,
    toggleFavorite,
    followedNgos,
    toggleFollowNgo,
    donationHistory,
    addDonationRecord,
    impactStats,
    gamification,
  }), [
    language,
    changeLanguage,
    favorites,
    toggleFavorite,
    followedNgos,
    toggleFollowNgo,
    donationHistory,
    addDonationRecord,
    impactStats,
    gamification,
  ]);

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
};

function buildBadges(totalDonations, totalAmount, streak) {
  const badges = [];
  if (totalDonations >= 1) badges.push({ id: "first-donation", title: "First Spark", icon: "FS" });
  if (totalDonations >= 10) badges.push({ id: "community-star", title: "Community Star", icon: "CS" });
  if (totalAmount >= 10000) badges.push({ id: "impact-maker", title: "Impact Maker", icon: "IM" });
  if (streak >= 5) badges.push({ id: "streak-fire", title: "Streak Fire", icon: "SF" });
  return badges;
}

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used inside PlatformProvider");
  }
  return context;
};
