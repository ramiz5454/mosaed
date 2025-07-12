// هذا الملف يُنفذ مرة واحدة فقط لإعداد قاعدة البيانات
const sqlite3 = require('sqlite3').verbose();

// سيتم إنشاء ملف 'database.db' في نفس المجلد
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // إنشاء جدول المستخدمين إذا لم يكن موجوداً
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            } else {
                console.log('Users table created successfully.');
            }
        });
    }
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
});