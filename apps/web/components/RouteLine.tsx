/**
 * The recurring visual motif for the platform: a route between a pickup
 * point and a destination, with waypoints sized to represent the range of
 * cargo the platform handles (standard package → oversized load). Used
 * once, boldly, in the hero — not repeated as decoration elsewhere.
 */
export function RouteLine() {
  return (
    <svg
      viewBox="0 0 640 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      role="img"
      aria-label="A delivery route from pickup to destination, passing waypoints of increasing cargo size"
    >
      <path
        d="M 40 170 C 160 40, 280 200, 400 90 S 560 40, 600 60"
        stroke="#334D6E"
        strokeWidth="2"
        strokeDasharray="1 10"
        strokeLinecap="round"
        className="route-fade"
      />

      {/* Pickup pin */}
      <circle cx="40" cy="170" r="7" fill="#0E1B2A" />
      <circle
        cx="40"
        cy="170"
        r="12"
        stroke="#0E1B2A"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* Waypoints — increasing size to signal standard → bulk → heavy cargo */}
      <circle cx="210" cy="95" r="4" fill="#E8A33D" />
      <circle cx="345" cy="150" r="6" fill="#E8A33D" />
      <circle cx="470" cy="70" r="9" fill="#E8A33D" />

      {/* Destination pin */}
      <path
        d="M600 60c0 12-14 24-14 24s-14-12-14-24a14 14 0 1 1 28 0Z"
        fill="#2F9E68"
      />
      <circle cx="586" cy="60" r="4" fill="#F4F6F5" />

      <style>{`
        .route-fade {
          opacity: 0;
          animation: fade-route 1s ease-out 0.2s forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .route-fade {
            animation: none;
            opacity: 1;
          }
        }
        @keyframes fade-route {
          to { opacity: 1; }
        }
      `}</style>
    </svg>
  );
}
