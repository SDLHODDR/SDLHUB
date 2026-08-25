const Badge = ({ text, className = "" }) => {
  return (
    <span className={`badge rounded-pill ${className}`}>
      {text}
    </span>
  );
};

export default Badge;