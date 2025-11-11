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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all expense data
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "dailyExpenses"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setExpenses(data);
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

  // Delete record
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "dailyExpenses", id));
      setExpenses(expenses.filter((item) => item.id !== id));
      alert("Deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete!");
    }
  };

  // Download as PDF
  const downloadPDF = () => {
  const docPDF = new jsPDF("p", "mm", "a4");

  // Title
  docPDF.setFontSize(18);
  docPDF.setTextColor(40, 40, 40);
  docPDF.text("RoomSplit - Daily Expense History", 14, 20);

  // Table headers
  docPDF.setFontSize(12);
  docPDF.setFont("helvetica", "bold");
  const headers = ["No", "Name", "Expense Type", "Amount (₹)", "Date", "Description"];

  let startY = 30;
  let xPositions = [14, 24, 70, 115, 145, 175]; // Column positions

  // Draw table headers
  headers.forEach((header, i) => {
    docPDF.text(header, xPositions[i], startY);
  });

  // Line under header
  docPDF.line(14, startY + 2, 200, startY + 2);

  // Table rows
  docPDF.setFont("helvetica", "normal");
  let y = startY + 10;

  expenses.forEach((exp, index) => {
    if (y > 270) {
      docPDF.addPage();
      y = 20;
      // Reprint headers on new page
      headers.forEach((header, i) => {
        docPDF.text(header, xPositions[i], y);
      });
      docPDF.line(14, y + 2, 200, y + 2);
      y += 10;
    }

    docPDF.text(String(index + 1), xPositions[0], y);
    docPDF.text(exp.personName || "-", xPositions[1], y);
    docPDF.text(exp.expenseType || "-", xPositions[2], y);
    docPDF.text(String(exp.amount || "-"), xPositions[3], y);
    docPDF.text(formatDate(exp.createdAt), xPositions[4], y, { maxWidth: 30 });
    docPDF.text(exp.description || "-", xPositions[5], y, { maxWidth: 25 });

    y += 10;
  });

  // Save file
  docPDF.save("RoomSplit_Daily_Expense_History.pdf");
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
          <h3 className="text-primary">All Daily Expense History</h3>
          <button className="btn btn-success" onClick={downloadPDF}>
            📄 Download PDF
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : expenses.length === 0 ? (
          <p>No expenses found.</p>
        ) : (
          <ul className="list-group">
            {expenses.map((exp) => (
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
