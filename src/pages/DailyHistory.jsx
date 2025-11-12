import React, { useEffect, useState } from "react";
import { db } from "../db/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const DailyHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch all expenses
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "dailyExpenses"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setExpenses(data);
        setFilteredExpenses(data); // show all initially
      } catch (err) {
        console.error("Error fetching history:", err);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  // Format date
  const formatDate = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Handle delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "dailyExpenses", id));
      const updated = expenses.filter((item) => item.id !== id);
      setExpenses(updated);
      setFilteredExpenses(updated);
      alert("Deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete!");
    }
  };

  // Filter by month
  const handleMonthChange = (monthName) => {
    setSelectedMonth(monthName);
    if (!monthName) {
      setFilteredExpenses(expenses);
      return;
    }

    const monthIndex = months.indexOf(monthName);
    const filtered = expenses.filter((exp) => {
      const date = exp.createdAt?.toDate ? exp.createdAt.toDate() : new Date(exp.createdAt);
      return date.getMonth() === monthIndex;
    });
    setFilteredExpenses(filtered);
  };

  // Download PDF
  const downloadPDF = () => {
    const docPDF = new jsPDF("p", "mm", "a4");
    docPDF.setFontSize(18);
    docPDF.text("RoomSplit - Monthly Expense History", 14, 20);

    const headers = ["No", "Name", "Expense Type", "Amount (₹)", "Date", "Description"];
    const xPositions = [14, 24, 70, 115, 145, 175];
    let y = 30;

    // Header
    docPDF.setFontSize(12);
    headers.forEach((h, i) => docPDF.text(h, xPositions[i], y));
    docPDF.line(14, y + 2, 200, y + 2);
    y += 10;

    filteredExpenses.forEach((exp, i) => {
      if (y > 270) {
        docPDF.addPage();
        y = 20;
        headers.forEach((h, i2) => docPDF.text(h, xPositions[i2], y));
        docPDF.line(14, y + 2, 200, y + 2);
        y += 10;
      }
      const dateStr = formatDate(exp.createdAt);
      docPDF.text(String(i + 1), xPositions[0], y);
      docPDF.text(exp.personName || "-", xPositions[1], y);
      docPDF.text(exp.expenseType || "-", xPositions[2], y);
      docPDF.text(String(exp.amount || "-"), xPositions[3], y);
      docPDF.text(dateStr, xPositions[4], y, { maxWidth: 30 });
      docPDF.text(exp.description || "-", xPositions[5], y, { maxWidth: 25 });
      y += 10;
    });

    const monthLabel = selectedMonth || "All_Months";
    docPDF.save(`RoomSplit_${monthLabel}_Expense_History.pdf`);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="container mt-5 flex-grow-1">
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate("/daily-expense")}
        >
          ⬅ Back to Add Expense
        </button>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-primary">Monthly Expense History</h3>
          <button className="btn btn-success" onClick={downloadPDF}>
            📄 Download PDF
          </button>
        </div>

        {/* Month Filter Dropdown */}
        <div className="mb-4">
          <label className="form-label me-2">Select Month:</label>
          <select
            className="form-select w-auto d-inline-block"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
          >
            <option value="">All Months</option>
            {months.map((month, i) => (
              <option key={i} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : filteredExpenses.length === 0 ? (
          <p>No expenses found for this month.</p>
        ) : (
          <ul className="list-group">
            {filteredExpenses.map((exp) => (
              <li
                key={exp.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{exp.personName}</strong> - {exp.expenseType}
                  {exp.description && (
                    <small className="text-muted"> ({exp.description})</small>
                  )}
                  <br />
                  <small className="text-muted">{formatDate(exp.createdAt)}</small>
                </div>
                <div className="text-end">
                  <div>₹{exp.amount}</div>
                  <button
                    className="btn btn-sm btn-danger mt-1"
                    onClick={() => handleDelete(exp.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DailyHistory;
