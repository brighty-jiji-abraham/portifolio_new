const Footer = () => {
    return (
        <footer>
            <div className="footer-inner">
                <span className="footer-status">
                    <span className="footer-mark" aria-hidden="true"></span>
                    <span>Always exploring</span>
                </span>
                <p className="footer-copy">
                    &copy; {new Date().getFullYear()} Brighty Jiji Abraham — All rights reserved
                </p>
                <a className="footer-version" href="#about">Back to the stars ↑</a>
            </div>
        </footer>
    );
};

export default Footer;
