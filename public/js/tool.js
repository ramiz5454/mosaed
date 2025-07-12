document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('generate-form');
    const fileInput = document.getElementById('file-input');
    const uploadArea = document.getElementById('upload-area');
    const fileNameDisplay = document.getElementById('file-name');
    const textInput = document.getElementById('text-input');
    const resultsContainer = document.getElementById('results-container');
    const summaryOutput = document.getElementById('summary-output');
    const questionsOutput = document.getElementById('questions-output');
    const errorMsgDiv = document.getElementById('error-msg');
    const generateBtn = document.getElementById('generate-btn');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
            textInput.disabled = true;
            textInput.placeholder = "سيتم تجاهل هذا الحقل واستخدام الملف المرفوع.";
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const file = fileInput.files[0];
        const text = textInput.value;

        if (!file && !text.trim()) {
            showError('الرجاء رفع ملف أو إدخال نص.');
            return;
        }

        if (file) {
            formData.append('file', file);
        } else {
            formData.append('text', text);
        }

        setLoading(true);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message);
            }

            const data = await response.json();
            displayResults(data);

        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
    
    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        generateBtn.textContent = isLoading ? '...جاري التحليل' : 'تحليل وإنشاء';
        errorMsgDiv.classList.add('hidden');
    }

    function showError(message) {
        errorMsgDiv.textContent = message;
        errorMsgDiv.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
    }

    function displayResults(data) {
        summaryOutput.textContent = data.summary;
        questionsOutput.innerHTML = '';
        data.questions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q;
            questionsOutput.appendChild(li);
        });
        resultsContainer.classList.remove('hidden');
    }
});