// Import SDK Firebase versi Modular dari CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Config Firebase Console Anda
const firebaseConfig = {
    apiKey: "AIzaSyCyTYYTR18CERTqAO7M3rzlb8eBameaBHU",
    authDomain: "brosur-dkv-smkn1.firebaseapp.com",
    projectId: "brosur-dkv-smkn1",
    storageBucket: "brosur-dkv-smkn1.firebasestorage.app",
    messagingSenderId: "482994804087",
    appId: "1:482994804087:web:2b4ef389a4df8518f77d72"
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. Fungsi untuk menarik data galeri secara asinkron
async function renderGaleri() {
    const galeriContainer = document.getElementById('galeri-container');
    if (!galeriContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "karya_siswa"));
        
        let htmlContent = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            htmlContent += `
                <div class="relative overflow-hidden rounded-2xl group border border-white/10 shadow-lg cursor-pointer fade-in-section">
                    <img src="${data.url_gambar}" alt="${data.judul}" class="w-full h-72 object-cover transform transition duration-700 group-hover:scale-110">
                    
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 class="text-xl font-bold text-white mb-1">${data.judul}</h3>
                        <p class="text-brand-100 text-sm font-medium mb-2">${data.kreator}</p>
                        <p class="text-gray-300 text-xs">${data.deskripsi}</p>
                    </div>
                </div>
            `;
        });

        galeriContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error("Gagal memuat galeri:", error);
        galeriContainer.innerHTML = '<p class="text-red-400 text-center col-span-full">Gagal memuat karya siswa. Periksa koneksi Anda.</p>';
    }
}

// 2. Fungsi untuk menarik teks dinamis
// ==========================================
// FUNGSI MEMUAT PENGATURAN WEB (WA & HERO)
// ==========================================
async function loadPengaturanWeb() {
    try {
        const docSnap = await getDoc(doc(db, "pengaturan_web", "info_utama"));
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Set Teks Hero jika elemennya ada di index.html
            const heroDesc = document.getElementById('teks-hero-desc');
            if (heroDesc && data.teks_hero) {
                heroDesc.innerText = data.teks_hero;
            }
            
            // Set Link WhatsApp beserta format pesannya
            const btnWa = document.getElementById('btn-whatsapp-chat');
            if (btnWa && data.nomor_wa) {
                const pesan = encodeURIComponent("Halo Admin, saya ingin bertanya seputar jurusan DKV di SMKN 1 Pamekasan.");
                btnWa.href = `https://wa.me/${data.nomor_wa}?text=${pesan}`;
            }
        }
    } catch (error) {
        console.error("Gagal memuat pengaturan utama:", error);
    }
}

// Fungsi untuk memuat Kompetensi Keahlian
window.dataKompUtama = {};
window.isDraggingKomp = false; // Penanda agar klik modal tidak bocor saat menggeser

