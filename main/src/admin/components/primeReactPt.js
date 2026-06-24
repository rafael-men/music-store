export const inputClass = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors'
export const inputErrorClass = 'w-full bg-gray-800 border border-red-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors'
export const inputDisabledClass = 'w-full glass-card rounded-lg px-3 py-2 text-sm text-gray-500 placeholder-gray-700 cursor-not-allowed'
export const labelClass = 'block text-xs font-medium text-gray-400 mb-1.5'
export const errorClass = 'text-xs text-red-400 mt-1'

export const dropdownPt = {
  root: { className: 'w-full h-[38px] bg-gray-800 border border-gray-700 rounded-lg flex items-center hover:border-gray-600 focus-within:border-gray-500 transition-colors' },
  input: { className: 'bg-transparent border-0 text-white text-sm px-3 flex-1 focus:outline-none focus:shadow-none' },
  trigger: { className: 'text-gray-500 w-8 flex items-center justify-center shrink-0' },
  clearIcon: { className: 'text-gray-500 mr-2 cursor-pointer hover:text-gray-300' },
  panel: { className: 'glass-popover rounded-lg mt-1 overflow-hidden' },
  list: { className: 'list-none m-0 p-1' },
  item: ({ context }) => ({
    className: `text-sm px-3 py-2 cursor-pointer list-none rounded ${
      context?.disabled
        ? 'text-gray-600 opacity-50 cursor-not-allowed'
        : 'text-gray-200 hover:bg-white/10'
    }`,
  }),
}

export const multiSelectPt = {
  root: { className: 'w-full min-h-[38px] bg-gray-800 border border-gray-700 rounded-lg flex items-center hover:border-gray-600 focus-within:border-gray-500 transition-colors' },
  labelContainer: { className: 'flex-1 min-w-0 overflow-hidden' },
  label: { className: 'bg-transparent text-white text-sm px-3 py-2 truncate' },
  trigger: { className: 'text-gray-500 w-8 flex items-center justify-center shrink-0' },
  panel: { className: 'glass-popover rounded-lg mt-1 overflow-hidden' },
  list: { className: 'list-none m-0 p-1 max-h-64 overflow-y-auto' },
  item: ({ context }) => ({
    className: `text-sm px-3 py-2 cursor-pointer list-none flex items-center gap-2.5 transition-colors rounded ${
      context?.selected
        ? 'bg-white/10 text-white font-medium'
        : 'text-gray-200 hover:bg-gray-800'
    }`,
  }),
  header: { className: 'flex items-center px-2 py-2 border-b border-gray-800 bg-gray-900' },
  headerCheckboxContainer: { className: 'hidden' },
  filterContainer: { className: 'relative flex-1' },
  filterInput: { className: 'w-full bg-gray-800 border border-gray-700 rounded-md pl-3 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500' },
  filterIcon: { className: 'hidden' },
  closeButton: { className: 'hidden' },
  checkboxContainer: { className: 'flex items-center justify-center shrink-0' },
  checkbox: {
    root: ({ context }) => ({
      className: `w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shrink-0 ${
        context?.checked ? 'bg-white border-white' : 'bg-transparent border-gray-500'
      }`,
    }),
    input: { className: 'absolute opacity-0 w-0 h-0 pointer-events-none' },
    icon: { className: 'text-black w-3 h-3' },
  },
}

export const numberInputPt = {
  root: { className: 'w-full' },
  input: { root: { className: inputClass } },
  buttonGroup: { className: 'hidden' },
}

export const dialogPt = (maxWidth = 'max-w-md') => ({
  mask: { className: 'bg-black/70 backdrop-blur-sm' },
  root: { className: `w-full ${maxWidth} mx-4 max-h-[90vh]` },
  content: { className: 'glass-popover rounded-2xl overflow-hidden p-0 flex flex-col max-h-[90vh]' },
})
