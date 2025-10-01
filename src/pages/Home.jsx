import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Testimonial from "./Testimonial";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section
        className="d-flex align-items-center justify-content-center text-center text-white"
        style={{
          minHeight: "80vh",
          background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
        }}
      >
        <Container>
          <h1 className="display-3 fw-bold mb-3">
            Welcome to <span className="text-warning">RoomieSplit 💸</span>
          </h1>
          <p className="lead mb-4">
            Track expenses, settle payments, and live peacefully with roommates 🏠
          </p>
          <div>
            <Button
              variant="warning"
              size="lg"
              className="me-3"
              onClick={() => navigate("/add-expense")}
            >
              Add Expense ➕
            </Button>
            <Button
              variant="light"
              size="lg"
              onClick={() => navigate("/person-account")}
            >
              View Accounts 👤
            </Button>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5 fw-bold text-primary">
            Why Choose RoomieSplit?
          </h2>
          <Row>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100 shadow-sm">
                <Card.Body>
                  <i className="bi bi-cash-stack fs-1 mb-3 text-success"></i>
                  <h5 className="fw-bold">Track Expenses</h5>
                  <p className="text-muted">
                    Keep all roommate expenses in one place and never lose track.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100 shadow-sm">
                <Card.Body>
                  <i className="bi bi-people-fill fs-1 mb-3 text-info"></i>
                  <h5 className="fw-bold">Fair Splits</h5>
                  <p className="text-muted">
                    Split bills equally or customize shares easily.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="text-center h-100 shadow-sm">
                <Card.Body>
                  <i className="bi bi-phone-fill fs-1 mb-3 text-warning"></i>
                  <h5 className="fw-bold">Mobile Friendly</h5>
                  <p className="text-muted">
                    Access balances and history anytime, anywhere.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-white">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-4">
              <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                <Card.Img
                  src="https://img.freepik.com/premium-vector/group-people-sitting-around-table-counting-money-bills_102902-2744.jpg"
                  alt="Roommates splitting expenses"
                  style={{ maxHeight: "350px", objectFit: "cover" }}
                />
              </Card>
            </Col>
            <Col md={6}>
              <h2 className="fw-bold text-primary mb-3">Split Expenses Without Stress</h2>
              <p className="text-muted">
                Add your roommates, log expenses, and let RoomieSplit calculate who owes whom.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="mt-3"
                onClick={() => navigate("/add-expense")}
              >
                Start Splitting Now 🚀
              </Button>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5 fw-bold text-success">What Users Say</h2>
          <Testimonial />
        </Container>
      </section>
    </div>
  );
};

export default Home;
