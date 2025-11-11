import React, { useEffect, useState } from "react";
import { db } from "../db/firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const DailyExpense = () => {
  const [personName, setPersonName] = useState("");
  const [expenseType, setExpenseType] = useState("");
  const [otherExpense, setOtherExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().substr(0, 10));
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const expenseTypes = ["Water", "Shopping", "Veg", "Non-Veg", "Other"];

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "dailyExpenses"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setAllExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // ✅ Updated handleSubmit (Now supports past date)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personName || !expenseType) return alert("Please enter name and expense type");

    const finalExpenseType = expenseType === "Other" ? otherExpense : expenseType;

    try {
      // Convert selected date
      const selectedDate = new Date(expenseDate);

      await addDoc(collection(db, "dailyExpenses"), {
        personName,
        expenseType: finalExpenseType,
        amount: amount ? parseFloat(amount) : 0,
        description,
        expenseDate: selectedDate, // user-selected date
        createdAt: selectedDate, // use same for sorting
      });

      // Reset fields
      setPersonName("");
      setExpenseType("");
      setOtherExpense("");
      setAmount("");
      setDescription("");
      setExpenseDate(new Date().toISOString().substr(0, 10));

      fetchExpenses();
      alert("Expense added successfully ✅");
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  // Calculate totals per person
  const totals = allExpenses.reduce((acc, curr) => {
    const key = curr.personName || "Unknown";
    if (!acc[key]) acc[key] = 0;
    acc[key] += curr.amount;
    return acc;
  }, {});

  const formatDate = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="container mt-5">
      <div className="row">

        {/* Form Section */}
        <div className="col-md-6 mb-4">
          <button
            className="btn btn-outline-secondary mb-3"
            onClick={() => navigate("/")}
          >
            ⬅ Back to Home
          </button>

          <div className="card shadow p-4">
            <h3 className="mb-4 text-primary">Add Daily Expense</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Expense Type</label>
                <select
                  className="form-select"
                  value={expenseType}
                  onChange={(e) => setExpenseType(e.target.value)}
                  required
                >
                  <option value="">Select Expense Type</option>
                  {expenseTypes.map((type, i) => (
                    <option key={i} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {expenseType === "Other" && (
                <div className="mb-3">
                  <label className="form-label">Enter Your Expense Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={otherExpense}
                    onChange={(e) => setOtherExpense(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Amount (optional)</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (optional)"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description (optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>

              <div className="mb-3 d-flex align-items-center gap-2">
                <div className="flex-grow-1">
                  <label className="form-label">Expense Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>
                {/* Shortcut Button */}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary mt-4"
                  onClick={() =>
                    setExpenseDate(new Date().toISOString().substr(0, 10))
                  }
                >
                  Today
                </button>
              </div>

              <button className="btn btn-success w-100 mb-3">Add Expense</button>
            </form>

            <button
              onClick={() => navigate("/daily-history")}
              className="btn btn-outline-primary w-100"
            >
              View Full History 📜
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h3 className="mb-4 text-primary">Daily Expense Summary</h3>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <ul className="list-group mb-3">
                  {allExpenses.slice(0, 5).map((exp) => (
                    <li key={exp.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{exp.personName}</strong> - {exp.expenseType}{" "}
                          {exp.description && <small>({exp.description})</small>}
                          <br />
                          <small className="text-muted">{formatDate(exp.createdAt)}</small>
                        </div>
                        <div>₹{exp.amount}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <h5>Total per Person:</h5>
                <ul className="list-group mb-3">
                  {Object.entries(totals).map(([key, value]) => (
                    <li key={key} className="list-group-item d-flex justify-content-between">
                      <span>{key}</span>
                      <span>₹{value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyExpense;
