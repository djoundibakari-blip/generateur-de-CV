import { useRef } from 'react'

export default function PersonalTab({ data, onChange }) {
  const fileRef = useRef()

  const handlePhoto = e => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onChange('photoUrl', url)
    onChange('photoFile', file)
  }

  const initials = [data.prenom?.[0], data.nom?.[0]].filter(Boolean).join('').toUpperCase()

  return (
    <div>
      {/* Photo */}
      <div className="photo-row">
        <div className="photo-circle" onClick={() => fileRef.current.click()}>
          {data.photoUrl
            ? <img src={data.photoUrl} alt="Photo de profil" />
            : <span>{initials || '+'}</span>
          }
        </div>
        <div className="photo-info">
          <button type="button" className="photo-btn" onClick={() => fileRef.current.click()}>
            {data.photoUrl ? 'Changer la photo' : 'Ajouter une photo'}
          </button>
          <span className="photo-hint">JPG, PNG — max 2 Mo</span>
        </div>
        <input
          ref={fileRef} type="file" accept="image/*"
          style={{ display: 'none' }} onChange={handlePhoto}
        />
      </div>

      {/* Name row */}
      <div className="row-2">
        <div className="field">
          <label className="field-label">Prénom <span>*</span></label>
          <input
            type="text" className="field-input"
            placeholder="Jean" value={data.prenom}
            onChange={e => onChange('prenom', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Nom <span>*</span></label>
          <input
            type="text" className="field-input"
            placeholder="Dupont" value={data.nom}
            onChange={e => onChange('nom', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Titre professionnel</label>
        <input
          type="text" className="field-input"
          placeholder="ex : Développeur Web Full-Stack" value={data.headline}
          onChange={e => onChange('headline', e.target.value)}
        />
      </div>

      <div className="row-2">
        <div className="field">
          <label className="field-label">Email</label>
          <input
            type="email" className="field-input"
            placeholder="jean@email.com" value={data.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field-label">Téléphone</label>
          <input
            type="tel" className="field-input"
            placeholder="06 00 00 00 00" value={data.telephone}
            onChange={e => onChange('telephone', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="field-label">Résumé professionnel</label>
        <textarea
          className="field-input"
          placeholder="Décrivez votre profil en quelques phrases…"
          value={data.resume}
          onChange={e => onChange('resume', e.target.value)}
          rows={4}
        />
      </div>
    </div>
  )
}
