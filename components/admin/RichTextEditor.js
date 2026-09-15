import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
  ],
};

const FORMATS = ['header', 'bold', 'italic', 'underline', 'list', 'link'];

export default function RichTextEditor({ value, onChange }) {
  return (
    <ReactQuill theme="snow" value={value || ''} onChange={onChange} modules={MODULES} formats={FORMATS} />
  );
}
