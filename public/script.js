document.addEventListener('DOMContentLoaded', () => {
    // الحصول على عناصر الواجهة
    const form = document.getElementById('lecture-form');
    const lectureText = document.getElementById('lecture-text');
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.querySelector('.btn-text');
    const loader = document.querySelector('.loader');
    const errorMessage = document.getElementById('error-message');
    const resultsContainer = document.getElementById('results-container');
    const summaryOutput = document.getElementById('summary-output');
    const questionsOutput = document.getElementById('questions-output');

    // التعامل مع حدث إرسال النموذج
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع إعادة تحميل الصفحة

        const text = lectureText.value.trim();
        if (!text) {
            showError('الرجاء إدخال نص المحاضرة.');
            return;
        }

        // تفعيل وضع التحميل
        setLoading(true);

        try {
            // إرسال الطلب إلى الخادم
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: text }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'حدث خطأ في الخادم.');
            }

            const data = await response.json();
            displayResults(data);

        } catch (error) {
            showError(error.message);
        } finally {
            // إيقاف وضع التحميل
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            resultsContainer.classList.add('hidden');
        } else {
            generateBtn.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function displayResults(data) {
        summaryOutput.textContent = data.summary;
        questionsOutput.innerHTML = ''; // تفريغ القائمة القديمة
        data.questions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q;
            questionsOutput.appendChild(li);
        });
        resultsContainer.classList.remove('hidden');
    }
});