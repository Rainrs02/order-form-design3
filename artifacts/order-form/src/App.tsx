import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CalendarDays,
  Plus,
  Trash2,
  Send,
  Package,
  User,
  Phone,
  MapPin,
  Truck,
  ClipboardList,
  CheckCircle2,
  Eye,
  X,
  ArrowLeft,
  ChevronDown,
  Search,
} from "lucide-react";
import logoWasilah from "@assets/WhatsApp_Image_2026-04-28_at_17.46.14_1777373406581.jpeg";
import { ItemSearchInput } from "@/components/ItemSearchInput";
import { CustomSelect } from "@/components/CustomSelect";

interface LocationData {
  id: string;
  name: string;
}

const TUJUAN_WA = "6281280093637";
const SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbxyfhJnylM7npuzg3K7twMt7VgO5QU9FQBGPysGLssJThJpGlkMytTF530Asd4Z8kMw/exec"; // URL Google Apps Script Anda
const NAMA_SHEET = "pesan3"; // Nama sheet tujuan di Spreadsheet

const KEMASAN_OPSI = ["Palet Kayu", "Kertas Packing", "Plastik Wrap Saja"] as const;

function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

// Komponen Searchable Select untuk Wilayah
const AreaSelect = ({ 
  id,
  label, 
  value, 
  onChange, 
  options, 
  disabled, 
  placeholder,
  activeId,
  onToggle
}: { 
  id: string;
  label: string; 
  value: string; 
  onChange: (id: string, name: string) => void; 
  options: LocationData[]; 
  disabled?: boolean;
  placeholder: string;
  activeId: string | null;
  onToggle: (id: string | null) => void;
}) => {
  const [search, setSearch] = useState("");
  const isOpen = activeId === id;

  const filtered = options.filter(opt => 
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedName = options.find(o => o.id === value)?.name || "";

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <div 
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onToggle(isOpen ? null : id);
        }}
        className={`w-full px-4 py-2.5 border rounded-xl flex justify-between items-center cursor-pointer transition-all ${
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100' : 'bg-white hover:border-blue-400'
        } ${isOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 shadow-sm'}`}
      >
        <span className="truncate text-sm">{selectedName || placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div 
          className="absolute z-[100] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id, opt.name);
                    onToggle(null);
                    setSearch("");
                  }}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 transition-colors ${
                    value === opt.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Data tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
const EKSPEDISI_OPSI = [
  "Wasilah",
  "JNT",
  "Shopee Express",
  "Central Cargo",
  "Ambil Sendiri",
] as const;

type Kemasan = (typeof KEMASAN_OPSI)[number];

type Barang = {
  id: string;
  nama: string;
  jumlah: string;
  keterangan: string;
  kemasan: Kemasan;
};

const newBarang = (): Barang => ({
  id: crypto.randomUUID(),
  nama: "",
  jumlah: "",
  keterangan: "",
  kemasan: "Palet Kayu",
});

function FieldLabel({
  icon: Icon,
  children,
  required,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-foreground/85 mb-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-primary/80" />}
      <span>
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
      </span>
    </label>
  );
}

function inputBase() {
  return "glass-input w-full rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70";
}

function App() {
  const [namaPemesan, setNamaPemesan] = useState("");
  const [waPemesan, setWaPemesan] = useState("");
  const [tanggal, setTanggal] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [alamatJalan, setAlamatJalan] = useState("");
  const [provId, setProvId] = useState("");
  const [provName, setProvName] = useState("");
  const [kotaId, setKotaId] = useState("");
  const [kotaName, setKotaName] = useState("");
  const [kecId, setKecId] = useState("");
  const [kecName, setKecName] = useState("");
  const [desaId, setDesaId] = useState("");
  const [desaName, setDesaName] = useState("");
  const [kodePos, setKodePos] = useState("");

  const [provList, setProvList] = useState<LocationData[]>([]);
  const [kotaList, setKotaList] = useState<LocationData[]>([]);
  const [kecList, setKecList] = useState<LocationData[]>([]);
  const [desaList, setDesaList] = useState<LocationData[]>([]);

  // State Penerima
  const [samaDenganPemesan, setSamaDenganPemesan] = useState(true);
  const [namaPenerima, setNamaPenerima] = useState("");
  const [telpPenerima, setTelpPenerima] = useState("");
  const [alamatJalanPenerima, setAlamatJalanPenerima] = useState("");
  const [provIdPenerima, setProvIdPenerima] = useState("");
  const [provNamePenerima, setProvNamePenerima] = useState("");
  const [kotaIdPenerima, setKotaIdPenerima] = useState("");
  const [kotaNamePenerima, setKotaNamePenerima] = useState("");
  const [kecIdPenerima, setKecIdPenerima] = useState("");
  const [kecNamePenerima, setKecNamePenerima] = useState("");
  const [desaIdPenerima, setDesaIdPenerima] = useState("");
  const [desaNamePenerima, setDesaNamePenerima] = useState("");
  const [kodePosPenerima, setKodePosPenerima] = useState("");

  const [kotaListPenerima, setKotaListPenerima] = useState<LocationData[]>([]);
  const [kecListPenerima, setKecListPenerima] = useState<LocationData[]>([]);
  const [desaListPenerima, setDesaListPenerima] = useState<LocationData[]>([]);

  const [ekspedisi, setEkspedisi] = useState("Wasilah");
  const [barangs, setBarangs] = useState<Barang[]>([newBarang()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Fetch Wilayah Indonesia
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatData = (data: any[]) => data.map(item => ({ ...item, name: toTitleCase(item.name) }));

  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then(res => res.json())
      .then(data => setProvList(formatData(data)));
  }, []);

  useEffect(() => {
    if (provId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provId}.json`)
        .then(res => res.json())
        .then(data => setKotaList(formatData(data)));
    } else {
      setKotaList([]);
    }
    setKotaId(""); setKotaName(""); setKecId(""); setKecName(""); setDesaId(""); setDesaName("");
  }, [provId]);

  useEffect(() => {
    if (kotaId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kotaId}.json`)
        .then(res => res.json())
        .then(data => setKecList(formatData(data)));
    } else {
      setKecList([]);
    }
    setKecId(""); setKecName(""); setDesaId(""); setDesaName("");
  }, [kotaId]);

  useEffect(() => {
    if (kecId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${kecId}.json`)
        .then(res => res.json())
        .then(data => setDesaList(formatData(data)));
    } else {
      setDesaList([]);
    }
    setDesaId(""); setDesaName("");
  }, [kecId]);

  // Fetch Wilayah Penerima
  useEffect(() => {
    if (provIdPenerima) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provIdPenerima}.json`)
        .then(res => res.json())
        .then(data => setKotaListPenerima(formatData(data)));
    } else {
      setKotaListPenerima([]);
    }
    setKotaIdPenerima(""); setKotaNamePenerima(""); setKecIdPenerima(""); setKecNamePenerima(""); setDesaIdPenerima(""); setDesaNamePenerima("");
  }, [provIdPenerima]);

  useEffect(() => {
    if (kotaIdPenerima) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kotaIdPenerima}.json`)
        .then(res => res.json())
        .then(data => setKecListPenerima(formatData(data)));
    } else {
      setKecListPenerima([]);
    }
    setKecIdPenerima(""); setKecNamePenerima(""); setDesaIdPenerima(""); setDesaNamePenerima("");
  }, [kotaIdPenerima]);

  useEffect(() => {
    if (kecIdPenerima) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${kecIdPenerima}.json`)
        .then(res => res.json())
        .then(data => setDesaListPenerima(formatData(data)));
    } else {
      setDesaListPenerima([]);
    }
    setDesaIdPenerima(""); setDesaNamePenerima("");
  }, [kecIdPenerima]);

  const gabungkanAlamatPemesan = () => {
    const parts = [alamatJalan, desaName, kecName, kotaName, provName, kodePos].filter(p => p && p !== "-");
    return parts.join(", ");
  };

  const gabungkanAlamatPenerima = () => {
    if (samaDenganPemesan) return gabungkanAlamatPemesan();
    const parts = [alamatJalanPenerima, desaNamePenerima, kecNamePenerima, kotaNamePenerima, provNamePenerima, kodePosPenerima].filter(p => p && p !== "-");
    return parts.join(", ");
  };

  const gabungkanWilayahPemesan = () => {
    const parts = [desaName, kecName, kotaName, provName].filter(p => p && p !== "-");
    return parts.join(", ");
  };

  const gabungkanWilayahPenerima = () => {
    if (samaDenganPemesan) return gabungkanWilayahPemesan();
    const parts = [desaNamePenerima, kecNamePenerima, kotaNamePenerima, provNamePenerima].filter(p => p && p !== "-");
    return parts.join(", ");
  };

  const isWilayahPemesanLengkap = Boolean(provId && kotaId && kecId && desaId);
  const isWilayahPenerimaLengkap = samaDenganPemesan 
    ? isWilayahPemesanLengkap 
    : Boolean(provIdPenerima && kotaIdPenerima && kecIdPenerima && desaIdPenerima);


  // Format: 15/Mei/2026 (Untuk WA & Spreadsheet)
  const formatTanggalSingkat = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('id-ID', { month: 'long' });
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format: Jumat, 15 Mei 2026 (Untuk Helper Teks Bawah)
  const formatTanggalPanjang = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const addBarang = () => setBarangs((prev) => [...prev, newBarang()]);
  const removeBarang = (bid: string) =>
    setBarangs((prev) =>
      prev.length === 1 ? prev : prev.filter((b) => b.id !== bid),
    );
  const updateBarang = (bid: string, patch: Partial<Barang>) =>
    setBarangs((prev) =>
      prev.map((b) => (b.id === bid ? { ...b, ...patch } : b)),
    );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!namaPemesan.trim()) e.namaPemesan = "Nama pemesan wajib diisi";
    if (!tanggal) e.tanggal = "Tanggal wajib diisi";
    if (!waPemesan.trim()) e.waPemesan = "Nomor WA wajib diisi";
    else if (!/^[0-9+\s-]{8,}$/.test(waPemesan.trim()))
      e.waPemesan = "Nomor WA tidak valid";
    if (!alamatJalan.trim()) e.alamatPemesan = "Alamat jalan wajib diisi";

    barangs.forEach((b, i) => {
      if (!b.nama.trim()) e[`barang_${i}_nama`] = "Nama barang wajib";
      if (!b.jumlah.toString().trim())
        e[`barang_${i}_jumlah`] = "Jumlah wajib";
    });

    if (!samaDenganPemesan) {
      if (!namaPenerima.trim()) e.namaPenerima = "Nama penerima wajib";
      if (!telpPenerima.trim()) e.telpPenerima = "No telpon wajib";
      else if (!/^[0-9+\s-]{8,}$/.test(telpPenerima.trim()))
        e.telpPenerima = "Nomor tidak valid";
      if (!alamatJalanPenerima.trim()) e.alamatPenerima = "Alamat/Sharelok wajib";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildMessage = () => {
    const lines: string[] = [];
    lines.push("*FORM PEMESANAN BARANG*");
    lines.push("━━━━━━━━━━━━━━━━━━━━");
    lines.push("");
    lines.push("*Data Pemesan*");
    lines.push(`• Nama Pemesan : ${namaPemesan}`);
    lines.push(`• Tanggal Pesan : ${formatTanggalSingkat(tanggal)}`);
    lines.push(`• No. WA Pemesan : ${waPemesan}`);
    lines.push(`• Alamat Pemesan : ${gabungkanAlamatPemesan()}`);
    lines.push("");
    lines.push("*Detail Barang*");
    barangs.forEach((b, i) => {
      lines.push(`${i + 1}. ${b.nama}`);
      lines.push(`   - Jumlah : ${b.jumlah}`);
      if (b.keterangan.trim())
        lines.push(`   - Keterangan : ${b.keterangan}`);
      lines.push(`   - Kemasan : ${b.kemasan}`);
    });
    lines.push("");
    lines.push("*Data Penerima*");
    if (samaDenganPemesan) {
      lines.push("• Nama penerima sama dengan pemesan");
      lines.push(`• Nama : ${namaPemesan}`);
      lines.push(`• No. Telp : ${waPemesan}`);
      lines.push(`• Alamat : ${gabungkanAlamatPenerima()}`);
    } else {
      lines.push(`• Nama Penerima : ${namaPenerima}`);
      lines.push(`• No. Telp Penerima : ${telpPenerima}`);
      lines.push(`• Alamat / Sharelok : ${gabungkanAlamatPenerima()}`);
    }
    lines.push(`• Ekspedisi : ${ekspedisi}`);
    lines.push("");
    lines.push("Terima kasih.");
    return lines.join("\n");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErr = document.querySelector("[data-error='true']");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setPreviewText(buildMessage());
    setPreviewOpen(true);
  };

  const sendNow = async () => {
    setIsSubmitting(true);

    // Susun detail pesanan yang lengkap (Nama - Qty (Ket) [Kemasan])
    const detailBarangLengkap = barangs
      .map((b) => `${b.nama} - ${b.jumlah} (${b.keterangan || "-"}) [${b.kemasan}]`)
      .join("\n");

    // Persiapkan data untuk Spreadsheet sesuai urutan 10 kolom baru
    const spreadsheetData = {
      sheetName: NAMA_SHEET,
      namaPemesan: namaPemesan,
      waPemesan: waPemesan,
      alamatPemesan: gabungkanAlamatPemesan(),
      detailPesanan: detailBarangLengkap,
      namaPenerima: samaDenganPemesan ? namaPemesan : namaPenerima,
      telpPenerima: samaDenganPemesan ? waPemesan : telpPenerima,
      alamatPenerima: gabungkanAlamatPenerima(),
      ekspedisi: ekspedisi,
    };

    try {
      // Kirim ke Google Sheets (Background)
      await fetch(SPREADSHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spreadsheetData),
      });
    } catch (error) {
      console.error("Gagal mengirim ke Spreadsheet:", error);
    }

    const url = `https://wa.me/${TUJUAN_WA}?text=${encodeURIComponent(previewText)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    setIsSubmitting(false);
    setPreviewOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div 
      className="min-h-screen w-full px-4 py-8 sm:py-12"
      onClick={() => setActiveDropdownId(null)}
    >
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center px-6 py-4 rounded-2xl glass-strong mb-5">
            <img
              src={logoWasilah}
              alt="Wasilah Medika"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Form Pemesanan Barang Wasilah
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Isi form di bawah, pesanan akan dikirim langsung via WhatsApp.
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 glass rounded-2xl p-4 flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span className="text-foreground/85">
              WhatsApp telah dibuka di tab baru. Klik kirim untuk menyelesaikan pesanan.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Data Pemesan */}
          <section className="glass-strong rounded-3xl p-6 sm:p-8 relative z-40">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Data Pemesan</h2>
                <p className="text-xs text-muted-foreground">
                  Informasi sales atau toko yang memesan
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2" data-error={!!errors.namaPemesan}>
                <FieldLabel icon={User} required>
                  Nama Pemesan (Sales / Toko)
                </FieldLabel>
                <input
                  type="text"
                  value={namaPemesan}
                  onChange={(e) => setNamaPemesan(e.target.value)}
                  placeholder="Mis. Toko Berkah / Pak Andi"
                  className={inputBase()}
                />
                {errors.namaPemesan && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.namaPemesan}
                  </p>
                )}
              </div>

              <div data-error={!!errors.tanggal}>
                <FieldLabel icon={CalendarDays} required>
                  Tanggal Pesanan
                </FieldLabel>
                <div className="relative">
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className={inputBase()}
                  />
                </div>
                {tanggal && !errors.tanggal && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {formatTanggalPanjang(tanggal)}
                  </p>
                )}
                {errors.tanggal && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.tanggal}</p>
                )}
              </div>

              <div data-error={!!errors.waPemesan}>
                <FieldLabel icon={Phone} required>
                  Nomor WA Pemesan
                </FieldLabel>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={waPemesan}
                  onChange={(e) =>
                    setWaPemesan(e.target.value.replace(/[^0-9+\s-]/g, ""))
                  }
                  placeholder="08xxxxxxxxxx"
                  className={inputBase()}
                />
                {errors.waPemesan && (
                  <p className="mt-1.5 text-xs text-destructive">
                    {errors.waPemesan}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-6" data-error={!!errors.alamatPemesan}>
                  <div>
                    <FieldLabel icon={MapPin} required>Alamat Lengkap (Jalan, No Rumah, RT/RW) Atau Tambahkan link Google Maps bila perlu</FieldLabel>
                    <textarea
                      value={alamatJalan}
                      onChange={(e) => setAlamatJalan(e.target.value)}
                      placeholder="Contoh: Jl. Goalpara No. 43, RT 01/02 / https://maps.app.goo.gl/..."
                      rows={2}
                      className={`${inputBase()} resize-none`}
                    />
                    {errors.alamatPemesan && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.alamatPemesan}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AreaSelect
                      id="prov-pemesan"
                      label="Provinsi"
                      placeholder="Pilih Provinsi"
                      options={provList}
                      value={provId}
                      activeId={activeDropdownId}
                      onToggle={setActiveDropdownId}
                      onChange={(id, name) => { setProvId(id); setProvName(name); }}
                    />
                    <AreaSelect
                      id="kota-pemesan"
                      label="Kota / Kabupaten"
                      placeholder="Pilih Kota/Kab"
                      options={kotaList}
                      value={kotaId}
                      disabled={!provId}
                      activeId={activeDropdownId}
                      onToggle={setActiveDropdownId}
                      onChange={(id, name) => { setKotaId(id); setKotaName(name); }}
                    />
                    <AreaSelect
                      id="kec-pemesan"
                      label="Kecamatan"
                      placeholder="Pilih Kecamatan"
                      options={kecList}
                      value={kecId}
                      disabled={!kotaId}
                      activeId={activeDropdownId}
                      onToggle={setActiveDropdownId}
                      onChange={(id, name) => { setKecId(id); setKecName(name); }}
                    />
                    <AreaSelect
                      id="desa-pemesan"
                      label="Desa / Kelurahan"
                      placeholder="Pilih Desa/Kel"
                      options={desaList}
                      value={desaId}
                      disabled={!kecId}
                      activeId={activeDropdownId}
                      onToggle={setActiveDropdownId}
                      onChange={(id, name) => { setDesaId(id); setDesaName(name); }}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Kode Pos (Opsional)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={kodePos}
                        onChange={(e) => setKodePos(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 43115"
                        className={inputBase()}
                      />
                    </div>
                  </div>
              </div>
            </div>
          </section>

          {/* Section 2: Detail Barang */}
          <section className="glass-strong rounded-3xl p-6 sm:p-8 relative z-30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Detail Barang</h2>
                  <p className="text-xs text-muted-foreground">
                    Tambahkan satu atau lebih barang
                  </p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full glass-subtle text-foreground/70">
                {barangs.length} item
              </span>
            </div>

            <div className="space-y-8">
              {barangs.map((b, i) => (
                <div key={b.id} className="relative" style={{ zIndex: 50 - i }}>
                  {i > 0 && (
                    <div className="flex items-center gap-3 mb-8 -mt-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                        Barang Berikutnya
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
                    </div>
                  )}
                  <div className="glass rounded-2xl p-5 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                      Barang #{i + 1}
                    </span>
                    {barangs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBarang(b.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-lg px-2.5 py-1.5 transition-colors"
                        aria-label="Hapus barang"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <div
                      className="sm:col-span-4"
                      data-error={!!errors[`barang_${i}_nama`]}
                    >
                      <FieldLabel required>Nama Barang</FieldLabel>
                      <ItemSearchInput
                        value={b.nama}
                        onChange={(v) => updateBarang(b.id, { nama: v })}
                        placeholder="Cari atau ketik nama barang..."
                      />
                      <a
                        href="https://grosiralkesindo.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Klik Untuk Melihat Detail Barang
                      </a>
                      {errors[`barang_${i}_nama`] && (
                        <p className="mt-1.5 text-xs text-destructive">
                          {errors[`barang_${i}_nama`]}
                        </p>
                      )}
                    </div>

                    <div
                      className="sm:col-span-2"
                      data-error={!!errors[`barang_${i}_jumlah`]}
                    >
                      <FieldLabel required>Jumlah</FieldLabel>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={b.jumlah}
                        onChange={(e) =>
                          updateBarang(b.id, { jumlah: e.target.value })
                        }
                        placeholder="Mis. 100 pcs"
                        className={inputBase()}
                      />
                      {errors[`barang_${i}_jumlah`] && (
                        <p className="mt-1.5 text-xs text-destructive">
                          {errors[`barang_${i}_jumlah`]}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-6">
                      <FieldLabel icon={Package} required>
                        Kemasan / Packing
                      </FieldLabel>
                      <CustomSelect
                        value={b.kemasan}
                        onChange={(val) => updateBarang(b.id, { kemasan: val })}
                        options={KEMASAN_OPSI}
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <FieldLabel>Keterangan</FieldLabel>
                      <textarea
                        value={b.keterangan}
                        onChange={(e) =>
                          updateBarang(b.id, { keterangan: e.target.value })
                        }
                        placeholder="Warna Matras, Jumlah yang di packing, waktu pengiriman, dan lainnya. (Tulis selengkapnya agar pesanan lebih cepat di proses)"
                        rows={2}
                        className={`${inputBase()} resize-none`}
                      />
                    </div>
                  </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addBarang}
                className="w-full glass rounded-2xl px-4 py-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-white/70 transition-all duration-200 border-dashed"
              >
                <Plus className="h-4 w-4" />
                Tambah Barang Lain
              </button>
            </div>
          </section>

          {/* Section 3: Penerima */}
          <section className="glass-strong rounded-3xl p-6 sm:p-8 relative z-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl glass-subtle flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Data Penerima</h2>
                <p className="text-xs text-muted-foreground">
                  Tujuan pengiriman barang
                </p>
              </div>
            </div>

            <label className="glass rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer select-none mb-5 hover:bg-white/70 transition-colors">
              <input
                type="checkbox"
                checked={samaDenganPemesan}
                onChange={(e) => setSamaDenganPemesan(e.target.checked)}
                className="h-4 w-4 rounded accent-primary"
              />
              <span className="text-sm text-foreground/85">
                Nama pemesan = Nama penerima
              </span>
            </label>

            {!samaDenganPemesan && (
              <div 
                className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
                onClick={() => setActiveDropdownId(null)}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div data-error={!!errors.namaPenerima}>
                    <FieldLabel icon={User} required>
                      Nama Penerima
                    </FieldLabel>
                    <input
                      type="text"
                      value={namaPenerima}
                      onChange={(e) => setNamaPenerima(e.target.value)}
                      placeholder="Nama lengkap penerima"
                      className={inputBase()}
                    />
                    {errors.namaPenerima && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.namaPenerima}
                      </p>
                    )}
                  </div>

                  <div data-error={!!errors.telpPenerima}>
                    <FieldLabel icon={Phone} required>
                      Nomor WA Penerima
                    </FieldLabel>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={telpPenerima}
                      onChange={(e) =>
                        setTelpPenerima(e.target.value.replace(/[^0-9+\s-]/g, ""))
                      }
                      placeholder="08xxxxxxxxxx"
                      className={inputBase()}
                    />
                    {errors.telpPenerima && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.telpPenerima}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-6" data-error={!!errors.alamatPenerima}>
                  <div>
                    <FieldLabel icon={MapPin} required>Alamat Tujuan (Jalan, No Rumah, RT/RW) Atau Tambahkan link Google Maps bila perlu</FieldLabel>
                    <textarea
                      value={alamatJalanPenerima}
                      onChange={(e) => setAlamatJalanPenerima(e.target.value)}
                      placeholder="Contoh: Jl. Goalpara No. 43, RT 01/02 / https://maps.app.goo.gl/..."
                      rows={2}
                      className={`${inputBase()} resize-none`}
                    />
                    {errors.alamatPenerima && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.alamatPenerima}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AreaSelect
                      id="prov-penerima"
                      label="Provinsi"
                      placeholder="Pilih Provinsi"
                      options={provList}
                      value={provIdPenerima}
                      activeId={activeDropdownId}
                      onToggle={setActiveDropdownId}
                      onChange={(id, name) => { setProvIdPenerima(id); setProvNamePenerima(name); }}
                    />
                    <AreaSelect
                      id="kota-penerima"
                      label="Kota / Kabupaten"
                      placeholder="Pilih Kota/Kab"
                      options={kotaListPenerima}
                      value={kotaIdPenerima}
                      disabled={!provIdPenerima}
                      activeId={activeDropdownId}
                      onToggle={setActiveDropdownId}
                      onChange={(id, name) => { setKotaIdPenerima(id); setKotaNamePenerima(name); }}
                    />
                    <AreaSelect
                      id="kec-penerima"
                      label="Kecamatan"
                      placeholder="Pilih Kecamatan"
                      options={kecListPenerima}
                      value={kecIdPenerima}
                      disabled={!kotaIdPenerima}
                      activeId={activeDropdownId}
                      onToggle={setActiveDropdownId}
                      onChange={(id, name) => { setKecIdPenerima(id); setKecNamePenerima(name); }}
                    />
                    <AreaSelect
                      id="desa-penerima"
                      label="Desa / Kelurahan"
                      placeholder="Pilih Desa/Kel"
                      options={desaListPenerima}
                      value={desaIdPenerima}
                      disabled={!kecIdPenerima}
                      activeId={activeDropdownId}
                      onToggle={setActiveDropdownId}
                      onChange={(id, name) => { setDesaIdPenerima(id); setDesaNamePenerima(name); }}
                    />
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Kode Pos Penerima (Opsional)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={kodePosPenerima}
                        onChange={(e) => setKodePosPenerima(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 43115"
                        className={inputBase()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <FieldLabel icon={Truck} required>
                Pilihan Ekspedisi
              </FieldLabel>
              <CustomSelect
                value={ekspedisi}
                onChange={(val) => setEkspedisi(val)}
                options={EKSPEDISI_OPSI}
              />
            </div>
          </section>

          {/* Submit */}
          <div className="glass-strong rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Periksa pesanan dulu sebelum dikirim ke WhatsApp Wasilah Medika.
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 text-sm font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
              Lihat Pratinjau Pesanan
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Form Pemesanan
        </p>
      </div>

      {/* Preview Modal */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
        >
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)}
          />
          <div className="relative w-full sm:max-w-lg glass-strong rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b border-white/40">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h2
                    id="preview-title"
                    className="text-base sm:text-lg font-semibold text-foreground"
                  >
                    Pratinjau Pesanan
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pastikan semua data sudah benar sebelum dikirim.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Tutup"
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-foreground/60 hover:bg-white/60 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              <div className="rounded-2xl bg-white/70 border border-white/60 p-4 shadow-inner">
                <pre className="whitespace-pre-wrap break-words font-sans text-[13px] leading-relaxed text-foreground/90">
                  {previewText}
                </pre>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground text-center">
                Format teks di atas akan dikirim langsung ke WhatsApp.
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-white/40 bg-white/30 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 glass-input hover:bg-white/80 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali Edit
              </button>
              <button
                type="button"
                onClick={sendNow}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Kirim Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
