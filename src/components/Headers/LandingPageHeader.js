
import React from "react";

// reactstrap components
import { Button, Container } from "reactstrap";
import { useSelector, useDispatch } from 'react-redux'

// core components

function LandingPageHeader() {
  let pageHeader = React.createRef();
  const { basenames } = useSelector(state => state.basenames)

  React.useEffect(() => {
    if (window.innerWidth < 991) {
      const updateScroll = () => {
        let windowScrollTop = window.pageYOffset / 3;
        pageHeader.current.style.transform =
          "translate3d(0," + windowScrollTop + "px,0)";
      };
      window.addEventListener("scroll", updateScroll);
      return function cleanup() {
        window.removeEventListener("scroll", updateScroll);
      };
    }
  });

  return (
    
    <>
      <div
        style={{
          backgroundImage:
            "url(" + require("assets/img/daniel-olahh.jpg") + ")",
        }}
        className="section landing-page"
        // data-parallax={true}
        // ref={pageHeader}
      >
        {/* <div className="filter" /> */}
        <Container>
          <div className="motto text-center">
            <h1>MoorHouse CRM</h1>
            <h3>Start managing your clients better Today!</h3>
            <br />
            <Button
              href={(basenames[0]||"")+"/admin/sign-in"}
              className="btn-round mr-1"
              color="neutral"
              target="_blank"
              outline
            >
              
              Get Started
            </Button>
            <Button 
            href={(basenames[0]||"")+"/admin/landing#product-section"}
              className="btn-round" color="neutral" 
              type="button" 
              outline
            >
              Read More
            </Button>
          </div>
        </Container>
      </div>
    </>
  );
}

export default LandingPageHeader;
