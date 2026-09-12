import { useState, useEffect } from 'react'
import { buscarUsuariosPorEmails } from '@/utils/appDataUtils'

export function useInfoPorEmail(emails) {
  const [infoPorEmail, setInfoPorEmail] = useState({})

  useEffect(() => {
    const emailsParaBuscar = emails
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && e.includes('@') && !(e in infoPorEmail))

    if (emailsParaBuscar.length === 0) return

    const timeout = setTimeout(async () => {
      setInfoPorEmail((prev) => {
        const marcado = { ...prev }
        emailsParaBuscar.forEach((email) => { marcado[email] = { carregando: true } })
        return marcado
      })

      const { usuarios, erro } = await buscarUsuariosPorEmails(emailsParaBuscar)

      setInfoPorEmail((prev) => {
        const atualizado = { ...prev }
        emailsParaBuscar.forEach((email) => {
          if (erro) {
            atualizado[email] = { carregando: false, erro }
            return
          }
          const dados = usuarios?.[email]
          atualizado[email] = dados
            ? { nome: dados.name, dataCadastro: dados.createdAt, carregando: false, erro: null }
            : { carregando: false, erro: null }
        })
        return atualizado
      })
    }, 600)

    return () => clearTimeout(timeout)
  }, [emails, infoPorEmail])

  return infoPorEmail
}
