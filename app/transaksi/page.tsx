"use client"

export default function TransaksiPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-2">Transaksi</h1>
      <p className="text-muted-foreground">
        Halaman ini akan menampilkan status transaksi Anda setelah checkout. Integrasi Midtrans akan memverifikasi
        pembayaran dan mengubah status secara otomatis.
      </p>
      <div className="mt-8">
        <a href="/" className="inline-block h-10 rounded-md bg-primary text-primary-foreground px-4 leading-10">
          Kembali ke Beranda
        </a>
      </div>
    </main>
  )
}
