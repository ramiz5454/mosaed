const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

dotenv.config({ path: '.env.local' });

const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-for-jwt';

// إعداد قاعدة البيانات
const db = new sqlite3.Database('./database.db');

// إعداد Multer لتخزين الملفات في الذاكرة
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ROUTES FOR AUTHENTICATION
// =============================
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'الرجاء إدخال اسم المستخدم وكلمة المرور.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل.' });
        }
        res.status(201).json({ message: 'تم إنشاء الحساب بنجاح!' });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

// MIDDLEWARE TO PROTECT ROUTES
// ================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// AI GENERATION ROUTE (PROTECTED)
// ================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/generate', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        let inputText = req.body.text;

        if (req.file) {
            if (req.file.mimetype === 'application/pdf') {
                const data = await pdf(req.file.buffer);
                inputText = data.text;
            } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
                inputText = value;
            } else {
                return res.status(400).json({ message: 'صيغة الملف غير مدعومة. الرجاء رفع PDF أو DOCX.' });
            }
        }

        if (!inputText) {
            return res.status(400).json({ message: 'لم يتم تقديم أي نص أو ملف صالح.' });
        }

        const prompt = `بصفتك مساعدًا دراسيًا خبيرًا، قم بتحليل النص التالي. مهمتك هي: 1. تلخيص النص في نقاط واضحة وموجزة. 2. إنشاء 5 أسئلة تدريبية متنوعة ومباشرة من النص لمساعدة الطالب على المراجعة. النص هو: "${inputText}" يجب أن تكون الإجابة على هيئة كائن JSON فقط، بالشكل التالي تمامًا ولا شيء غيره: { "summary": "ملخص النص هنا...", "questions": [ "السؤال الأول؟", "السؤال الثاني؟", "السؤال الثالث؟", "السؤال الرابع؟", "السؤال الخامس؟" ] }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json|```/g, '').trim();
        res.json(JSON.parse(responseText));

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء معالجة طلبك.' });
    }
});

app.listen(port, () => {
    console.log(`🚀 الخادم المطور يعمل على http://localhost:${port}`);
});