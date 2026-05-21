import {
  formatRegistrationAnswer,
  getVisibleRegistrationFields,
} from '@/constants/registrationSections'

function ProfileRegistrationDisplay({ registration }) {
  const sections = getVisibleRegistrationFields(registration)

  if (!registration || sections.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic py-4 text-center">
        Nenhuma informação de cadastro disponível para este usuário.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-slate-800 mb-3 pb-1 border-b border-slate-100">
            {section.title}
          </h3>
          <dl className="space-y-3">
            {section.fields.map((field) => (
              <div key={field.key} className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_1.2fr] sm:gap-4">
                <dt className="text-xs font-medium text-slate-500">{field.label}</dt>
                <dd className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {formatRegistrationAnswer(field, registration[field.key])}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

export default ProfileRegistrationDisplay
