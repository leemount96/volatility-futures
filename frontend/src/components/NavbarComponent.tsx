import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { WalletInfo } from "./WalletInfo";

export const NavbarComponent = ({}) => {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">EVIX Protocol</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#trade">Trade</Nav.Link>
            <Nav.Link href="#lp">Provide Liquidity</Nav.Link>
            <NavDropdown title="FAQ" id="basic-nav-dropdown">
              <NavDropdown.Item href="#risks">Risks</NavDropdown.Item>
              <NavDropdown.Item href="#strategies">
                Trading Strategies
              </NavDropdown.Item>
              <NavDropdown.Item href="#whitepaper">Whitepaper</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Landing Page
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
