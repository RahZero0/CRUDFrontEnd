import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();
  const sadFaceIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABIAQMAAABvIyEEAAAABlBMVEUAAABTU1OoaSf/AAAAAXRSTlMAQObYZgAAAENJREFUeF7tzbEJACEQRNGBLeAasBCza2lLEGx0CxFGG9hBMDDxRy/72O9FMnIFapGylsu1fgoBdkXfUHLrQgdfrlJN1BdYBjQQm3UAAAAASUVORK5CYII=";

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#202124' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            {/* Error Icon */}
            <div className="text-left mb-4">
              <img 
                src={sadFaceIcon} 
                alt="Sad Face" 
                style={{ 
                  width: '100px',
                  height: '100px',
                  filter: 'brightness(0.7)'
                }}
              />
            </div>

            {/* Error Message */}
            <h1 className="text-white fw-normal mb-4 fs-2">This site can't be reached</h1>
            
            <div className="mb-4">
              <p className="text-white mb-4">
                <span className="fw-bold">localhost</span> refused to connect.
              </p>
              
              <div>
                <p className="text-white mb-2">Try:</p>
                <ul className="list-unstyled ps-4">
                <li
                  className="mb-2 text-secondary"
                  onClick={() => navigate('/hello')} // Add pointer cursor for better UX
                >
                  • Checking the connection
                </li>
                  <li className="mb-2">
                    <a href="/" className="text-primary text-decoration-none">
                      • Checking the proxy and the firewall
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="mt-4" style={{ color: '#8E8E8E' }}>
                ERR_CONNECTION_REFUSED
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex align-items-center justify-content-between">
              <button className="btn btn-primary px-4">
                Reload
              </button>
              <button className="btn text-primary p-0 border-0">
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;