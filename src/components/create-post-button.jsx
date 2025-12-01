function CreatePostButton({ onClick }) {
  return (
    <button
      type="button"
      className="rounded-2xl border-2 border-dashed border-violet-300 bg-white hover:border-violet-400 hover:bg-violet-50 transition cursor-pointer flex flex-col items-center justify-center text-violet-700 py-10"
      onClick={onClick}
    >
      <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-violet-100 text-violet-700 text-3xl leading-none">
        +
      </span>
      <span className="mt-3 font-medium">criar</span>
    </button>
  )
}

export default CreatePostButton

