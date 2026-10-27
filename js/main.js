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

        document.addEventListener("DOMContentLoaded", () => {
    // Logika Filter Galeri
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Hapus class active dari semua tombol
            filterBtns.forEach(b => {
                b.classList.remove('bg-brand-orange', 'text-white', 'shadow-md', 'active');
                b.classList.add('bg-white', 'text-gray-600');
            });

            // Tambahkan class active ke tombol yang diklik
            btn.classList.add('bg-brand-orange', 'text-white', 'shadow-md', 'active');
            btn.classList.remove('bg-white', 'text-gray-600');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'semua' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Animasi sederhana saat filter
                    item.animate([
                        { opacity: 0, transform: 'scale(0.95)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ], { duration: 300, fill: 'forwards' });
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // Navigasi Scroll Horizontal Fasilitas
    const carouselFasilitas = document.getElementById('carousel-fasilitas');
    const btnPrevFasilitas = document.getElementById('btn-prev-fasilitas');
    const btnNextFasilitas = document.getElementById('btn-next-fasilitas');

    if(carouselFasilitas && btnPrevFasilitas && btnNextFasilitas) {
        // Besaran scroll (mengambil ukuran 1 card)
        const scrollAmount = 300; 

        btnNextFasilitas.addEventListener('click', () => {
            carouselFasilitas.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        btnPrevFasilitas.addEventListener('click', () => {
            carouselFasilitas.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }
});