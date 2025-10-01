const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Questions data
const questions = [
  {
    cat: "HTML",
    q: "What is the purpose of the <!DOCTYPE> tag in HTML?",
    options: [
      "To add a stylesheet",
      "To define the HTML version for the browser",
      "To add a comment in HTML",
      "To link JavaScript files"
    ],
    a: 1
  },
  {
    cat: "HTML",
    q: "Which of the following is the correct HTML5 doctype declaration?",
    options: [
      "<!DOCTYPE HTML PUBLIC>",
      "<!DOCTYPE html>",
      "<DOCTYPE html>",
      "<!HTML>"
    ],
    a: 1
  },
  {
    cat: "HTML",
    q: "Where should the <!DOCTYPE> tag be placed in an HTML document?",
    options: [
      "Inside the <body> tag",
      "After the <html> tag",
      "At the very top before <html>",
      "Inside the <head> tag"
    ],
    a: 2
  },
  {
    cat: "HTML",
    q: "What happens if the doctype is missing in an HTML page?",
    options: [
      "Page will not load at all",
      "Browser may go into quirks mode, causing inconsistent rendering",
      "HTML becomes invalid and throws an error",
      "Nothing happens, everything works the same"
    ],
    a: 1
  },
  {
    cat: "HTML",
    q: "Which HTML version uses <!DOCTYPE html>?",
    options: [
      "HTML 3.2",
      "HTML 4.01",
      "HTML5",
      "XHTML 1.0"
    ],
    a: 2
  }
];

const addQuestions = async () => {
  for (const q of questions) {
    try {
      const docRef = await db.collection("questions").add(q);
      console.log("✅ Question added with ID:", docRef.id);
    } catch (e) {
      console.error("❌ Error adding question:", e);
    }
  }
};

addQuestions();
