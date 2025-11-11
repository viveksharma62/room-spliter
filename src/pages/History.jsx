import React, { useEffect, useState } from "react";
import { auth, db } from "../db/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const History = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("my");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/"); 
        return;
      }

      setLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User document not found!");
          setLoading(false);
          return;
        }

        setUserData(userSnap.data());

        const usersSnap = await getDocs(collection(db, "users"));
        const usersList = [];
        usersSnap.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));
        setAllUsers(usersList);

        await fetchExpenses(user.email, filter);

      } catch (err) {
        console.error("Error fetching data:", err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, filter]);

  const fetchExpenses = async (email, filterOption) => {
    setLoading(true);
    try {
      const expensesRef = collection(db, "expenses");
      let q;
      if (filterOption === "my") {
        q = query(expensesRef, where("personEmail", "==", email));
      } else {
        q = query(expensesRef);
      }
      const snapshot = await getDocs(q);
      const expensesList = [];
      snapshot.forEach(doc => expensesList.push({ id: doc.id, ...doc.data() }));

      expensesList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setExpenses(expensesList);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const totalExpense = filter === "my"
    ? expenses.filter(e => e.personEmail === userData?.email).reduce((acc, curr) => acc + (curr.amount || 0), 0)
    : expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // ✅ Download PDF only
  const downloadPDF = async () => {
    const input = document.getElementById("expense-table");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // --- Header ---
    pdf.setFontSize(18);
    pdf.text("Room Splitter", pdfWidth / 2, 15, { align: "center" });

    // --- Total Expense Box ---
    pdf.setFontSize(12);
    pdf.setFillColor(230, 230, 250);
    pdf.rect(10, 20, pdfWidth - 20, 10, "F");
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Total Expense: ₹${totalExpense}`, pdfWidth / 2, 27, { align: "center" });

    // --- Table Content ---
    pdf.addImage(imgData, "PNG", 10, 35, pdfWidth - 20, pdfHeight);

    // --- Footer ---
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(8);
    pdf.text("Made by Vivek Sharma", 10, pageHeight - 10);
    pdf.text("Room, Railnagar, Pin 360004, Gujarat", pdfWidth - 10, pageHeight - 10, { align: "right" });

    pdf.save(`expenses_${filter}.pdf`);
  };

  if (loading) return <Loading />;

  return (
    <div className="container mt-5">

      {/* Filter Buttons */}
      <div className="mb-3 text-center">
        <button
         className={`btn btn-${filter === "my" ? "danger" : "outline-primary"} mx-1`}
          onClick={() => navigate("/add-expense")}
        >
          ⬅ Back to Add Expense
        </button>
        <button
          className={`btn btn-${filter === "my" ? "primary" : "outline-primary"} mx-1`}
          onClick={() => setFilter("my")}
        >
          My Expenses
        </button>
        <button
          className={`btn btn-${filter === "all" ? "primary" : "outline-primary"} mx-1`}
          onClick={() => setFilter("all")}
        >
          All Expenses
        </button>
        <button className="btn btn-success mx-1" onClick={downloadPDF}>Download PDF</button>
      </div>

      {/* Account Info */}
      {userData && (
        <div className="card shadow p-4 mb-4">
          <h2 className="text-primary mb-3 text-center">Your Info</h2>
          <ul className="list-group list-group-flush">
            <li className="list-group-item"><strong>Name:</strong> {userData.name}</li>
            <li className="list-group-item"><strong>Email:</strong> {userData.email}</li>
            <li className="list-group-item"><strong>Mobile:</strong> {userData.mobile}</li>
            <li className="list-group-item"><strong>Total Expense:</strong> ₹{totalExpense}</li>
            <li className="list-group-item"><strong>Total Members:</strong> {allUsers.length}</li>
          </ul>
        </div>
      )}

      {/* Expense History */}
      <div className="card shadow p-4" id="expense-table">
        <h2 className="text-primary mb-3 text-center">Expense History</h2>
        {expenses.length === 0 ? (
          <div className="text-center text-muted">No expenses found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Expense Type</th>
                  <th>Description</th>
                  <th>Amount (₹)</th>
                  <th>Expense Date</th>
                  <th>Added On</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, index) => (
                  <tr key={exp.id}>
                    <td>{index + 1}</td>
                    <td>{exp.personName || exp.personEmail}</td>
                    <td>{exp.expenseType}</td>
                    <td>{exp.description || "-"}</td>
                    <td>₹{exp.amount || 0}</td>
                    <td>{exp.expenseDate ? new Date(exp.expenseDate.seconds * 1000).toLocaleDateString() : "-"}</td>
                    <td>{formatDate(exp.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
