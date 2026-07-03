import { Link } from "react-router-dom";
import { IMAGES } from "../assets/assets"; 

const NotFound = () => {
  return (
    <>
      <div class="error-box">
				<div class="error-img">
                    <img src={IMAGES.ERROR_404} class="img-fluid" alt="Img"/>
                </div>
				<h3 class="h2 mb-3">Oops, something went wrong</h3>
				<p>Error 404 Page not found. Sorry the page you looking for
                    doesn’t exist or has been moved</p>
         <Link to="/eportal/dashboard"  class="btn btn-primary">
            Go to Dashboard
          </Link>
			</div>
        
  </>

  );
};

export default NotFound;

