// Import SDK Firebase versi Modular dari CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// TODO: Ganti value di bawah ini dengan Config dari Firebase Console Anda nantinya
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

// Fungsi untuk menarik data galeri secara asinkron
async function renderGaleri() {
    const galeriContainer = document.getElementById('galeri-container');
    if (!galeriContainer) return;

    try {
        // 'karya_siswa' adalah nama koleksi (tabel) yang akan kita buat di Firestore
        const querySnapshot = await getDocs(collection(db, "karya_siswa"));
        
        let htmlContent = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Membuat elemen kartu foto dengan efek hover dan transisi halus
            htmlContent += `
                <div class="relative overflow-hidden rounded-2xl group border border-white/10 shadow-lg cursor-pointer fade-in-section">
                    <!-- URL gambar langsung ditarik dari Cloudinary -->
                    <img src="${data.url_gambar}" alt="${data.judul}" class="w-full h-72 object-cover transform transition duration-700 group-hover:scale-110">
                    
                    <!-- Overlay Glassmorphism yang muncul saat di-hover -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 class="text-xl font-bold text-white mb-1">${data.judul}</h3>
                        <p class="text-brand-100 text-sm font-medium mb-2">${data.kreator}</p>
                        <p class="text-gray-300 text-xs">${data.deskripsi}</p>
                    </div>
                </div>
            `;
        });

        // Menyuntikkan elemen HTML ke dalam container
        galeriContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error("Gagal memuat galeri:", error);
        galeriContainer.innerHTML = '<p class="text-red-400 text-center col-span-full">Gagal memuat karya siswa. Periksa koneksi Anda.</p>';
    }
}

// Jalankan fungsi saat halaman dimuat
document.addEventListener("DOMContentLoaded", renderGaleri);