async function loadKompetensi() {
    const kompContainer = document.getElementById('kompetensi-container');
    if (!kompContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "kompetensi"));
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            window.dataKompUtama[id] = data; 
            
            htmlContent += `
                <div onclick="bukaModalKomp('${id}')" class="flex-none w-[80vw] sm:w-[60vw] md:w-[45vw] lg:w-auto snap-center flex flex-col cursor-pointer bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-lg hover:shadow-2xl hover:bg-white/15 transition-all duration-300 group">
                    <div class="relative mb-8 w-full">
                        <div class="w-full h-48 md:h-52 rounded-2xl overflow-hidden shadow-inner bg-slate-800">
                            <img src="${data.url_gambar}" alt="${data.judul}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100">
                        </div>
                        <div class="absolute -bottom-5 left-4 w-12 h-12 bg-slate-900 text-orange-500 rounded-xl shadow-xl flex items-center justify-center border border-slate-700 backdrop-blur-md group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                            <i class="fa-solid ${data.ikon} text-xl"></i>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col px-1">
                        <h3 class="text-xl font-bold text-white mb-2">${data.judul}</h3>
                        <p class="text-slate-300 text-sm mb-4 line-clamp-2">${data.deskripsi}</p>
                        <div class="mt-auto">
                            <span class="inline-flex items-center text-sm font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                                Lihat Detail <i class="fa-solid fa-arrow-right-long ml-2 group-hover:translate-x-1 transition-transform"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });

        kompContainer.innerHTML = htmlContent !== '' ? htmlContent : '<p class="text-center col-span-4 text-slate-400">Belum ada data kompetensi ditambahkan.</p>';

        // KODE LOGIKA TITIK INDIKATOR SLIDE MOBILE
        const carousel = document.getElementById('kompetensi-container');
        const dotsContainer = document.getElementById('kompetensi-dots');
        
        if (carousel && dotsContainer) {
            const totalItems = querySnapshot.size;
            let dotsHtml = '';
            
            // Buat titik sejumlah data (titik pertama aktif)
            for (let i = 0; i < totalItems; i++) {
                dotsHtml += `<div class="dot-komp h-2 rounded-full transition-all duration-300 ${i === 0 ? 'w-6 bg-brand-orange' : 'w-2 bg-gray-300'}"></div>`;
            }
            dotsContainer.innerHTML = dotsHtml;
            
            // Deteksi geseran untuk mengubah warna titik
            const dots = dotsContainer.querySelectorAll('.dot-komp');
            carousel.addEventListener('scroll', () => {
                const scrollLeft = carousel.scrollLeft;
                // Asumsi ukuran 1 elemen (lebar + jarak)
                const cardWidth = carousel.scrollWidth / totalItems; 
                let activeIndex = Math.round(scrollLeft / cardWidth);
                
                // Pastikan index tidak meleset dari batas array
                if (activeIndex >= totalItems) activeIndex = totalItems - 1;
                
                dots.forEach((dot, index) => {
                    if (index === activeIndex) {
                        dot.className = 'dot-komp h-2 rounded-full transition-all duration-300 w-6 bg-brand-orange';
                    } else {
                        dot.className = 'dot-komp h-2 rounded-full transition-all duration-300 w-2 bg-gray-300';
                    }
                });
            });
        }

        // Logika Tarik Mouse (Drag to Scroll)
        let isDown = false;
        let startX;
        let scrollLeft;

        kompContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            window.isDraggingKomp = false;
            startX = e.pageX - kompContainer.offsetLeft;
            scrollLeft = kompContainer.scrollLeft;
        });

        kompContainer.addEventListener('mouseleave', () => { isDown = false; });
        
        kompContainer.addEventListener('mouseup', () => {
            isDown = false;
            // Jeda 50ms membedakan antara klik murni dan tarikan selesai
            setTimeout(() => { window.isDraggingKomp = false; }, 50);
        });

        kompContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            window.isDraggingKomp = true; // Tandai kartu sedang digeser
            const x = e.pageX - kompContainer.offsetLeft;
            const walk = (x - startX) * 2; // Angka 2 mengatur kecepatan geser
            kompContainer.scrollLeft = scrollLeft - walk;
        });

    } catch (error) {
        console.error("Gagal memuat kompetensi:", error);
    }
}

// Fungsi Buka Modal yang dilindungi dari Drag
window.bukaModalKomp = (id) => {
    if(window.isDraggingKomp) return; // Batalkan aksi jika kursor sedang menggeser

    const data = window.dataKompUtama[id];
    if(!data) return;

    document.getElementById('modal-title').innerText = data.judul;
    document.getElementById('modal-img').src = data.url_gambar;
    document.getElementById('modal-icon').className = `fa-solid ${data.ikon} text-2xl`;
    document.getElementById('modal-desc').innerHTML = data.deskripsi_lengkap || `<p>${data.deskripsi}</p>`;

    const modal = document.getElementById('komp-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.children[0].classList.remove('scale-95');
    }, 10);
};

// Fungsi Buka Modal
window.bukaModalKomp = (id) => {
    const data = window.dataKompUtama[id];
    if(!data) return;

    document.getElementById('modal-title').innerText = data.judul;
    document.getElementById('modal-img').src = data.url_gambar;
    document.getElementById('modal-icon').className = `fa-solid ${data.ikon} text-2xl`;
    
    // Tampilkan deskripsi lengkap (dari Editor). Jika kosong, pakai deskripsi singkat.
    document.getElementById('modal-desc').innerHTML = data.deskripsi_lengkap || `<p>${data.deskripsi}</p>`;

    const modal = document.getElementById('komp-modal');
    modal.classList.remove('hidden');
    // Animasi muncul perlahan
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.children[0].classList.remove('scale-95');
    }, 10);
};

// Fungsi Tutup Modal
window.tutupModalKomp = () => {
    const modal = document.getElementById('komp-modal');
    modal.classList.add('opacity-0');
    modal.children[0].classList.add('scale-95');
    // Hilangkan dari tampilan setelah animasi selesai
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

// ==========================================
// FUNGSI MEMUAT DATA FASILITAS STUDIO
// ==========================================
async function loadFasilitas() {
    // ID disesuaikan dengan HTML baru
    const fasilitasContainer = document.getElementById('fasilitas-container');
    if (!fasilitasContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "fasilitas"));
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            htmlContent += `
                <div class="shrink-0 w-[85vw] md:w-[45vw] lg:w-[320px] snap-center flex flex-col group cursor-pointer">
                    <div class="w-full h-48 md:h-56 rounded-2xl overflow-hidden mb-4 relative bg-gray-100">
                        <img src="${data.url_gambar}" alt="${data.judul}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        
                        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent lg:hidden flex flex-col justify-end p-5">
                            <h3 class="text-white font-bold text-lg leading-tight mb-1">${data.judul}</h3>
                            <p class="text-gray-300 text-xs line-clamp-2">${data.deskripsi}</p>
                        </div>
                    </div>
                    
                    <div class="hidden lg:block px-1">
                        <h3 class="text-xl font-bold text-[#0f172a] mb-1 group-hover:text-brand-orange transition-colors">${data.judul}</h3>
                        <p class="text-gray-500 text-sm line-clamp-2">${data.deskripsi}</p>
                    </div>
                </div>
            `;
        });

        fasilitasContainer.innerHTML = htmlContent !== '' ? htmlContent : '<p class="text-center w-full text-gray-400">Belum ada data fasilitas.</p>';
        
        // Aktifkan Tombol Navigasi Desktop
        initFasilitasNavigation();

        // ==========================================
        // TAMBAHAN: LOGIKA TITIK INDIKATOR FASILITAS
        // ==========================================
        const dotsFasContainer = document.getElementById('fasilitas-dots');
        if (dotsFasContainer && querySnapshot.size > 0) {
            const totalItems = querySnapshot.size;
            let dotsHtml = '';
            
            // Buat titik indikator yang bisa diklik
            for (let i = 0; i < totalItems; i++) {
                dotsHtml += `<button class="dot-fasilitas h-2 rounded-full transition-all duration-300 focus:outline-none ${i === 0 ? 'w-6 bg-brand-orange' : 'w-2 bg-gray-300'}"></button>`;
            }
            dotsFasContainer.innerHTML = dotsHtml;
            
            const dots = dotsFasContainer.querySelectorAll('.dot-fasilitas');
            
            // 1. Ubah warna titik saat layar digeser (scroll)
            fasilitasContainer.addEventListener('scroll', () => {
                const scrollLeft = fasilitasContainer.scrollLeft;
                const cardWidth = fasilitasContainer.scrollWidth / totalItems; 
                let activeIndex = Math.round(scrollLeft / cardWidth);
                
                if (activeIndex >= totalItems) activeIndex = totalItems - 1;
                
                dots.forEach((dot, index) => {
                    if (index === activeIndex) {
                        dot.className = 'dot-fasilitas h-2 rounded-full transition-all duration-300 focus:outline-none w-6 bg-brand-orange';
                    } else {
                        dot.className = 'dot-fasilitas h-2 rounded-full transition-all duration-300 focus:outline-none w-2 bg-gray-300';
                    }
                });
            });

            // 2. Geser gambar saat titik diklik
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    const cardWidth = fasilitasContainer.scrollWidth / totalItems;
                    fasilitasContainer.scrollTo({
                        left: index * cardWidth,
                        behavior: 'smooth'
                    });
                });
            });
        }

    } catch (error) {
        console.error("Gagal memuat fasilitas:", error);
    }
}

// Fungsi Penggerak Tombol Panah Kiri/Kanan
function initFasilitasNavigation() {
    // ID disesuaikan dengan HTML baru
    const carousel = document.getElementById('fasilitas-container');
    const btnPrev = document.getElementById('btn-prev-fasilitas');
    const btnNext = document.getElementById('btn-next-fasilitas');

    if (carousel && btnPrev && btnNext) {
        btnNext.addEventListener('click', () => {
            carousel.scrollBy({ left: 320, behavior: 'smooth' }); // Geser ke kanan
        });
        btnPrev.addEventListener('click', () => {
            carousel.scrollBy({ left: -320, behavior: 'smooth' }); // Geser ke kiri
        });
    }
}
// ==========================================
// FUNGSI MEMUAT DATA KARIR & ALUMNI
// ==========================================
async function loadKarir() {
    const karirContainer = document.getElementById('karir-container');
    if (!karirContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "karir"));
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            htmlContent += `
                <div class="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                    <i class="fa-solid ${data.ikon} text-2xl lg:text-3xl text-blue-600 mb-3 group-hover:text-brand-orange transition-colors"></i>
                    <span class="text-xs lg:text-sm font-semibold text-[#0f172a] text-center leading-tight">${data.judul}</span>
                </div>
            `;
        });

        karirContainer.innerHTML = htmlContent !== '' ? htmlContent : '<p class="text-center col-span-full text-gray-400 text-sm">Belum ada data karir.</p>';
    } catch (error) {
        console.error("Gagal memuat karir:", error);
    }
}

// ==========================================
// FUNGSI MEMUAT DATA ALUMNI (AUTO-SLIDE)
// ==========================================
async function loadAlumni() {
    const alumniContainer = document.getElementById('alumni-container');
    if (!alumniContainer) return;

    try {
        // Sesuaikan nama koleksi dengan database Anda (misal: "alumni" atau "testimoni")
        const querySnapshot = await getDocs(collection(db, "alumni")); 
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Lebar diatur: w-full (1 per layar HP), lg:w-[calc(33.333%-1rem)] (3 per layar Desktop)
            htmlContent += `
                <div class="shrink-0 w-full lg:w-[calc(33.333%-1rem)] snap-center bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <i class="fa-solid fa-quote-left text-brand-orange text-3xl mb-4 opacity-20"></i>
                    
                    <p class="text-gray-600 text-sm lg:text-base italic mb-6 flex-grow">
                        "${data.pesan || data.testimoni}"
                    </p>
                    
                    <div class="flex items-center gap-4 mt-auto pt-4 border-t border-gray-50">
                        <img src="${data.url_gambar}" alt="${data.nama}" class="w-12 h-12 rounded-full object-cover border-2 border-gray-100">
                        <div>
                            <h4 class="font-bold text-[#0f172a] text-sm">${data.nama}</h4>
                            <p class="text-brand-orange text-xs font-medium">${data.pekerjaan || data.profesi}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        // ... (kode perulangan htmlContent sebelumnya tetap sama) ...
        alumniContainer.innerHTML = htmlContent !== '' ? htmlContent : '<p class="text-center w-full text-gray-400">Belum ada data alumni.</p>';
        
        // Jika data ada, buat titik dan jalankan slide otomatis
        if (querySnapshot.size > 0) {
            const totalItems = querySnapshot.size;
            const dotsContainer = document.getElementById('alumni-dots');
            
            if (dotsContainer) {
                let dotsHtml = '';
                for (let i = 0; i < totalItems; i++) {
                    dotsHtml += `<button class="dot-alumni h-2 rounded-full transition-all duration-300 focus:outline-none ${i === 0 ? 'w-6 bg-brand-orange' : 'w-2 bg-gray-300'}"></button>`;
                }
                dotsContainer.innerHTML = dotsHtml;

                const dots = dotsContainer.querySelectorAll('.dot-alumni');
                
                // Ubah warna titik saat digeser
                alumniContainer.addEventListener('scroll', () => {
                    const cardWidth = alumniContainer.scrollWidth / totalItems;
                    let activeIndex = Math.round(alumniContainer.scrollLeft / cardWidth);
                    if (activeIndex >= totalItems) activeIndex = totalItems - 1;
                    
                    dots.forEach((dot, index) => {
                        dot.className = index === activeIndex 
                            ? 'dot-alumni h-2 rounded-full transition-all duration-300 focus:outline-none w-6 bg-brand-orange'
                            : 'dot-alumni h-2 rounded-full transition-all duration-300 focus:outline-none w-2 bg-gray-300';
                    });
                });

                // Klik titik untuk menggeser
                dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => {
                        const cardWidth = alumniContainer.scrollWidth / totalItems;
                        alumniContainer.scrollTo({
                            left: index * cardWidth,
                            behavior: 'smooth'
                        });
                    });
                });
            }

            initAutoSlideAlumni(totalItems);
        }

    } catch (error) {
        console.error("Gagal memuat alumni:", error);
    }
}

