import React from "react";
import "./Team.css";

import Lee from "../assets/Lee.jpeg";

export const TeamComponent = () => {
  return (
    <div>
      <div className="col-lg-3 col-md-6 col-12 mt-4 pt-2">
        <div className="mt-4 pt-2">
          <div className="team position-relative d-block text-center">
            <div className="image position-relative d-block overflow-hidden">
              <img src={Lee} className="img-fluid rounded" alt="" />
              <div className="overlay rounded bg-dark"></div>
            </div>
            <div className="content py-2 member-position bg-white border-bottom overflow-hidden rounded d-inline-block">
              <h4 className="title mb-0">Lee Mount</h4>
              <small className="text-muted">Founder</small>
            </div>
            <ul className="list-unstyled team-social social-icon social mb-0">
              <li className="list-inline-item">
                <a href="https://twitter.com/lmount_" target="_blank" rel="noreferrer" className="rounded">
                  <i className="mdi mdi-twitter" title="Twitter"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://github.com/leemount96" target="_blank" rel="noreferrer" className="rounded">
                  <i className="mdi mdi-github" title="Github"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://www.linkedin.com/in/lee-mount-843541a9/" rel="noreferrer" target="_blank" className="rounded">
                  <i className="mdi mdi-linkedin" title="Linkedin"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
