import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";

import BreadcrumbNav from "../../../eportal/components/breadcrumb-nav/BreadcrumbNav";

import {
  //notifySuccess,
  notifyError,
  //notifyWarning,
  //confirmAction,
} from "../../../../services/alertService";

// import SDLTabsComponent from "../../components/tabs/SDLTabsComponent";
// import useSDLTabComponentHandler from "../../portalutils/useSDLTabComponentHandler";



import { getPortalFromPath } from "../../../../config/portalConfig";
import "../../assets/css/profileMaintenance.css";

const Organogram = () => {

  /* ==========================================================
      PORTAL
  ========================================================== */
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  return (
    <>
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>Organogram</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Organogram",
            },
          ]}
        />
      </div>

      {/* Default Nav Tabs */}
      <div className="row">
          <div class="col-xl-12">
	<div class="card">
		<div class="card-header">
			<div class="card-title">
				<select name="" id="">
                  <option>OPT-V3-1</option>
                  <option>OPT-V3-2</option>
                  <option>OPT-V3-3</option>
                  <option>OPT-V3-4</option>
                  <option>OPT-V3-5</option>
                </select>
			</div>
		</div>
		<div class="card-body">
			<div class="tab-style-5-wrapper">
				<ul class="nav nav-pills nav-justified tab-style-5 d-sm-flex d-block" id="pills-tab" role="tablist">
					<li class="nav-item" role="presentation">
						<button class="nav-link active" id="pills-home-tab" data-bs-toggle="pill"
							data-bs-target="#pills-home" type="button" role="tab"
							aria-controls="pills-home" aria-selected="true">Home</button>
					</li>
					<li class="nav-item" role="presentation">
						<button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill"
							data-bs-target="#pills-profile" type="button" role="tab"
							aria-controls="pills-profile" aria-selected="false">About</button>
					</li>
					<li class="nav-item" role="presentation">
						<button class="nav-link" id="pills-contact-tab" data-bs-toggle="pill"
							data-bs-target="#pills-contact" type="button" role="tab"
							aria-controls="pills-contact" aria-selected="false">Services</button>
					</li>
					<li class="nav-item" role="presentation">
						<button class="nav-link" id="pills-disabled-tab" data-bs-toggle="pill"
							data-bs-target="#pills-disabled" type="button" role="tab"
							aria-controls="pills-disabled" aria-selected="false">Contacts</button>
					</li>
				</ul>
				<div class="tab-content" id="pills-tabContent">
					<div class="tab-pane show active text-dark" id="pills-home" role="tabpanel"
						aria-labelledby="pills-home-tab" tabindex="0">
						It is a long established fact that a reader will be distracted by the readable
						content of a page when looking at its layout. The point of using Lorem Ipsum is
						that it has a more-or-less normal distribution of letters, as opposed to using
						'Content here, content here', making it look like readable English. <b>Many
							desktop publishing</b> packages and web page editors now use Lorem Ipsum as
						their default model text, and a search for 'lorem ipsum' will uncover many web
						sites still in their infancy.
					</div>
					<div class="tab-pane text-dark" id="pills-profile" role="tabpanel"
						aria-labelledby="pills-profile-tab" tabindex="0">
						<b>Lorem Ipsum is simply dummy</b> text of the printing and typesetting
						industry. Lorem Ipsum has been the industry's standard dummy text ever since the
						1500s, when an unknown printer took a galley of type and scrambled it to make a
						type specimen book. It has survived not only five centuries, but also the leap
						into electronic typesetting, remaining essentially unchanged. It was popularised
						in the 1960s with the release of Letraset sheets containing Lorem Ipsum
						passages.
					</div>
					<div class="tab-pane text-dark" id="pills-contact" role="tabpanel"
						aria-labelledby="pills-contact-tab" tabindex="0">
						There are many variations of passages of Lorem Ipsum available, but the majority
						have suffered alteration in some form, by injected humour, or randomised words
						which don't look even slightly believable. <b>If you are going</b> to use a
						passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing
						hidden in the middle of text. All the Lorem Ipsum generators on the Internet
						tend to repeat predefined chunks as necessary, making this the first true
						generator on the Internet.
					</div>
					<div class="tab-pane text-dark" id="pills-disabled" role="tabpanel"
						aria-labelledby="pills-disabled-tab" tabindex="0">
						<b>Contrary to popular belief</b>, Contrary to popular belief, Lorem Ipsum is
						not simply random text. It has roots in a piece of classical Latin literature
						from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor
						at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin
						words, consectetur, from a Lorem Ipsum passage, and going through the cites of
						the word in classical literature, discovered the undoubtable source. Lorem Ipsum
						comes from sections.
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
      </div>
      {/* /Default Nav Tabs */}
    </>
  );
};

export default Organogram;
