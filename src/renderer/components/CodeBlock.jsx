import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function CodeBlock({ language = 'javascript', value = '' }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        customStyle={{
          margin: 0,
          padding: '18px',
          background: '#09090b',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: '13px'
        }}
      >
        {String(value).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}
