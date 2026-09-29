# NexusSLA: Multi-Source Truth Oracle & SLA Dispute Court


NexusSLA adalah Intelligent Contract di atas jaringan GenLayer yang berfungsi sebagai penilai SLA dan oracle keandalan layanan untuk ekosistem API maupun agen AI. Kontrak ini menghubungkan data status layanan dunia nyata dengan jaminan finansial on-chain tanpa bergantung pada oracle terpusat.


---


## Fitur Utama


- **Multi-Source Web Ingestion (`gl.nondet.web.render`)**: Validator membaca halaman status dan endpoint API publik secara non-deterministik langsung dari lingkungan eksekusi kontrak.
- **Konsensus Semantik LLM (`prompt_comparative`)**: Menilai laporan gangguan secara semantik antar arsitektur model AI yang berbeda (GPT, Gemini, Sonnet, Mistral). Validator menyepakati substansi gangguan dan tingkat keparahannya tanpa terganggu format karakter atau spasi JSON.
- **Whitelist Domain Bukti**: Mencegah manipulasi bukti dengan membatasi URL hanya pada domain yang telah didaftarkan saat instansiasi kontrak.
- **Penalti Berjenjang**: Memotong jaminan (*bond*) secara otomatis berdasarkan durasi downtime dan persentase penalti berjenjang (basis poin).
- **Pencatatan Vonis On-Chain**: Klaim yang kekurangan bukti ditolak secara resmi di state kontrak (`DISMISSED`) tanpa membatalkan transaksi (*no revert*). Pendekatan ini melindungi saldo provider dari klaim palsu dan menyediakan riwayat audit yang transparan.
- **Jendela Sanggahan (Dispute Window)**: Memberikan kesempatan bagi provider untuk menyertakan bukti tandingan sebelum penalti difinalisasi.


---


## Alur Status Kontrak


```
               [ UNINITIALIZED ]
                       │
                       ▼  deposit_bond() (Provider setor GEN)
                  [ ACTIVE ] ◄─────────────────────────────────┐
                       │                                       │
                       ▼  file_claim() (Client ajukan bukti)   │
               [ CLAIM_PENDING ] ──────────────────────────────┤
                       │                                       │ (Klaim ditolak / DISMISSED)
            ┌──────────┴──────────┐                            │
            ▼ dispute_claim()     ▼ finalize_claim()           │
    [ DISPUTE_WINDOW ]      [ ACTIVE (Bond Terpotong) ] ───────┘
            │
            ▼ finalize_claim()
   [ ACTIVE / SETTLED ]
```


---


## Parameter Konstruktor


| Parameter | Tipe Data | Deskripsi | Contoh Nilai Uji Coba |
| :--- | :--- | :--- | :--- |
| `provider` | `str` | Alamat wallet pihak penyedia layanan | `0x34242f09a2646eF4383C672b8a6BFDC9634cB232` |
| `client` | `str` | Alamat wallet pihak pengguna / klien | `0x90e1644d995B2488d4a2Bf24b88D67e04A3F9D5d` |
| `evidence_domains_json`| `str` | Daftar domain resmi bukti (JSON array) | `["githubstatus.com","status.cloud.google.com"]` |
| `quorum_required` | `int` | Jumlah minimal sumber independen yang sepakat | `1` |
| `start` | `int` | Unix timestamp awal masa berlaku SLA | `1700000000` |
| `end` | `int` | Unix timestamp akhir masa berlaku SLA | `1900000000` |
| `bond_amount` | `int` | Nilai jaminan dalam satuan wei (1 GEN) | `1000000000000000000` |
| `tier_uptime_thresholds_json` | `str` | Ambang persentase uptime (basis poin / bps) | `[9990, 9900, 9500]` |
| `tier_penalty_json` | `str` | Persentase pemotongan jaminan per tier (bps) | `[500, 1500, 4000]` |


---


## Data Pengujian di GenLayer Studio


- **Contract Address:** `0x006a4d15EC51F5cb1F7721A291429181db8D3519`
- **Execution Mode:** `Normal (Full Consensus)`
- **Sample Claim Execution Tx:** `0x69da8b82fbed59b0c2623e2c619db17cde6e1eb415665c3c9564e4428f085f17`
- **Hasil Konsensus:** `MAJORITY_AGREE` (Accepted dalam 1 putaran konsensus multi-validator).


---


## Rencana Pengembangan (Roadmap)


### Fase 1: Kontrak Cerdas Inti (Selesai)
- Logika pengadilan SLA otonom pada `nexus_sla.py` dengan pembaca web non-deterministik.
- Integrasi konsensus semantik LLM (`prompt_comparative`).
- Verifikasi deposit bond, kuorum multi-sumber, pemotongan penalti, dan penanganan klaim tanpa revert.


### Fase 2: Dashboard Web (Kategori Projects)
Membangun antarmuka web (Next.js dan Tailwind CSS) yang terhubung langsung ke kontrak GenLayer:
- **Tampilan Provider**: Portal deposit bond, indikator saldo jaminan aktif, serta formulir pengajuan bukti sanggahan (*dispute*).
- **Tampilan Client**: Formulir pengajuan klaim downtime dengan validasi domain otomatis dan pelacak status verifikasi AI.
- **Explorer Riwayat Putusan**: Menampilkan data bukti yang diperiksa, ringkasan evaluasi insiden, serta riwayat keandalan provider.


### Fase 3: Otomatisasi & Pemantauan Mandiri (Kategori Milestones)
- **Monitoring Worker**: Agen otomatis yang memantau endpoint kesehatan layanan secara berkala dan mengeksekusi klaim secara instan jika terdeteksi downtime.
- **Multi-Asset Support**: Dukungan jaminan menggunakan token ERC-20 atau stablecoin.
- **Custom Penalty Curves**: Konfigurasi formula penalti non-linear untuk kebutuhan SLA infrastruktur berkeandalan tinggi.


---


## Cara Menjalankan di GenLayer Studio


1. Buka [GenLayer Studio](https://studio.genlayer.com).
2. Buat file `nexus_sla.py` dan tempelkan kode kontrak.
3. Deploy instance baru menggunakan parameter konstruktor di atas.
4. Panggil method `deposit_bond` menggunakan wallet provider dengan nilai `Value (GEN) = 1`.
5. Beralih ke wallet client dan panggil `file_claim` dengan parameter bukti:
   ```json
   ["https://www.githubstatus.com/api/v2/incidents.json"]
   ```
6. Buka tab **Read Methods** dan jalankan `get_state()` untuk memeriksa status kontrak dan riwayat putusan.


---


## Lisensi
MIT License
