import { useEffect, useMemo, useState } from "react";

const names = ["Aarav", "Maya", "Ishita", "Vikram", "Aditi", "Neeraj", "Rohan", "Sana"];
const cities = ["Mumbai", "Pune", "Delhi", "Nagpur", "Jaipur", "Bhopal", "Kolkata"];

const LiveDonationTicker = ({ campaigns }) => {
  const [events, setEvents] = useState(() => createInitialEvents(campaigns));

  useEffect(() => {
    const timer = setInterval(() => {
      setEvents((prev) => [createEvent(campaigns), ...prev].slice(0, 10));
    }, 4500);
    return () => clearInterval(timer);
  }, [campaigns]);

  const text = useMemo(
    () => events.map((item) => `${item.name} donated INR ${item.amount} to ${item.campaign} from ${item.city}`).join("   |   "),
    [events]
  );

  return (
    <div className="glass-card overflow-hidden py-3">
      <div className="relative">
        <div className="whitespace-nowrap px-5 text-sm text-slate-100 motion-safe:animate-[ticker_32s_linear_infinite]">
          {text}
        </div>
      </div>
    </div>
  );
};

function createInitialEvents(campaigns) {
  return Array.from({ length: 5 }).map(() => createEvent(campaigns));
}

function createEvent(campaigns) {
  const name = names[Math.floor(Math.random() * names.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const amount = [250, 500, 1000, 1500, 2000, 5000][Math.floor(Math.random() * 6)];
  const campaign = campaigns.length > 0
    ? campaigns[Math.floor(Math.random() * campaigns.length)].title
    : "Community Relief Campaign";

  return { name, city, amount, campaign };
}

export default LiveDonationTicker;
