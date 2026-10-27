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

// 3. Fungsi untuk memuat Kompetensi Keahlian
async function loadKompetensi() {
    const kompContainer = document.getElementById('kompetensi-container');
    if (!kompContainer) return;

    try {
        const querySnapshot = await getDocs(collection(db, "kompetensi"));
        let htmlContent = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            htmlContent += `
                <div class="min-w-[85vw] md:min-w-[45vw] lg:min-w-0 snap-center bg-[#f8fafc] rounded-3xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div class="relative w-full h-48 rounded-2xl overflow-hidden mb-8">
                        <img src="${data.url_gambar}" alt="${data.judul}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                        <div class="absolute -bottom-5 left-4 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-blue-600 border border-gray-50">
                            <i class="fa-solid ${data.ikon} text-lg"></i>
                        </div>
                    </div>
                    <h3 class="text-xl font-bold text-[#0f172a] mb-2 px-2">${data.judul}</h3>
                    <p class="text-gray-500 text-sm mb-4 px-2 line-clamp-2">${data.deskripsi}</p>
                    <a href="#" class="inline-flex items-center text-sm font-bold text-blue-600 px-2 group-hover:text-brand-orange transition-colors">
                        Selengkapnya <i class="fa-solid fa-arrow-right-long ml-2 group-hover:translate-x-1 transition-transform"></i>
                    </a>
                </div>
            `;
        });

        kompContainer.innerHTML = htmlContent !== '' ? htmlContent : '<p class="text-center col-span-4 text-gray-400">Belum ada data kompetensi ditambahkan.</p>';

    } catch (error) {
        console.error("Gagal memuat kompetensi:", error);
    }
}

// 4. SATUKAN SEMUA FUNGSI SAAT HALAMAN DIMUAT (Menghindari event ganda)
document.addEventListener("DOMContentLoaded", () => {
    renderGaleri();
    loadPengaturanWeb();
    loadKompetensi();
});