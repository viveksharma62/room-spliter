 import React, { useEffect, useState } from "react";
import { db, auth } from "../db/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AddExpense = () => {
  const navigate = useNavigate();

  const [personEmail, setPersonEmail] = useState("");
  const [personName, setPersonName] = useState("");
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [expenseType, setExpenseType] = useState("");
  const [otherExpense, setOtherExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().substr(0, 10)
  );
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("All");

  const expenseTypes = [
    "Room Rent",
    "Water",
    "Electricity",
    "Shopping",
    "Food",
    "Other",
  ];

  const monthNames = [
    "All",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // 🟦 Fetch user name and email
  const fetchUser = async () => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().name) {
      setPersonName(userSnap.data().name);
      setIsNameEditable(false);
    } else {
      setPersonName("");
      setIsNameEditable(true);
    }

    setPersonEmail(auth.currentUser.email);
  };

  // 🟦 Fetch all expenses
  const fetchExpenses = async () => {
    setLoading(true);
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const data = [];
    snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));

    setAllExpenses(data);
    setFilteredExpenses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
    fetchExpenses();
  }, []);

  // 🟦 Month filter logic
  useEffect(() => {
    if (selectedMonth === "All") {
      setFilteredExpenses(allExpenses);
    } else {
      const monthIndex = monthNames.indexOf(selectedMonth);
      const filtered = allExpenses.filter((exp) => {
        if (!exp.createdAt) return false;
        const date = exp.createdAt.toDate
          ? exp.createdAt.toDate()
          : new Date(exp.createdAt.seconds * 1000);
        return date.getMonth() + 1 === monthIndex;
      });
      setFilteredExpenses(filtered);
    }
  }, [selectedMonth, allExpenses]);

  // 🟦 Submit expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personEmail || !personName || !expenseType || !amount) return;

    const finalExpenseType =
      expenseType === "Other" ? otherExpense : expenseType;

    await addDoc(collection(db, "expenses"), {
      personEmail,
      personName,
      expenseType: finalExpenseType,
      amount: parseFloat(amount),
      description,
      expenseDate: new Date(expenseDate),
      createdAt: new Date(),
    });

    setExpenseType("");
    setOtherExpense("");
    setAmount("");
    setDescription("");
    setExpenseDate(new Date().toISOString().substr(0, 10));

    fetchExpenses();
  };

  // 🟦 Calculate totals
  const totals = filteredExpenses.reduce((acc, curr) => {
    const key = curr.personName
      ? `${curr.personName} (${curr.personEmail})`
      : curr.personEmail;

    if (!acc[key]) acc[key] = 0;
    acc[key] += curr.amount;

    return acc;
  }, {});

  const formatDate = (timestamp) => {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="container mt-5">
      <div className="row">
        
        {/* Left Side Form */}
        <div className="col-md-6 mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary mb-3"
            onClick={() => navigate("/")}
          >
            ⬅ Back to home
          </button>

          <div className="card shadow p-4">
            <h3 className="mb-4 text-primary">Add Expense</h3>

            <form onSubmit={handleSubmit}>
              {/* User Name */}
              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  readOnly={!isNameEditable}
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label">Your Email</label>
                <input
                  type="text"
                  className="form-control"
                  value={personEmail}
                  readOnly
                />
              </div>

              {/* Expense Type */}
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

              {/* Other Expense */}
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

              {/* Amount */}
              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description (optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="mb-3">
                <label className="form-label">Expense Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                />
              </div>

              {/* Add Expense */}
              <button className="btn btn-success w-100" type="submit">
                Add Expense
              </button>

              {/* View History Button (Important: prevent form submit) */}
              <button
                type="button"
                className="btn btn-primary w-100 mt-3"
                onClick={() => navigate("/history")}
              >
                View Expense History
              </button>
            </form>
          </div>
        </div>

        {/* Right Side Summary */}
        <div className="col-md-6">
          <div className="card shadow p-4">
            <h3 className="mb-4 text-primary">Expense Summary</h3>

            {/* Month Filter */}
            <div className="mb-3">
              <label className="form-label">Filter by Month</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {monthNames.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Expense List */}
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <ul className="list-group mb-3">
                  {filteredExpenses.map((exp) => (
                    <li key={exp.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{exp.personName}</strong> ({exp.personEmail}) -{" "}
                          {exp.expenseType}
                          {exp.description && (
                            <small> ({exp.description})</small>
                          )}
                          <br />
                          <small className="text-muted">
                            {formatDate(exp.createdAt)}
                          </small>
                        </div>

                        <div>₹{exp.amount}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Total per Person */}
                <h5>Total per Person:</h5>
                <ul className="list-group mb-3">
                  {Object.entries(totals).map(([key, value]) => (
                    <li
                      key={key}
                      className="list-group-item d-flex justify-content-between"
                    >
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

export default AddExpense;
