import stubs from "../stubs";

const ResetModal = ({
  language,
  onCloseModal,
  showModal,
  handleCodeChange,
}) => {

  const resetCode = () => {
    handleCodeChange(stubs[language]);
    onCloseModal();
  };

  return (
    <>
      {showModal && (
        <>
          <div className="fade modal-backdrop show"></div>
          <div className="modal" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reset Code</h5>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    width="20"
                    viewBox="0 0 384 512"
                    className="svg-icon"
                    onClick={onCloseModal}
                  >
                    <path
                      fill="#909294"
                      d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                    />
                  </svg>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to reset the code ?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={onCloseModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={resetCode}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ResetModal;
