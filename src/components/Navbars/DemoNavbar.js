import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
  InputGroup,
  Input,
} from "reactstrap";
import useAuth from "variables/hooks/useAuth";
import routes from "@/routes.js";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [color, setColor] = useState("transparent");
  const sidebarToggle = React.useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logoutUser } = useAuth(); // Use useAuth hook for logout

  const toggle = () => {
    if (isOpen) {
      setColor("transparent");
    } else {
      setColor("dark");
    }
    setIsOpen(!isOpen);
  };

  const dropdownToggle = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  const getBrand = () => {
    let brandName = "Dashboard"; // Static brand name
    routes.map((prop) => {
      if (window.location.href.indexOf(prop.layout + prop.path) !== -1) {
        brandName = prop.name;
      }
      return null;
    });
    return brandName;
  };

  const openSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    sidebarToggle.current.classList.toggle("toggled");
  };

  // function that adds color dark/transparent to the navbar on resize (this is for the collapse)
  const updateColor = () => {
    if (window.innerWidth < 993 && isOpen) {
      setColor("dark");
    } else {
      setColor("transparent");
    }
  };

  useEffect(() => {
    window.addEventListener("resize", updateColor.bind(this));
    return function cleanup() {
      window.removeEventListener("resize", updateColor.bind(this));
    };
  }, [isOpen]); // Added isOpen to dependency array

  useEffect(() => {
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      sidebarToggle.current.classList.toggle("toggled");
    }
  }, [location]);

  const handleLogout = () => {
    logoutUser(); // Call the logoutUser from the useAuth hook
  };

  const AuthedActions = () => (
    <Container fluid>
      <div className="navbar-wrapper">
        <div className="navbar-toggle">
          <button
            type="button"
            ref={sidebarToggle}
            className="navbar-toggler"
            onClick={openSidebar}
          >
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </button>
        </div>
        <NavbarBrand href="/">{getBrand()}</NavbarBrand>
      </div>
      <NavbarToggler onClick={toggle}>
        <span className="navbar-toggler-bar navbar-kebab" />
        <span className="navbar-toggler-bar navbar-kebab" />
        <span className="navbar-toggler-bar navbar-kebab" />
      </NavbarToggler>
      <Collapse isOpen={isOpen} navbar className="justify-content-end">
        <form>
          <InputGroup className="no-border">
            <Input placeholder="Search..." />
            {/* <InputGroupAddon addonType="append">
              <InputGroupText>
                <i className="nc-icon nc-zoom-split" />
              </InputGroupText>
            </InputGroupAddon> */}
          </InputGroup>
        </form>
        <Nav navbar>
          <NavItem>
            <Link to="#pablo" className="nav-link btn-magnify">
              <i className="nc-icon nc-layout-11" />
              <p>
                <span className="d-lg-none d-md-block">Stats</span>
              </p>
            </Link>
          </NavItem>
          <Dropdown
            nav
            isOpen={dropdownOpen}
            toggle={dropdownToggle}
          >
            <DropdownToggle caret nav>
              <i className="nc-icon nc-bell-55" />
              <p>
                <span className="d-lg-none d-md-block">Some Actions</span>
              </p>
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem tag="a">Profile</DropdownItem>
              <DropdownItem tag="a">Settings</DropdownItem>
              <DropdownItem divider />
              <DropdownItem onClick={handleLogout}>
                Log out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <NavItem>
            <Link to="#pablo" className="nav-link btn-rotate">
              <i className="nc-icon nc-settings-gear-65" />
              <p>
                <span className="d-lg-none d-md-block">Account</span>
              </p>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </Container>
  );

  const UnauthedActions = () => (
    <Button
      href="/auth"
      className="btn-curved m-1"
      color="light"
      size="sm"
      tag="a"
    >
      Sign In
    </Button>
  );

  return (
    // add or remove classes depending if we are on full-screen-maps page or not
    <Navbar
      color={
        location.pathname.indexOf("full-screen-maps") !== -1 ? "dark" : color
      }
      expand="lg"
      className={
        location.pathname.indexOf("full-screen-maps") !== -1
          ? "navbar-absolute fixed-top"
          : "navbar-absolute fixed-top " +
            (color === "transparent" ? "navbar-transparent " : "")
      }
    >
      {isAuthenticated ? <AuthedActions /> : <UnauthedActions />}
    </Navbar>
  );
}

export default Header;