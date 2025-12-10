function CardPessoas({ person, onOpenQuestionario, onOpenDiario, onEditPerguntas }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5 bg-white">
        <p className="font-semibold text-slate-900 text-lg mb-4">{person.name}</p>
        
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onOpenQuestionario(person)}
            className="w-full px-4 py-2 rounded-md border border-violet-600 bg-transparent text-violet-600 hover:bg-violet-600 hover:text-white transition-colors text-sm font-medium"
          >
            Respostas do questionário
          </button>
          
          <button
            type="button"
            onClick={() => onOpenDiario(person)}
            className="w-full px-4 py-2 rounded-md border border-violet-600 bg-transparent text-violet-600 hover:bg-violet-600 hover:text-white transition-colors text-sm font-medium"
          >
            Ver diário
          </button>
          
          <button
            type="button"
            onClick={() => onEditPerguntas(person)}
            className="w-full px-4 py-2 rounded-md border border-violet-600 bg-transparent text-violet-600 hover:bg-violet-600 hover:text-white transition-colors text-sm font-medium"
          >
            Perguntas
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardPessoas
