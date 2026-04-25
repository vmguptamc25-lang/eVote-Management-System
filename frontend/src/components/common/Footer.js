import "../../assets/css/HeaderFooter/common.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <h2><span>me2</span>vote</h2>
          <p>
            Secure & Digital Voting System ensuring transparency,
            privacy, and trust in every vote.
          </p>
        </div>

        {/* Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Elections</a></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-links">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Security</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-links">
          <h4>Contact</h4>
          <ul>
            <li>Email: support@me2vote.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>India</li>
          </ul>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} me2vote. All rights reserved.</p>
      </div>
    </footer>
  );
}
