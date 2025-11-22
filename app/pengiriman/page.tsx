export default function PengirimanPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-pretty">Pengiriman</h1>
        <p className="text-sm text-muted-foreground">
          Pilih kurir dan layanan pengiriman. Integrasi Biteship akan ditambahkan di sini.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-border bg-card p-6">
          <h2 className="font-medium mb-4">Pilih Layanan</h2>
          <div className="grid gap-3">
            <label className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
              <span className="text-sm">JNE Reguler</span>
              <span className="text-sm font-medium">Rp 0</span>
            </label>
            <label className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
              <span className="text-sm">SiCepat</span>
              <span className="text-sm font-medium">Rp 0</span>
            </label>
            <label className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
              <span className="text-sm">Instant (Kurir)</span>
              <span className="text-sm font-medium">Rp 0</span>
            </label>
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-medium mb-4">Alamat & Estimasi</h2>
          <div className="text-sm space-y-1">
            <div className="flex items-center justify-between">
              <span>Alamat</span>
              <a href="/checkout" className="text-primary underline">
                Ubah
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimasi</span>
              <span>2-4 hari</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ongkir</span>
              <span>Rp 0</span>
            </div>
          </div>
          <a
            href="/checkout"
            className="mt-6 inline-block h-10 rounded-md bg-primary text-primary-foreground px-4 leading-10 w-full text-center"
          >
            Simpan & Kembali
          </a>
        </aside>
      </section>
    </main>
  )
}
