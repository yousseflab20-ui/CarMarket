import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  defaultLabel: string;
  placeholder?: string;
  icon?: any;
}

export const SearchableSelect = ({
  value,
  onChange,
  options,
  defaultLabel,
  placeholder = "Search...",
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 transition-all cursor-pointer min-w-[140px]"
      >
        <span className="truncate max-w-[100px]">
          {value === "ALL" ? defaultLabel : value}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg">
              <Search size={14} className="text-slate-400" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
            {/* Default "ALL" Option */}
            <div
              onClick={() => {
                onChange("ALL");
                setIsOpen(false);
                setSearchTerm("");
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-bold transition-colors ${
                value === "ALL" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {defaultLabel}
              {value === "ALL" && <Check size={14} />}
            </div>

            {/* Filtered Options */}
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400 font-medium">
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-bold transition-colors ${
                    value === opt ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate pr-4">{opt}</span>
                  {value === opt && <Check size={14} className="shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
