import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { python } from '@codemirror/lang-python';

const theme = EditorView.theme({
  '&': { height: '100%', background: '#fff', color: '#292c2c', fontSize: '16px' },
  '.cm-scroller': {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    lineHeight: '1.7',
    overflow: 'auto',
  },
  '.cm-content': { padding: '14px 0', caretColor: '#40565c' },
  '.cm-line': { padding: '0 12px 0 6px' },
  '.cm-gutters': { background: '#f4f4f1', color: '#787c79', border: 'none', padding: '0 6px' },
  '.cm-activeLine': { background: '#eeeee980' },
  '.cm-activeLineGutter': { background: '#eeeee9' },
  '&.cm-focused': { outline: 'none' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': { background: '#dbe4e1' },
});

export default function Editor({ code, setCode, running, run }) {
  const host = useRef(null),
    view = useRef(null),
    editable = useRef(new Compartment());
  const onChange = useRef(setCode),
    onRun = useRef(run);
  onChange.current = setCode;
  onRun.current = run;
  useEffect(() => {
    view.current = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: code,
        extensions: [
          basicSetup,
          python(),
          theme,
          EditorState.tabSize.of(4),
          editable.current.of(EditorState.readOnly.of(false)),
          EditorView.contentAttributes.of({
            'aria-label': 'Python code editor',
            spellcheck: 'false',
          }),
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                onRun.current();
                return true;
              },
            },
            {
              key: 'Tab',
              run: (editor) => {
                if (editor.state.readOnly) return false;
                editor.dispatch(editor.state.replaceSelection('    '));
                return true;
              },
            },
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChange.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    return () => view.current.destroy();
  }, []);
  useEffect(() => {
    if (view.current && view.current.state.doc.toString() !== code) {
      view.current.dispatch({
        changes: { from: 0, to: view.current.state.doc.length, insert: code },
      });
    }
  }, [code]);
  useEffect(() => {
    view.current?.dispatch({
      effects: editable.current.reconfigure(EditorState.readOnly.of(running)),
    });
  }, [running]);
  return <div className="editor-host" ref={host} />;
}
