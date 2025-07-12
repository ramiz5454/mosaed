document.addEventListener("DOMContentLoaded", () => {
    // تحديد كل العناصر التي نريد تحريكها عند التمرير
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // إعداد مراقب التقاطع (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // إذا ظهر العنصر في نافذة العرض
            if (entry.isIntersecting) {
                // أضف الكلاس الذي يجعل العنصر مرئيًا
                entry.target.classList.add('is-visible');
                // أوقف المراقبة عن هذا العنصر لتجنب تكرار الحركة
                observer.unobserve(entry.target);
            }
        });
    }, {
        // ابدأ في تفعيل الحركة عندما يكون 15% من العنصر مرئيًا
        threshold: 0.15,
    });

    // ابدأ بمراقبة كل عنصر من العناصر المحددة
    animatedElements.forEach(element => {
        observer.observe(element);
    });
});