// Fungsi Logika Geser Otomatis
function initAutoSlideAlumni(totalItems) {
    const container = document.getElementById('alumni-container');
    
    // Interval diperlama menjadi 7000 milidetik (7 detik)
    setInterval(() => {
        const isDesktop = window.innerWidth >= 1024;
        const itemsVisible = isDesktop ? 3 : 1;
        
        if (totalItems <= itemsVisible) return;

        const cardWidth = container.scrollWidth / totalItems;
        // Baca posisi index saat ini (antisipasi jika pengunjung menggeser manual)
        let currentIndex = Math.round(container.scrollLeft / cardWidth) + 1;
        
        if (currentIndex > totalItems - itemsVisible) {
            currentIndex = 0;
        }
        
        container.scrollTo({
            left: currentIndex * cardWidth,
            behavior: 'smooth'
        });
        
    }, 7000); 
}

// ==========================================
// FUNGSI POPUP (MODAL) GALERI SISAWA
// ==========================================
window.openModalGaleri = function(imgUrl, judul, deskripsi) {
    document.getElementById('modal-galeri-img').src = imgUrl;
    document.getElementById('modal-galeri-judul').innerText = judul;
    // Menambahkan pengisian deskripsi ke dalam modal
    document.getElementById('modal-galeri-desc').innerText = deskripsi;
    
    const modal = document.getElementById('modal-galeri');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.children[0].classList.remove('scale-95');
    }, 10);
};

