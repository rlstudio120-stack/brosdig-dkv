        document.addEventListener("DOMContentLoaded", () => {
            // Memilih semua elemen dengan class 'fade-in-section'
            const elementsToAnimate = document.querySelectorAll('.fade-in-section');

            // Konfigurasi observer (memicu animasi ketika 10% elemen masuk viewport)
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    // Jika elemen masuk ke dalam layar
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        // Berhenti memantau elemen ini agar animasi tidak berulang saat scroll naik turun
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Mendaftarkan setiap elemen ke observer
            elementsToAnimate.forEach(element => {
                observer.observe(element);
            });
        });
