import { Link, useLocation } from "react-router-dom";

function Navbar() {
    const { pathname } = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">🔍</div>
                    <span>SRM Lost&nbsp;&amp;&nbsp;Found</span>
                </Link>

                {/* Links */}
                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/report-found"
                        className={`nav-link ${pathname === '/report-found' ? 'active' : ''}`}
                    >
                        Found Item
                    </Link>
                    <Link
                        to="/report-lost"
                        className="nav-cta"
                    >
                        + Report Lost
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
