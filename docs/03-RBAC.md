# 03 — Role-Based Access Control (RBAC) + Scoped Authorization

## Prinsip
Satu akun (`uid` Firebase Auth) dapat memiliki beberapa role assignment; setiap assignment memuat `eventId` dan scope cabang/kecamatan/golongan. Akses ditentukan dari **role aktif di dokumen yang hanya dapat ditulis admin/Worker**, tidak dari field profile yang bisa diedit user. Semua pengguna panitia diberi `contributor` terpisah bila diizinkan.

## Daftar peran
- `super_admin`: bootstrap/konfigurasi sistem dan role, view audit, tata kelola. Bukan hak bypass otomatis di semua proses bisnis tanpa audit.
- `event_admin`: konfigurasi event; verify registrasi; approve hasil; laporan.
- `oversight`: akses laporan internal read-only dengan batas event; tidak menulis hasil.
- `kafilah_admin`: create/edit pendaftaran milik `districtIds` dan event ditugaskan; tidak approve sendiri.
- `branch_admin`: view daftar peserta cabang, jadwal, input `result_submissions` hanya `branchIds` yang ditugaskan; tidak approve hasil.
- `verifier`: verifikasi berkas/pendaftaran; tidak berhak approve hasil atau role.
- `editor`: moderasi dan publikasi berita/foto; tidak mengubah hasil.
- `contributor`: mengirim artikel dan foto draft; tidak publish langsung.
- `public`: non-authenticated, read-only materi yang sudah published.

## Matriks permission
| Resource/action | Super Admin | Event Admin | Kafilah Admin | Branch Admin | Verifier | Editor | Contributor | Public |
|---|---|---|---|---|---|---|---|---|
| Konfigurasi peran | Ya | Delegasi terbatas | - | - | - | - | - | - |
| Master cabang/golongan | Ya | Ya | Lihat | Lihat | Lihat | Lihat | Lihat | Lihat-publik |
| Registrasi peserta | Ya | Ya | Tulis-scope | Lihat-scope | Tinjau | - | - | Tidak |
| Status verifikasi | Ya | Ya | Lihat | Lihat-scope | Tulis | - | - | Tidak |
| Input hasil juara | Ya | Override-audit | - | Tulis-scope | - | - | - | Tidak |
| Pengesahan hasil | Ya | Ya | - | - | - | - | - | Tidak |
| Lihat hasil disahkan | Ya | Ya | Ya | Ya | Ya | Ya | Ya | Ya |
| Tulis berita draft | Ya | Ya | Jika contributor | Jika contributor | Jika contributor | Ya | Ya | Tidak |
| Publish berita | Ya | Ya jika diizinkan | - | - | - | Ya | - | Tidak |
| Lihat data analitik internal | Ya | Ya | Scope | Scope | Scope | Publikasi | Ringkas | Publik saja |
| Lihat data pribadi peserta | Sesuai tugas | Sesuai tugas | Scope | Minimal perlu | Scope | Tidak | Tidak | Tidak |

## Aturan operasional
1. **Separation of duties**: branch admin mengajukan, event admin berbeda yang mengesahkan. Jika kekurangan SDM, override super_admin wajib alasan dan audit.
2. **Scope-aware views**: data yang tidak boleh dilihat tidak pernah di-query; bukan sekadar disembunyikan.
3. **Revocation**: akun disabled atau assignment dicabut harus segera menolak write berikutnya; token lama tetap diverifikasi terhadap dokumen role terkini.
4. **Multi-role**: union dari izin yang valid tetapi pembatasan PII tetap berdasar kebutuhan kerja; prioritas prinsip least privilege.
5. **Bootstrap**: buat user Auth pertama melalui konsol resmi Firebase dan role pada Firestore dengan aksi admin yang aman/manual; jangan buka endpoint `create-super-admin` ke publik.
6. **Self-registration**: bila diaktifkan, akun baru hanya status `pending` tanpa role sampai disetujui. Tidak ada role escalation otomatis.
7. **Akun khusus**: satu akun per orang; dilarang berbagi kata sandi akun admin cabang.

## Pseudocode authorization
```ts
type Assignment = {
  role: 'super_admin'|'event_admin'|'oversight'|'kafilah_admin'|'branch_admin'|'verifier'|'editor'|'contributor';
  eventId: string;
  districtIds?: string[];
  branchIds?: string[];
  divisionIds?: string[];
  status: 'active'|'suspended';
};

function canSubmitResult(roles: Assignment[], eventId: string, branchId: string) {
  return roles.some(r => r.status === 'active' && r.eventId === eventId &&
    r.role === 'branch_admin' && r.branchIds?.includes(branchId));
}
```
Pseudocode **bukan** pengganti Firestore Rules/Worker verification; `roleAssignments` harus didapat dari sumber server-trust.
