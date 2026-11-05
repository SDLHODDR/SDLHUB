const SDLAuthorizationActionButtons = ({
  onAuthorize,
  onReject,
  authorizeLabel = "Authorize",
  rejectLabel = "Reject",
  authorizeDisabled = false,
  rejectDisabled = false,
  loading = false,
}) => {
  return (
    
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-success"
          onClick={onAuthorize}
          disabled={loading || authorizeDisabled}
        >
          {authorizeLabel}
        </button>

        <button
          type="button"
          className="btn btn-danger"
          onClick={onReject}
          disabled={loading || rejectDisabled}
        >
          {rejectLabel}
        </button>
      </div>
    
  );
};

export default SDLAuthorizationActionButtons;