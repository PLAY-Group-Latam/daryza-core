import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableCell, TableHeader } from '@tiptap/extension-table';
import { ResizableTableColumn } from './ResizableTableColumn';
import { ResizableTableRow } from './ResizableTableRow';

const errors = [];
window.onerror = (m) => errors.push(String(m));

document.body.innerHTML = '<div id="host" style="width:800px"></div>';

const editor = new Editor({
  element: document.getElementById('host'),
  content: '',
  extensions: [
    StarterKit.configure({ heading: { levels: [1,2,3,4] } }),
    TextAlign.configure({ types: ['heading', 'paragraph', 'tableCell', 'tableHeader'] }),
    Table.configure({ resizable: false, cellMinWidth: 40 }),
    ResizableTableRow,
    ResizableTableColumn,
    TableHeader,
    TableCell,
  ],
});

editor.commands.insertContentAt(0, {
  type: 'table',
  content: [
    { type: 'tableRow', content: [
      { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'AAAA' }] }] },
      { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'BBBB' }] }] },
    ] },
    { type: 'tableRow', content: [
      { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }] },
      { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'b' }] }] },
    ] },
  ],
});

const th = document.querySelector('th');
const rect = th.getBoundingClientRect();
const y = rect.top + rect.height / 2;
const sx = rect.right - 3;
for (const [type, x] of [['mousemove', sx], ['mousedown', sx], ['mousemove', sx + 150], ['mouseup', sx + 150]]) {
  th.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, which: 1 }));
}

const colwidth = JSON.stringify(editor.state.doc.firstChild.firstChild.firstChild.attrs.colwidth);
const cols = Array.from(document.querySelectorAll('col')).map(c => c.style.width);
document.title = JSON.stringify({ colwidth, cols, errors });
