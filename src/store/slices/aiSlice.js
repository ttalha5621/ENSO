import { createSlice, nanoid } from '@reduxjs/toolkit';

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    open: false,
    tab: 'explain', // explain | ask
    subject: null, // { kind: feature|layer|map|selection, id, title, breadcrumb: [] }
    requestId: 0,
    messages: [], // assistant conversation { id, role, text, error? }
  },
  reducers: {
    explain: (s, a) => {
      s.open = true;
      s.tab = 'explain';
      s.subject = a.payload;
      s.requestId += 1;
    },
    openAssistant: (s) => {
      s.open = true;
      s.tab = 'ask';
    },
    setTab: (s, a) => void (s.tab = a.payload),
    closeAI: (s) => void (s.open = false),
    addMessage: {
      reducer: (s, a) => {
        s.messages.push(a.payload);
        if (s.messages.length > 40) s.messages.shift();
      },
      prepare: (msg) => ({ payload: { id: nanoid(), ...msg } }),
    },
    clearMessages: (s) => void (s.messages = []),
  },
});

export const { explain, openAssistant, setTab, closeAI, addMessage, clearMessages } = aiSlice.actions;
export default aiSlice.reducer;
