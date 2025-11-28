import React, { useEffect, useState } from "react";
import { auth, db } from "../db/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
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
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("my");
  const [selectedMonth, setSelectedMonth] = useState("All");

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

  // -------------------------
  //  FETCH USER + EXPENSE DATA
  // -------------------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);

        // USER FETCH
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserData(snap.data());
        }

        // ALL USERS
        const usersSnap = await getDocs(collection(db, "users"));
        let list = [];
        usersSnap.forEach((d) =>
          list.push({ id: d.id, ...d.data() })
        );
        setAllUsers(list);

        // EXPENSE FETCH
        fetchExpenses(user.email, filter);
      } catch (err) {
        console.log("Error:", err);
      }
    });

    return () => unsub();
  }, [filter]);

  // -------------------------
  //   FETCH EXPENSES
  // -------------------------
  const fetchExpenses = async (email, type) => {
    try {
      setLoading(true);
      const expRef = collection(db, "expenses"); // ⚠️ ensure collection name is "expenses"

      let q;
      if (type === "my") {
        q = query(expRef, where("personEmail", "==", email));
      } else {
        q = query(expRef); // all expenses
      }

      const snap = await getDocs(q);

      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));

      // sort by latest
      list.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      setExpenses(list);
      setFilteredExpenses(list);
      setLoading(false);
    } catch (err) {
      console.log("EXPENSE ERROR:", err);
      setLoading(false);
    }
  };

  // -------------------------
  //   FILTER BY MONTH
  // -------------------------
  useEffect(() => {
    if (selectedMonth === "All") {
      setFilteredExpenses(expenses);
      return;
    }

    const index = monthNames.indexOf(selectedMonth);

    const f = expenses.filter((e) => {
      if (!e.createdAt) return false;

      const d = e.createdAt.toDate
        ? e.createdAt.toDate()
        : new Date(e.createdAt.seconds * 1000);

      return d.getMonth() + 1 === index;
    });

    setFilteredExpenses(f);
  }, [selectedMonth, expenses]);

  const formatDate = (t) => {
    if (!t) return "-";
    const d = t.toDate ? t.toDate() : new Date(t.seconds * 1000);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  };

  const totalExpense =
    filter === "my"
      ? filteredExpenses
          .filter((e) => e.personEmail === userData?.email)
          .reduce((a, b) => a + (b.amount || 0), 0)
      : filteredExpenses.reduce((a, b) => a + (b.amount || 0), 0);

  // -------------------------
  // PDF DOWNLOAD
  // -------------------------
  const downloadPDF = async () => {
    const input = document.getElementById("expense-table");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.text("Room Splitter", width / 2, 12, { align: "center" });
    pdf.addImage(img, "PNG", 10, 20, width - 20, height);
    pdf.save("expenses.pdf");
  };

  if (loading) return <Loading />;

  return (
    <div className="container mt-4">
      {/* FILTER */}
      <div className="text-center mb-3">
        <button
          className="btn btn-secondary mx-1"
          onClick={() => navigate("/add-expense")}
        >
          ⬅ Back
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

        <select
          className="form-select d-inline-block w-auto mx-2"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {monthNames.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <button className="btn btn-success mx-1" onClick={downloadPDF}>
          Download PDF
        </button>
      </div>

      {/* ACCOUNT INFO */}
      {userData && (
        <div className="card p-3 shadow mb-4">
          <h4 className="text-center text-primary">Your Info</h4>
          <ul className="list-group">
            <li className="list-group-item"><b>Name:</b> {userData.name}</li>
            <li className="list-group-item"><b>Email:</b> {userData.email}</li>
            <li className="list-group-item"><b>Total Expense:</b> ₹{totalExpense}</li>
            <li className="list-group-item"><b>Total Members:</b> {allUsers.length}</li>
          </ul>
        </div>
      )}

      {/* TABLE */}
      <div className="card p-4 shadow" id="expense-table">
        <h3 className="text-center text-primary mb-3">
          Expense History ({selectedMonth})
        </h3>

        {filteredExpenses.length === 0 ? (
          <p className="text-center text-muted">No expenses found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Expense Date</th>
                  <th>Added On</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>{e.personName || e.personEmail}</td>
                    <td>{e.expenseType}</td>
                    <td>{e.description || "-"}</td>
                    <td>₹{e.amount}</td>
                    <td>
                      {e.expenseDate
                        ? new Date(e.expenseDate.seconds * 1000).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{formatDate(e.createdAt)}</td>
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
