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

  // Download PDF'
  
  const downloadPDF = () => {
  const docPDF = new jsPDF("p", "mm", "a4");

  // HEADER
  docPDF.setFontSize(20);
  docPDF.text("RoomSplit - Water Expense History", 20, 11);

  // Underline
  docPDF.setLineWidth(0.5);
  docPDF.line(0, 23, 400, 23);

  const headers = ["No", "Name", "Type", "Amount", "Date", "Desc"];
  const x = [14, 24, 65, 105, 135, 165]; // Better spacing
  let y = 30;

  docPDF.setFontSize(12);
  headers.forEach((h, i) => docPDF.text(h, x[i], y));
  docPDF.line(14, y + 2, 200, y + 2);
  y += 8;

  let total = 0;

  filteredExpenses.forEach((exp, i) => {
    if (y > 260) {
      docPDF.addPage();

      docPDF.setFontSize(20);
      docPDF.text("RoomSplit - Room + Water Expense History", 14, 20);
      docPDF.line(14, 23, 200, 23);

      y = 30;

      docPDF.setFontSize(12);
      headers.forEach((h, i2) => docPDF.text(h, x[i2], y));
      docPDF.line(14, y + 2, 200, y + 2);
      y += 8;
    }

    const dateStr = formatDate(exp.createdAt);
    total += Number(exp.amount || 0);

    // Row items
    docPDF.text(String(i + 1), x[0], y);
    docPDF.text(exp.personName || "-", x[1], y);
    docPDF.text(exp.expenseType || "-", x[2], y);
    docPDF.text(String(exp.amount || "-"), x[3], y);

    // Date wrap fix
    {const dateStr = exp.createdAt.toDate().toLocaleDateString("en-IN");
    docPDF.text(dateStr, x[4], y, { maxWidth: 25 });}


    // Description wrap fix
    docPDF.text(exp.description || "-", x[5], y, { maxWidth: 30 });

    y += 8;
  });

  // TOTAL AMOUNT BOX
  y += 10;
  docPDF.setFontSize(14);
  docPDF.setFont("helvetica", "bold");

  docPDF.rect(14, y - 6, 65, 12); // box
  docPDF.text(`Total Amount: Rs. ${total}`, 18, y + 2);

  docPDF.setFont("helvetica", "normal");

  // FOOTER CENTER
  const line = "----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";
  const address = "404, C Wing, Utkarsh Residency, Shivalay Chowk, Railnagar - 360001";

  docPDF.setFontSize(11);
  docPDF.text(line, 0, 285);
  docPDF.text(address, 105, 290, { align: "center" });

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
