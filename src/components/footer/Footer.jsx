const Footer = () => {
    return (
        <footer>
            <div className="footer-inner">
                <span className="footer-status" aria-label="System online">
                    <span className="footer-mark" aria-hidden="true"></span>
                    <span>SYSTEM_ONLINE</span>
                </span>
                <p className="footer-copy">
                    &copy; {new Date().getFullYear()} Brighty Jiji Abraham — All rights reserved
                </p>
                <span className="footer-version">v1.0</span>
            </div>
        </footer>
    );
};

export default Footer;
