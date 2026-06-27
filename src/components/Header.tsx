
const Header = () => {
  return (
  <nav id="mainNav" className="navbar navbar-expand-lg navbar-sticky navbar-dark">
    <div className="container px-6">
      <a href="#" className="navbar-brand">
        <span
            className={"font-bold text-white text-3xl"}
            style={{ fontFamily: "'Transforma Mix', 'Playfair Display', Georgia, serif" }}>
                Cintent.AI</span>
        </a>

      <ul className="navbar-nav navbar-nav-secondary order-lg-3">
        <li className="nav-item">
          <a href="#main"
            className="d-none d-md-block btn btn-outline-white rounded-pill ms-2">
            Get Started
          </a>
        </li>
      </ul>

    </div>
  </nav>
  )
}

export default Header
