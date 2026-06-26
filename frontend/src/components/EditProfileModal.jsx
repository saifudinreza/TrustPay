import { useState } from 'react'
import { Overlay, ModalCard, SubmitButton, label } from './TopUpModal.jsx'
import useAuth from '../hooks/useAuth.js'
import { T, FONT } from '../lib/theme.js'
import { UserIcon, MailIcon, PhoneIcon, AlertIcon } from './icons.jsx'

/**
 * EditProfileModal — form ubah data akun (nama, username, email, nomor HP).
 *
 * Memanggil useAuth().updateProfile → PUT /me. Error validasi backend (422)
 * ditampilkan per-field maupun sebagai banner umum.
 */
export default function EditProfileModal({ user, onClose, onDone }) {
  const { updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState((user?.username || '').replace(/^@/, ''))
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [errors, setErrors] = useState({})
  const [banner, setBanner] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = name.trim().length >= 2 && username.trim().length >= 3 && email.trim() !== '' && !submitting

  const submit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setErrors({})
    setBanner('')
    try {
      const updated = await updateProfile({ name: name.trim(), username: username.trim(), email: email.trim(), phone: phone.trim() })
      onDone?.(updated)
    } catch (e) {
      // Laravel 422: { errors: { field: [msg] } }
      if (e?.status === 422 && e?.data?.errors) {
        const flat = {}
        Object.entries(e.data.errors).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : v })
        setErrors(flat)
      } else {
        setBanner(e?.data?.message || 'Gagal memperbarui profil.')
      }
      setSubmitting(false)
    }
  }

  return (
    <Overlay onClose={onClose}>
      <ModalCard title="Edit Profil" icon={<UserIcon size={20} />} onClose={onClose} width={460}>
        {banner && (
          <div style={{ marginBottom: 16, padding: '11px 14px', borderRadius: 12, background: 'rgba(251,113,133,0.12)', border: '1px solid rgba(251,113,133,0.3)', display: 'flex', alignItems: 'center', gap: 9, color: T.outRose, fontSize: 13.5 }}>
            <AlertIcon size={16} /> {banner}
          </div>
        )}

        <Field label="Nama Lengkap" icon={<UserIcon size={17} />} value={name} onChange={setName} error={errors.name} placeholder="Nama kamu" />
        <Field label="Username" icon={<span style={{ fontFamily: FONT.mono, fontSize: 15 }}>@</span>} value={username} onChange={(v) => setUsername(v.replace(/[^a-zA-Z0-9_]/g, ''))} error={errors.username} placeholder="username" mono />
        <Field label="Email" icon={<MailIcon size={17} />} value={email} onChange={setEmail} error={errors.email} placeholder="email@contoh.com" />
        <Field label="Nomor HP" icon={<PhoneIcon size={17} />} value={phone} onChange={setPhone} error={errors.phone} placeholder="0812xxxxxxx (opsional)" mono last />

        <div style={{ marginTop: 22 }}>
          <SubmitButton enabled={canSubmit} onClick={submit}>
            {submitting ? 'Menyimpan…' : 'Simpan Perubahan'}
          </SubmitButton>
        </div>
      </ModalCard>
    </Overlay>
  )
}

function Field({ label: lbl, icon, value, onChange, error, placeholder, mono, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 14 }}>
      <label style={label}>{lbl}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 50, borderRadius: 12, border: `1.5px solid ${error ? T.outRose : T.border}`, background: T.surface2 }}>
        <span style={{ color: T.muted, display: 'flex' }}>{icon}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: mono ? FONT.mono : FONT.sans, fontSize: 15, color: T.ink }}
        />
      </div>
      {error && <div style={{ marginTop: 6, fontFamily: FONT.mono, fontSize: 12, color: T.outRose }}>{error}</div>}
    </div>
  )
}
