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
async function loadPengaturanWeb() {
    try {
        const docRef = doc(db, "pengaturan_web", "info_utama");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            if (data.teks_hero) {
                const heroDesc = document.getElementById('hero-desc-display');
                if(heroDesc) heroDesc.innerText = data.teks_hero;
            }

            if (data.nomor_wa) {
                const waLink = document.getElementById('wa-link-display');
                const waText = document.getElementById('wa-text-display');
                
                if(waLink) waLink.href = `https://wa.me/${data.nomor_wa}`;
                
                let teksWa = data.nomor_wa.startsWith('62') ? '0' + data.nomor_wa.slice(2) : data.nomor_wa;
                if(waText) waText.innerText = teksWa;
            }
        }
    } catch (error) {
        console.error("Gagal memuat pengaturan web:", error);
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
    const fasilitasContainer = document.getElementById('carousel-fasilitas');
    if (!fasilitasContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "fasilitas"));
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Kita menggunakan shrink-0 dan w-[85vw] untuk mobile, serta w-[300px] untuk desktop
            htmlContent += `
                <div class="shrink-0 w-[85vw] md:w-[45vw] lg:w-[320px] snap-center flex flex-col group cursor-pointer">
                    <div class="w-full h-48 md:h-56 rounded-2xl overflow-hidden mb-4 relative bg-gray-100">
                        <img src="${data.url_gambar}" alt="${data.judul}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        
                        <!-- Overlay Text Mobile -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent lg:hidden flex flex-col justify-end p-5">
                            <h3 class="text-white font-bold text-lg leading-tight mb-1">${data.judul}</h3>
                            <p class="text-gray-300 text-xs line-clamp-2">${data.deskripsi}</p>
                        </div>
                    </div>
                    
                    <!-- Teks Desktop -->
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

    } catch (error) {
        console.error("Gagal memuat fasilitas:", error);
    }
}

// Fungsi Penggerak Tombol Panah Kiri/Kanan
function initFasilitasNavigation() {
    const carousel = document.getElementById('carousel-fasilitas');
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

async function loadAlumni() {
    const alumniContainer = document.getElementById('alumni-container');
    if (!alumniContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "alumni"));
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            htmlContent += `
                <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative hover:shadow-md transition-shadow">
                    <i class="fa-solid fa-quote-left absolute top-6 right-6 text-3xl text-gray-100"></i>
                    <p class="text-gray-600 text-sm italic mb-6 relative z-10 leading-relaxed">
                        "${data.pesan}"
                    </p>
                    <div class="flex items-center gap-3">
                        <img src="${data.url_gambar}" alt="${data.nama}" class="w-10 h-10 rounded-full object-cover border border-gray-200">
                        <div>
                            <h4 class="text-[#0f172a] font-bold text-sm">${data.nama}</h4>
                            <p class="text-gray-400 text-[10px] sm:text-xs font-medium">${data.profesi}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        alumniContainer.innerHTML = htmlContent !== '' ? htmlContent : '<p class="text-center col-span-full text-gray-400 text-sm">Belum ada data alumni.</p>';
    } catch (error) {
        console.error("Gagal memuat alumni:", error);
    }
}


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
            // Setiap kartu diberi atribut data-category untuk kebutuhan filter
            htmlContent += `
                <div class="gallery-item relative rounded-2xl overflow-hidden cursor-pointer bg-slate-900 aspect-square group transition-all duration-300" data-category="${data.kategori}">
                    <img src="${data.url_gambar}" alt="${data.judul}" class="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                        <span class="text-brand-orange text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">${data.kategori}</span>
                        <h4 class="text-white font-bold text-sm md:text-base leading-tight mb-1">${data.judul}</h4>
                        <p class="text-gray-300 text-xs line-clamp-2">${data.deskripsi}</p>
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
function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

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
                if (filterValue === 'semua' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => { item.style.display = 'none'; }, 300); // Tunggu animasi selesai
                }
            });
        });
    });
}