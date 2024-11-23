const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.post("/api/scrape", async (req, res) => {
    // URL dari request atau default
    let url =
        req.body.url ||
        "https://www.simbmd.pasuruankab.web.id/homepage/labelisasi/index/773---aset_c";

    if (!url) {
        return res.status(400).json({ error: "URL parameter is required" });
    }

    try {
        // Ambil HTML dari URL
        const response = await axios.get(url);
        const html = response.data;

        // Handle jika HTML kosong
        if (!html || html.trim() === "") {
            return res.status(500).json({
                status: false,
                message: "Gagal fetching HTML: kosong",
            });
        }

        const $ = cheerio.load(html);

        // Fungsi untuk membersihkan dan memformat nama atribut
        const cleanAttribute = (text) => {
            return text
                .replace(/\s+/g, " ") // Ganti spasi berlebih dengan satu spasi
                .replace(/^\s+|\s+$/g, "") // Hapus spasi di awal/akhir
                .replace(/:/g, "") // Hapus tanda titik dua
                .toLowerCase() // Ubah huruf ke huruf kecil
                .replace(/[^a-zA-Z0-9]+/g, "_"); // Ganti karakter non-alfa numerik dengan underscore
        };

        // Fungsi untuk membersihkan nilai
        const cleanValue = (text) => {
            if (!text) return null;
            return text.replace(/\s+/g, " ").trim() || null;
        };

        // Objek untuk menyimpan data yang di-scrape
        const data = {};

        // Iterasi melalui elemen row dan ambil atribut serta nilai
        $(".row .col-md-6, .row .col-md-4").each((index, element) => {
            // Ambil nama atribut dari h6
            let attr = $(element).find("h6 b").text().trim();
            // Ambil nilai dari label
            let value = $(element).find("label").text().trim();

            // Bersihkan atribut dan nilai
            attr = cleanAttribute(attr);
            value = cleanValue(value);

            // Masukkan data ke objek
            data[attr] = value;
        });

        // if (pengecekan berdasarkan jenis aset (a, b, c, d, e))
        // Debugging data setelah pembersihan atribute dan value menggunakan regex
        // res.status(500).json({
        //     status: false,
        //     message: "Debugging Data",
        //     data: data,
        // });

        // Konversi custom nama atribut ke format yang diinginkan
        const convertedData = {
            nibar: data["nibar_"],
            noreg: data["noreg_"],
            kode_barang: data["kode_barang_"],
            nama_barang: data["nama_barang_"],
            // kondisi: data["kondisi_"],
            // bertingkat: data["bertingkat_"],
            // bahan_beton: data["bahan_beton_"],
            // luas_lantai: data["luas_lantai_m2_"],
            // alamat: data["alamat_lokasi_"],
            // no_dokumen: data["no_dokumen_"],
            // tgl_dokumen: data["tgl_dokumen_"],
            // status_tanah: data["status_tanah_"],
            // reg_tanah: data["reg_tanah_"],
            // asal_usul: data["asal_usul_tahun_"]
            //     ? data["asal_usul_tahun_"].split("/")[0].trim()
            //     : null,
            // tahun: data["asal_usul_tahun_"]
            //     ? data["asal_usul_tahun_"].split("/")[1].trim()
            //     : null,
            // nilai: data["nilai_rp_"],
            // nilai_tambah: data["nilai_tambah_rp_"],
            // nilai_total: data["nilai_total_rp_"],
            // keterangan: data["keterangan_"],
            // opd: data["opd_"],
        };

        // Kirim respon berhasil
        res.json({
            status: true,
            message: "Scraping successful",
            data: {
                json: convertedData,
                rawHtml: html,
            },
        });
    } catch (error) {
        // Kirim respon gagal
        console.error("Scraping error:", error);
        res.status(500).json({
            status: false,
            message: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
