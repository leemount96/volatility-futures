import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { WalletInfo } from "./WalletInfo";


export const NavbarComponent = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/" href="/">
            <img
            alt=""
            src={require("../assets/EVIXScreenshot.png")}
            width="30"
            height="30"
            className="d-inline-block align-top"
            />{' '}
            EVIX Protocol
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/deposit" href="deposit">Manage Deposits</Nav.Link>
            <Nav.Link as={Link} to="/trade" href="trade">Trade</Nav.Link>
            <Nav.Link as={Link} to="/lp" href="lp">Provide Liquidity</Nav.Link>
            <NavDropdown title="FAQ" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/risks" href="risks">Risks</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/strategies" href="#strategies">
                Trading Strategies
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/whitepaper" href="#whitepaper">Whitepaper</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/team" href="#action/3.4">
                Team
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <WalletInfo/>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