window.closeModalGaleri = function() {
    const modal = document.getElementById('modal-galeri');
    modal.classList.add('opacity-0');
    modal.children[0].classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('modal-galeri-img').src = ""; // Kosongkan saat ditutup
    }, 300);
};


// 4. SATUKAN SEMUA FUNGSI SAAT HALAMAN DIMUAT (Menghindari event ganda)
document.addEventListener("DOMContentLoaded", () => {
    renderGaleri();
    loadPengaturanWeb();
    loadKompetensi();
    loadGaleriSiswa(); // Tambahan baru
    loadFasilitas();
    loadKarir();   // <-- Pemanggilan Karir
    loadAlumni();  // <-- Pemanggilan Alumni
});

// Fungsi untuk memuat data Galeri Siswa
async function loadGaleriSiswa() {
    const galleryGrid = document.getElementById('gallery-grid');
    if (!galleryGrid) return;

    try {
        const querySnapshot = await getDocs(collection(db, "galeri_siswa"));
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Mengamankan tanda kutip agar tidak merusak fungsi klik
            const safeJudul = data.judul ? data.judul.replace(/'/g, "\\'") : '';
            const safeDeskripsi = data.deskripsi ? data.deskripsi.replace(/'/g, "\\'") : '';
            // Mengamankan format teks kategori untuk class CSS (misal: "Praktik Siswa" menjadi "praktik-siswa")
            const classKategori = data.kategori ? data.kategori.toLowerCase().replace(/\s+/g, '-') : '';
            
            htmlContent += `
                <div data-kategori="${data.kategori}" onclick="openModalGaleri('${data.url_gambar}', '${safeJudul}', '${safeDeskripsi}')" class="galeri-item ${classKategori} ${data.kategori} group relative cursor-pointer rounded-2xl overflow-hidden shadow-md h-64 lg:h-80 w-full">
                    
                    <!-- Gambar Latar -->
                    <img src="${data.url_gambar}" alt="${data.judul}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700">
                    
                    <!-- Overlay Gradasi Gelap (Selalu ada di bawah agar teks terbaca) -->
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a]/95 via-[#0f172a]/50 to-transparent flex flex-col justify-end p-5 lg:p-6 transition-all duration-300">
                        
                        <!-- Efek naik sedikit saat di-hover -->
                        <div class="transform transition-transform duration-300 group-hover:-translate-y-2">
                            <!-- Judul -->
                            <h3 class="text-lg lg:text-xl font-bold text-white mb-1 drop-shadow-md">${data.judul}</h3>
                            
                            <!-- Deskripsi (Dibatasi maksimal 2 baris) -->
                            <p class="text-gray-200 text-xs sm:text-sm line-clamp-2 mb-3 drop-shadow">${data.deskripsi}</p>
                            
                            <!-- Tombol Lihat Detail -->
                            <span class="inline-flex items-center gap-1 text-white font-bold text-[11px] sm:text-xs bg-brand-orange px-3 py-1.5 rounded-full w-max shadow-lg opacity-90 group-hover:opacity-100 transition">
                                Lihat Detail <i class="fa-solid fa-chevron-right text-[9px]"></i>
                            </span>
                        </div>
                        
                    </div>
                    
                </div>
            `;
        });

        galleryGrid.innerHTML = htmlContent !== '' ? htmlContent : '<p class="text-center col-span-full text-gray-400">Belum ada foto di galeri.</p>';
        
        // Jalankan fungsi filter setelah kartu berhasil dirender
        initGalleryFilter();

    } catch (error) {
        console.error("Gagal memuat galeri:", error);
    }
}

// Fungsi Filter Kategori Galeri
// Fungsi Filter Kategori Galeri
function initGalleryFilter() {
    // UBAH: .gallery-item menjadi .galeri-item
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.galeri-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Ubah gaya tombol aktif
            filterBtns.forEach(b => {
                b.classList.remove('bg-brand-orange', 'text-white', 'shadow-md');
                b.classList.add('bg-white', 'text-gray-600');
            });
            btn.classList.remove('bg-white', 'text-gray-600');
            btn.classList.add('bg-brand-orange', 'text-white', 'shadow-md');

            const filterValue = btn.getAttribute('data-filter');

            // Sembunyikan atau tampilkan kartu berdasarkan kategori
            galleryItems.forEach(item => {
                // UBAH: data-category menjadi data-kategori
                if (filterValue === 'semua' || item.getAttribute('data-kategori') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => { 
                        item.style.opacity = '1'; 
                        item.style.transform = 'scale(1)'; 
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => { 
                        item.style.display = 'none'; 
                    }, 300);
                }
            });
        });
    });
}
