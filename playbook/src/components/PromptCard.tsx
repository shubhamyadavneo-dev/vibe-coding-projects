import { useState } from 'react';

interface PromptCardProps {
  id: number;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
}

export default function PromptCard({
  title,
  prompt
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="prompt-card">
      <div className="card-header" style={{
        marginBottom: isExpanded ? '1rem' : '0'
      }}>
        <h3 className="card-title expandable"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >{title}</h3>
        <button
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          aria-label={copied ? "Copied!" : "Copy prompt"}
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span className="copy-text">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      <div className={`prompt-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <pre className="prompt-text">{prompt}</pre>
      </div>

      {/* <button
        className="expand-button"

      >
        {isExpanded ? 'Show Less' : 'Show Prompt'}
        <svg
          className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button> */}
    </div>
  );
}