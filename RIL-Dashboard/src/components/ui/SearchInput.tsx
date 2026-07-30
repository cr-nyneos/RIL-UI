import { Search, X } from 'lucide-react';
import TextField from './TextField';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ value, onChange, placeholder, className = '' }: SearchInputProps) {
  return (
    <TextField
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      size="md"
      leadingIcon={<Search size={17} strokeWidth={2.2} />}
      trailingAction={
        value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="flex h-5 w-5 items-center justify-center rounded-md text-ink-400 transition-colors duration-200 hover:text-ink-700"
          >
            <X size={15} strokeWidth={2.4} />
          </button>
        ) : undefined
      }
    />
  );
}
