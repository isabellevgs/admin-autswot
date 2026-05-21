import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

const ITEM_CLASS =
  'flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 cursor-pointer hover:bg-violet-50 hover:text-violet-700 outline-none transition-colors'

const ITEM_DANGER_CLASS =
  'flex items-center gap-2 px-3 py-2 rounded-md text-red-600 cursor-pointer hover:bg-red-50 outline-none transition-colors'

function PessoaActionsMenu({ person, onOpenQuestionario, onOpenDiario, onEditPerguntas, onOpenReflexoes, onVerCadastro, onRedefinirSenha, onExcluirUsuario }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Ver detalhes"
        >
          <MoreHorizontal size={18} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white shadow-lg p-1 text-sm"
        >
          <DropdownMenu.Item onSelect={() => onOpenQuestionario(person)} className={ITEM_CLASS}>
            Ver SWOT
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => onOpenDiario(person)} className={ITEM_CLASS}>
            Ver diário
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => onEditPerguntas(person)} className={ITEM_CLASS}>
            Perguntas
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => onOpenReflexoes(person)} className={ITEM_CLASS}>
            Ver reflexões
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => onVerCadastro(person)} className={ITEM_CLASS}>
            Ver cadastro
          </DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => onRedefinirSenha(person)} className={ITEM_CLASS}>
            Redefinir senha
          </DropdownMenu.Item>
          {person.role !== 'SUPER_USER' && (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
              <DropdownMenu.Item onSelect={() => onExcluirUsuario(person)} className={ITEM_DANGER_CLASS}>
                Excluir usuário
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default PessoaActionsMenu
