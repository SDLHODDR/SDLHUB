import "../assets/css/badges.css";

const Badge = ({ text, className = "", style }) => {
  const isSuccessBadge = /(?:^|\s)(?:bg-success|badge-success|badge-approved|badges-success)(?:\s|$)/i.test(className);

  return (
    <span
      className={`badge rounded-pill ${isSuccessBadge ? "eportal-success-badge" : ""} ${className}`}
      style={style}
    >
      {text}
    </span>
  );
};

export default Badge;
