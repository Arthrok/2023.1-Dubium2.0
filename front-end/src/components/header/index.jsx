import "./style.css";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../assets/images/logo.jpg";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <img src={logo} alt="logo" className="logo" />
      <ul className="list">
        <li className="item">
          <Link to="/">HOME</Link>
        </li>
        <li className="item">
          <Link to="/forum">FÓRUM</Link>
        </li>
        <li className="item">
          <Link to="/chat">CHAT</Link>
        </li>
        <li className="item">
          <Link to="/about">SOBRE</Link>
        </li>
      </ul>
      <div className="input">
        <SearchIcon />
        <input type="text" placeholder="Buscar" />
      </div>
      <div className="input">
        <li>
          <Link to="/forum">SAIR</Link>
        </li>
        <LogoutIcon />
      </div>
    </header>
  );
}

export default Header;
